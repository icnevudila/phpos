import { HmoClaimStatus, InvoiceStatus, Prisma, type PaymentMethod } from "@prisma/client";

import { emitInvoiceEvent } from "../events/invoiceEvents.js";
import { isPgBouncerSingleConnection } from "../lib/dbTasks.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";
import { computePhStatutoryDiscounts } from "../utils/phStatutoryDiscount.js";
import type {
  CreateInvoiceBody,
  CreatePaymentBody,
  ListInvoicesQuery,
  PaymongoBody,
  UpdateInvoiceBody,
} from "../validation/invoice.schemas.js";

const MONEY_SCALE = 100;

type PhDiscountPatient = { isSeniorCitizen: boolean; pwdIdNo: string | null };

/** RA 10754 (PWD) / RA 9994 (senior): uygunlukta alt toplam üzerinden %20’ye kadar taban indirim. */
/*
function _phStatutoryDiscountCents(subtotalCents: number, p: PhDiscountPatient): number {
  const pwdOk = (p.pwdIdNo?.trim().length ?? 0) > 0;
  const seniorOk = p.isSeniorCitizen;
  if (!pwdOk && !seniorOk) return 0;
  return Math.floor(subtotalCents * 0.2);
}
*/

async function loadPatientDiscountFlags(
  clinicId: string,
  patientId: string,
): Promise<PhDiscountPatient> {
  const row = await prisma.patient.findFirst({
    where: { id: patientId, clinicId },
    select: { isSeniorCitizen: true, pwdIdNo: true },
  });
  return {
    isSeniorCitizen: row?.isSeniorCitizen ?? false,
    pwdIdNo: row?.pwdIdNo ?? null,
  };
}

function toCents(d: Prisma.Decimal | string | number): number {
  return Math.round(Number(d) * MONEY_SCALE);
}
function fromCents(c: number): Prisma.Decimal {
  return new Prisma.Decimal((c / MONEY_SCALE).toFixed(2));
}

async function nextOrNumber(tx: Prisma.TransactionClient, clinicId: string): Promise<string> {
  const year = new Date().getFullYear();
  const seq = await tx.orSequence.upsert({
    where: { clinicId_year: { clinicId, year } },
    update: { lastNumber: { increment: 1 } },
    create: { clinicId, year, lastNumber: 1 },
    select: { lastNumber: true },
  });
  return `OR-${year}-${String(seq.lastNumber).padStart(4, "0")}`;
}

const publicSelect = {
  id: true,
  clinicId: true,
  patientId: true,
  appointmentId: true,
  orNumber: true,
  subtotal: true,
  discount: true,
  vatRate: true,
  vatAmount: true,
  seniorDiscount: true,
  pwdDiscount: true,
  vatExempt: true,
  total: true,
  status: true,
  notes: true,
  dueDate: true,
  paidAt: true,
  externalRef: true,
  createdAt: true,

  patient: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      address: true,
      city: true,
      philhealthNo: true,
      isSeniorCitizen: true,
      oscaIdNo: true,
      pwdIdNo: true,
    },
  },
  appointment: {
    select: {
      id: true,
      scheduledAt: true,
      duration: true,
      type: true,
      status: true,
      dentist: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  },
  payments: {
    orderBy: { paidAt: "asc" as const },
    select: {
      id: true,
      amount: true,
      method: true,
      referenceNo: true,
      notes: true,
      paidAt: true,
    },
  },
  hmoClaims: {
    select: {
      id: true,
      status: true,
      claimNumber: true,
      provider: { select: { name: true, code: true } },
    },
  },
} satisfies Prisma.InvoiceSelect;

type InvoiceRow = Prisma.InvoiceGetPayload<{ select: typeof publicSelect }>;

async function loadTreatments(invoiceId: string, appointmentId: string | null) {
  // Try to load from snapshot (InvoiceItem) first
  const items = await prisma.invoiceItem.findMany({
    where: { invoiceId },
    orderBy: { id: "asc" },
  });
  if (items.length > 0) {
    return items.map(i => ({
      id: i.id,
      procedure: i.procedure,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      toothIds: [] as string[], // We don't store toothIds in InvoiceItem yet, maybe we should?
      notes: null as string | null,
    }));
  }

  // Fallback to live treatments (for backward compatibility during migration)
  if (!appointmentId) return [];
  return prisma.treatment.findMany({
    where: { appointmentId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      procedure: true,
      toothIds: true,
      quantity: true,
      unitPrice: true,
      notes: true,
    },
  });
}

function toDto(row: InvoiceRow, treatments: Awaited<ReturnType<typeof loadTreatments>>) {
  const paidCents = row.payments.reduce((sum, p) => sum + toCents(p.amount), 0);
  const totalCents = toCents(row.total);
  const balanceCents = Math.max(0, totalCents - paidCents);
  return {
    id: row.id,
    clinicId: row.clinicId,
    patientId: row.patientId,
    appointmentId: row.appointmentId,
    orNumber: row.orNumber,
    subtotal: row.subtotal.toFixed(2),
    discount: row.discount.toFixed(2),
    vatRate: row.vatRate.toFixed(4),
    vatAmount: row.vatAmount.toFixed(2),
    seniorDiscount: row.seniorDiscount.toFixed(2),
    pwdDiscount: row.pwdDiscount.toFixed(2),
    vatExempt: row.vatExempt,
    total: row.total.toFixed(2),
    paid: (paidCents / MONEY_SCALE).toFixed(2),
    balance: (balanceCents / MONEY_SCALE).toFixed(2),

    status: row.status,
    notes: row.notes,
    dueDate: row.dueDate?.toISOString() ?? null,
    paidAt: row.paidAt?.toISOString() ?? null,
    externalRef: row.externalRef,
    createdAt: row.createdAt.toISOString(),
    patient: {
      ...row.patient,
      fullName: `${row.patient.firstName} ${row.patient.lastName}`.trim(),
    },
    appointment: row.appointment
      ? {
          id: row.appointment.id,
          scheduledAt: row.appointment.scheduledAt.toISOString(),
          duration: row.appointment.duration,
          type: row.appointment.type,
          status: row.appointment.status,
          dentist: {
            id: row.appointment.dentist.id,
            fullName:
              `${row.appointment.dentist.firstName} ${row.appointment.dentist.lastName}`.trim(),
          },
        }
      : null,
    treatments: treatments.map((t) => ({
      id: t.id,
      procedure: t.procedure,
      toothIds: t.toothIds,
      quantity: t.quantity,
      unitPrice: t.unitPrice.toFixed(2),
      lineTotal: (toCents(t.unitPrice) * t.quantity / MONEY_SCALE).toFixed(2),
      notes: t.notes,
    })),
    payments: row.payments.map((p) => ({
      id: p.id,
      amount: p.amount.toFixed(2),
      method: p.method,
      referenceNo: p.referenceNo,
      notes: p.notes,
      paidAt: p.paidAt.toISOString(),
    })),
    hmoClaims: row.hmoClaims.map((c) => ({
      id: c.id,
      status: c.status,
      claimNumber: c.claimNumber,
      providerName: c.provider.name,
      providerCode: c.provider.code,
    })),
  };
}

export type InvoiceDto = ReturnType<typeof toDto>;

export async function listInvoices(
  clinicId: string,
  query: ListInvoicesQuery,
): Promise<InvoiceDto[]> {
  const where: Prisma.InvoiceWhereInput = { clinicId };
  if (query.patientId) where.patientId = query.patientId;
  if (query.status) where.status = query.status;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(`${query.from}T00:00:00+08:00`);
    if (query.to) {
      const end = new Date(`${query.to}T00:00:00+08:00`);
      end.setUTCDate(end.getUTCDate() + 1);
      where.createdAt.lt = end;
    }
  }
  const trimmed = query.q?.trim();
  if (trimmed) {
    where.OR = [
      { orNumber: { contains: trimmed, mode: "insensitive" } },
      { patient: { firstName: { contains: trimmed, mode: "insensitive" } } },
      { patient: { lastName: { contains: trimmed, mode: "insensitive" } } },
      { patient: { phone: { contains: trimmed } } },
    ];
  }

  if (query.openHmoClaim === "1" || query.openHmoClaim === "true") {
    where.hmoClaims = {
      some: {
        status: {
          in: [
            HmoClaimStatus.DRAFT,
            HmoClaimStatus.SUBMITTED,
            HmoClaimStatus.PARTIAL_APPROVED,
          ],
        },
      },
    };
  }

  const rows = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: publicSelect,
  });

  if (isPgBouncerSingleConnection()) {
    const dtos = [];
    for (const r of rows) {
      dtos.push(await toDto(r, await loadTreatments(r.id, r.appointmentId)));
    }
    return dtos;
  }

  const dtos = await Promise.all(
    rows.map(async (r) => toDto(r, await loadTreatments(r.id, r.appointmentId))),
  );
  return dtos;
}

export async function getInvoice(clinicId: string, id: string): Promise<InvoiceDto> {
  const row = await prisma.invoice.findFirst({
    where: { id, clinicId },
    select: publicSelect,
  });
  if (!row) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  const treatments = await loadTreatments(row.id, row.appointmentId);
  return toDto(row, treatments);
}

export async function createInvoice(
  clinicId: string,
  body: CreateInvoiceBody,
): Promise<InvoiceDto> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: body.appointmentId, clinicId },
    select: { id: true, patientId: true, invoice: { select: { id: true } } },
  });
  if (!appointment) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  if (appointment.invoice) {
    throw new AppError("Invoice already exists for this appointment", 409, "INVOICE_EXISTS");
  }

  const treatments = await prisma.treatment.findMany({
    where: { appointmentId: appointment.id },
    select: { quantity: true, unitPrice: true },
  });
  if (treatments.length === 0) {
    throw new AppError("Add at least one treatment before invoicing", 409, "NO_TREATMENTS");
  }

  const subtotalCents = treatments.reduce(
    (sum, t) => sum + toCents(t.unitPrice) * t.quantity,
    0,
  );
  const ph = await loadPatientDiscountFlags(clinicId, appointment.patientId);
  const statutory = computePhStatutoryDiscounts(subtotalCents, ph);
  const { seniorDiscountCents, pwdDiscountCents, statutoryDiscountCents: statutoryCents, vatExempt } =
    statutory;
  const manualCents = body.discount ? Math.round(body.discount * MONEY_SCALE) : 0;
  const discountCents = Math.min(subtotalCents, Math.max(manualCents, statutoryCents));
  const vatRate = vatExempt ? 0 : 0.12;
  const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
  const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);


  const invoice = await prisma.$transaction(async (tx) => {
    const orNumber = await nextOrNumber(tx, clinicId);
    const inv = await tx.invoice.create({
      data: {
        clinicId,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        orNumber,
        subtotal: fromCents(subtotalCents),
        discount: fromCents(discountCents),
        vatRate: new Prisma.Decimal(vatRate.toFixed(4)),
        vatAmount: fromCents(vatAmountCents),
        seniorDiscount: fromCents(seniorDiscountCents),
        pwdDiscount: fromCents(pwdDiscountCents),
        vatExempt,
        total: fromCents(totalCents),
        status: InvoiceStatus.UNPAID,
        notes: body.notes ?? null,
        dueDate: body.dueDate,
      },
    });

    // Create Snapshots
    const treatmentRows = await tx.treatment.findMany({
      where: { appointmentId: appointment.id },
    });
    await tx.invoiceItem.createMany({
      data: treatmentRows.map((t) => ({
        invoiceId: inv.id,
        procedure: t.procedure,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        total: fromCents(toCents(t.unitPrice) * t.quantity),
      })),
    });

    return tx.invoice.findUnique({
      where: { id: inv.id },
      select: publicSelect,
    }) as Promise<InvoiceRow>;
  });

  return toDto(invoice, await loadTreatments(invoice.id, invoice.appointmentId));
}

export async function updateInvoice(
  clinicId: string,
  id: string,
  body: UpdateInvoiceBody,
): Promise<InvoiceDto> {
  const existing = await prisma.invoice.findFirst({
    where: { id, clinicId },
    select: { id: true, subtotal: true, status: true, patientId: true },
  });
  if (!existing) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  if (existing.status === InvoiceStatus.PAID) {
    throw new AppError("Paid invoices cannot be edited", 409, "INVOICE_LOCKED");
  }

  const data: Prisma.InvoiceUpdateInput = {};
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.dueDate !== undefined) data.dueDate = body.dueDate;
  if (body.discount !== undefined) {
    const subtotalCents = toCents(existing.subtotal);
    const ph = await loadPatientDiscountFlags(clinicId, existing.patientId);
    const statutory = computePhStatutoryDiscounts(subtotalCents, ph);
    const { seniorDiscountCents, pwdDiscountCents, statutoryDiscountCents: statutoryCents, vatExempt } =
      statutory;
    let discountCents = Math.round(body.discount * MONEY_SCALE);
    discountCents = Math.min(subtotalCents, Math.max(discountCents, statutoryCents));
    const vatRate = vatExempt ? 0 : 0.12;
    const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
    const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);
    data.discount = fromCents(discountCents);
    data.seniorDiscount = fromCents(seniorDiscountCents);
    data.pwdDiscount = fromCents(pwdDiscountCents);
    data.vatRate = new Prisma.Decimal(vatRate.toFixed(4));
    data.vatAmount = fromCents(vatAmountCents);
    data.vatExempt = vatExempt;
    data.total = fromCents(totalCents);
  }


  await prisma.invoice.update({ where: { id }, data });
  return getInvoice(clinicId, id);
}

/**
 * Appointment içindeki tüm treatment satırlarını invoice'a aktarır.
 * - Invoice yoksa oluşturur (UNPAID)
 * - Invoice varsa subtotal/total değerlerini treatment toplamına göre yeniden hesaplar
 * - İndirim: mevcut manuel indirim korunur; Senior/PWD için taban %20 üstünde olacak şekilde yükseltilir
 */
export async function finalizeTreatmentsToInvoice(
  clinicId: string,
  appointmentId: string,
): Promise<InvoiceDto> {
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, clinicId },
    select: { id: true, patientId: true, status: true },
  });
  if (!appt) throw new AppError("Appointment not found", 404, "APPOINTMENT_NOT_FOUND");
  if (appt.status === "CANCELLED") {
    throw new AppError("Cancelled appointment cannot be finalized", 409, "APPOINTMENT_CANCELLED");
  }

  const treatments = await prisma.treatment.findMany({
    where: { appointmentId: appt.id },
    select: { quantity: true, unitPrice: true },
  });
  if (treatments.length === 0) {
    throw new AppError("No treatments to finalize", 409, "NO_TREATMENTS");
  }

  const subtotalCents = treatments.reduce(
    (sum, t) => sum + toCents(t.unitPrice) * t.quantity,
    0,
  );

  const ph = await loadPatientDiscountFlags(clinicId, appt.patientId);
  const statutory = computePhStatutoryDiscounts(subtotalCents, ph);
  const { seniorDiscountCents, pwdDiscountCents, statutoryDiscountCents: statutoryCents, vatExempt } =
    statutory;
  const vatRate = vatExempt ? 0 : 0.12;

  const existing = await prisma.invoice.findFirst({
    where: { clinicId, appointmentId: appt.id },
    select: {
      id: true,
      discount: true,
      payments: { select: { amount: true } },
    },
  });

  if (!existing) {
    const discountCents = Math.min(subtotalCents, statutoryCents);
    const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
    const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);
    const created = await prisma.$transaction(async (tx) => {
      const orNumber = await nextOrNumber(tx, clinicId);
      const inv = await tx.invoice.create({
        data: {
          clinicId,
          patientId: appt.patientId,
          appointmentId: appt.id,
          orNumber,
          subtotal: fromCents(subtotalCents),
          discount: fromCents(discountCents),
          vatRate: new Prisma.Decimal(vatRate.toFixed(4)),
          vatAmount: fromCents(vatAmountCents),
          seniorDiscount: fromCents(seniorDiscountCents),
          pwdDiscount: fromCents(pwdDiscountCents),
          vatExempt,
          total: fromCents(totalCents),
          status: InvoiceStatus.UNPAID,
        },
      });

      // Create Snapshots
      const treatmentRows = await tx.treatment.findMany({
        where: { appointmentId: appt.id },
      });
      await tx.invoiceItem.createMany({
        data: treatmentRows.map((t) => ({
          invoiceId: inv.id,
          procedure: t.procedure,
          quantity: t.quantity,
          unitPrice: t.unitPrice,
          total: fromCents(toCents(t.unitPrice) * t.quantity),
        })),
      });

      return tx.invoice.findUnique({
        where: { id: inv.id },
        select: publicSelect,
      }) as Promise<InvoiceRow>;
    });
    return toDto(created, await loadTreatments(created.id, created.appointmentId));
  }

  const discountCents = Math.min(
    subtotalCents,
    Math.max(toCents(existing.discount), statutoryCents),
  );
  const vatAmountCents = vatExempt ? 0 : Math.round((subtotalCents - discountCents) * vatRate);
  const totalCents = Math.max(0, subtotalCents - discountCents + vatAmountCents);
  const paidCents = existing.payments.reduce((sum, p) => sum + toCents(p.amount), 0);
  const fullyPaid = paidCents >= totalCents && totalCents > 0;
  const partialPaid = paidCents > 0 && paidCents < totalCents;
  const status = fullyPaid
    ? InvoiceStatus.PAID
    : partialPaid
      ? InvoiceStatus.PARTIAL
      : InvoiceStatus.UNPAID;

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: existing.id },
      data: {
        subtotal: fromCents(subtotalCents),
        discount: fromCents(discountCents),
        vatRate: new Prisma.Decimal(vatRate.toFixed(4)),
        vatAmount: fromCents(vatAmountCents),
        seniorDiscount: fromCents(seniorDiscountCents),
        pwdDiscount: fromCents(pwdDiscountCents),
        vatExempt,
        total: fromCents(totalCents),
        status,
        paidAt: fullyPaid ? new Date() : null,
      },
    });

    // Refresh Snapshots
    await tx.invoiceItem.deleteMany({ where: { invoiceId: existing.id } });
    const treatmentRows = await tx.treatment.findMany({
      where: { appointmentId: appt.id },
    });
    await tx.invoiceItem.createMany({
      data: treatmentRows.map((t) => ({
        invoiceId: existing.id,
        procedure: t.procedure,
        quantity: t.quantity,
        unitPrice: t.unitPrice,
        total: fromCents(toCents(t.unitPrice) * t.quantity),
      })),
    });
  });

  return getInvoice(clinicId, existing.id);
}

export async function addPayment(
  clinicId: string,
  invoiceId: string,
  body: CreatePaymentBody,
  userId: string,
): Promise<InvoiceDto> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, clinicId },
    select: {
      id: true,
      total: true,
      status: true,
      payments: { select: { amount: true } },
    },
  });
  if (!invoice) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  if (invoice.status === InvoiceStatus.PAID) {
    throw new AppError("Invoice already paid", 409, "INVOICE_PAID");
  }

  const methodsRequiringRef: PaymentMethod[] = ["GCASH", "MAYA", "CREDIT_CARD", "CHEQUE"];
  if (methodsRequiringRef.includes(body.method) && !body.referenceNo?.trim()) {
    throw new AppError(
      "Reference number is required for this payment method",
      400,
      "REFERENCE_REQUIRED",
    );
  }

  const totalCents = toCents(invoice.total);
  const paidCents = invoice.payments.reduce((sum, p) => sum + toCents(p.amount), 0);
  const amountCents = Math.round(body.amount * MONEY_SCALE);
  if (amountCents <= 0) {
    throw new AppError("Amount must be positive", 400, "INVALID_AMOUNT");
  }
  if (paidCents + amountCents > totalCents) {
    throw new AppError("Payment exceeds remaining balance", 409, "AMOUNT_EXCEEDS_BALANCE");
  }

  const newPaidCents = paidCents + amountCents;
  const fullyPaid = newPaidCents >= totalCents;

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId,
        amount: fromCents(amountCents),
        method: body.method,
        referenceNo: body.referenceNo ?? null,
        notes: body.notes ?? null,
        createdBy: userId,
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: fullyPaid ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL,
        paidAt: fullyPaid ? new Date() : null,
      },
    }),
  ]);

  emitInvoiceEvent({
    type: "invoice.payment_received",
    invoiceId,
    paymentId: payment.id,
    amount: (amountCents / MONEY_SCALE).toFixed(2),
  });
  if (fullyPaid) {
    emitInvoiceEvent({ type: "invoice.paid", invoiceId });
  }

  return getInvoice(clinicId, invoiceId);
}

export async function deleteInvoice(clinicId: string, id: string): Promise<void> {
  const invoice = await prisma.invoice.findFirst({
    where: { id, clinicId },
    select: { id: true, status: true },
  });
  if (!invoice) throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  if (invoice.status !== InvoiceStatus.UNPAID) {
    throw new AppError(
      "Only fully unpaid invoices can be deleted",
      409,
      "INVOICE_NOT_DELETABLE",
    );
  }
  await prisma.invoice.delete({ where: { id } });
}

/**
 * PayMongo Links entegrasyonu. PAYMONGO_SECRET_KEY tanımlı değilse dev-mock bir
 * link döndürür (webhook simulate endpointi ile ödeme tamamlanabilir).
 *
 * Docs: https://developers.paymongo.com/reference/the-links-object
 */
export async function createPaymongoCheckout(
  clinicId: string,
  invoiceId: string,
  body: PaymongoBody,
): Promise<{ url: string; checkoutUrl: string; linkId: string | null; mock: boolean }> {
  const invoice = await getInvoice(clinicId, invoiceId);
  if (invoice.status === "PAID") {
    throw new AppError("Invoice already paid", 409, "INVOICE_PAID");
  }
  const balance = Number(invoice.balance);
  if (balance <= 0) throw new AppError("Nothing to pay", 409, "NO_BALANCE");

  const key = process.env.PAYMONGO_SECRET_KEY?.trim();
  const description = body.description ?? `DentEase PH – ${invoice.orNumber ?? invoice.id}`;

  if (!key) {
    const mockUrl = `${process.env.APP_PUBLIC_URL ?? "http://localhost:5173"}/invoices/${invoice.id}?paymongo_mock=1`;
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { externalRef: `mock-${Date.now()}` },
    });
    return { url: mockUrl, checkoutUrl: mockUrl, linkId: null, mock: true };
  }

  const res = await fetch("https://api.paymongo.com/v1/links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: Math.round(balance * 100),
          description,
          remarks: invoice.orNumber ?? invoice.id,
        },
      },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new AppError(`PayMongo error: ${txt}`, 502, "PAYMONGO_ERROR");
  }
  const json = (await res.json()) as {
    data: { id: string; attributes: { checkout_url: string } };
  };
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { externalRef: json.data.id },
  });
  const checkoutUrl = json.data.attributes.checkout_url;
  return { url: checkoutUrl, checkoutUrl, linkId: json.data.id, mock: false };
}

/**
 * PayMongo webhook handler (link.payment.paid veya simulate).
 * Basit sürüm: externalRef eşleşen invoice'ı PAID olarak işaretle.
 */
export async function handlePaymongoWebhook(payload: unknown): Promise<void> {
  if (typeof payload !== "object" || payload === null) {
    return;
  }

  // Idempotency: PayMongo Event ID üzerinden kontrol (evt_...)
  const eventId = extractProviderEventId(payload);
  if (eventId) {
    const existing = await prisma.webhookEvent.findUnique({
      where: { providerEventId: eventId },
    });
    if (existing) {
      console.log(`[webhook] Skipping duplicate event: ${eventId}`);
      return;
    }
    // Event'i kaydet (status: RECEIVED)
    await prisma.webhookEvent.create({
      data: {
        provider: "PAYMONGO",
        providerEventId: eventId,
        eventType: extractEventType(payload) || "unknown",
        payload: payload as any,
        status: "RECEIVED",
      },
    });
  }

  const ref = extractExternalRef(payload);
  if (!ref) return;
  const invoice = await prisma.invoice.findFirst({
    where: { externalRef: ref },
    select: { id: true, clinicId: true },
  });
  if (!invoice) return;

  const full = await getInvoice(invoice.clinicId, invoice.id);
  const balance = Number(full.balance);
  if (balance <= 0) return;

  try {
    await addPayment(
      invoice.clinicId,
      invoice.id,
      { amount: balance, method: "GCASH", referenceNo: ref },
      "paymongo-webhook",
    );

    // Başarıyla işlendiğinde güncelle
    if (eventId) {
      await prisma.webhookEvent.update({
        where: { providerEventId: eventId },
        data: { status: "PROCESSED", processedAt: new Date() },
      });
    }
  } catch (err) {
    if (eventId) {
      await prisma.webhookEvent.update({
        where: { providerEventId: eventId },
        data: { status: "FAILED", error: err instanceof Error ? err.message : "unknown error" },
      });
    }
    throw err;
  }
}

function extractProviderEventId(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const any = payload as Record<string, unknown>;
  const data = any.data as Record<string, unknown> | undefined;
  if (data && typeof data.id === "string" && data.id.startsWith("evt_")) return data.id;
  return null;
}

function extractEventType(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const any = payload as Record<string, unknown>;
  const data = any.data as Record<string, unknown> | undefined;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  if (typeof attributes?.type === "string") return attributes.type;
  return null;
}

function extractExternalRef(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const any = payload as Record<string, unknown>;
  if (typeof any.linkId === "string") return any.linkId;
  const data = any.data as Record<string, unknown> | undefined;
  if (data && typeof data.id === "string") return data.id;
  const attributes = data?.attributes as Record<string, unknown> | undefined;
  const nested = attributes?.data as Record<string, unknown> | undefined;
  if (nested && typeof nested.id === "string") return nested.id;
  return null;
}
