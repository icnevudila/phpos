import { supabase } from "../lib/supabase";
import type { InvoiceDto, InvoiceStatus, PaymentMethod } from "../types/invoice";

export interface ListInvoicesParams {
  patientId?: string;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  q?: string;
  openHmoClaim?: "1" | "true";
}

export async function fetchInvoices(params: ListInvoicesParams = {}): Promise<InvoiceDto[]> {
  let query = supabase
    .from("invoices")
    .select("*, patients(*)");

  if (params.patientId) {
    query = query.eq("patient_id", params.patientId);
  }
  if (params.status) {
    query = query.eq("status", params.status);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data || []).map((row: any) => ({
    id: row.id,
    patientId: row.patient_id,
    appointmentId: null, // Removed appointment dependency for now
    subtotal: row.total,
    discount: 0,
    total: row.total,
    balance: row.balance,
    status: row.status,
    notes: null,
    dueDate: null,
    createdAt: row.created_at,
    updatedAt: row.created_at,
    patient: row.patients ? {
      id: row.patient_id,
      firstName: row.patients.name?.split(" ")[0] || "",
      lastName: row.patients.name?.split(" ").slice(1).join(" ") || "",
      fullName: row.patients.name || "Unknown Patient",
      phone: row.patients.phone || "",
      email: row.patients.email || null,
      address: row.patients.address || null,
      city: row.patients.city || null,
      philhealthNo: row.patients.philhealth_no || null,
      isSeniorCitizen: row.patients.is_senior_citizen || false,
      oscaIdNo: row.patients.osca_id_no || null,
      pwdIdNo: row.patients.pwd_id_no || null,
      tinNumber: row.patients.tin_number || null,
    } : {
      id: row.patient_id,
      firstName: "Unknown",
      lastName: "Patient",
      fullName: "Unknown Patient",
      phone: "",
      email: null,
      address: null,
      city: null,
      philhealthNo: null,
      isSeniorCitizen: false,
      oscaIdNo: null,
      pwdIdNo: null,
      tinNumber: null,
    },
    items: [],
    payments: [],
    hmoClaim: undefined
  }));
}

export async function fetchInvoice(id: string): Promise<InvoiceDto> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*, patients(*), invoice_items(*), payments(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    patientId: data.patient_id,
    appointmentId: null,
    subtotal: data.total,
    discount: 0,
    total: data.total,
    balance: data.balance,
    status: data.status,
    notes: null,
    dueDate: null,
    createdAt: data.created_at,
    updatedAt: data.created_at,
    patient: data.patients ? {
      id: data.patient_id,
      firstName: data.patients.name?.split(" ")[0] || "",
      lastName: data.patients.name?.split(" ").slice(1).join(" ") || "",
      fullName: data.patients.name || "Unknown Patient",
      phone: data.patients.phone || "",
      email: data.patients.email || null,
      address: data.patients.address || null,
      city: data.patients.city || null,
      philhealthNo: data.patients.philhealth_no || null,
      isSeniorCitizen: data.patients.is_senior_citizen || false,
      oscaIdNo: data.patients.osca_id_no || null,
      pwdIdNo: data.patients.pwd_id_no || null,
      tinNumber: data.patients.tin_number || null,
    } : {
      id: data.patient_id,
      firstName: "Unknown",
      lastName: "Patient",
      fullName: "Unknown Patient",
      phone: "",
      email: null,
      address: null,
      city: null,
      philhealthNo: null,
      isSeniorCitizen: false,
      oscaIdNo: null,
      pwdIdNo: null,
      tinNumber: null,
    },
    items: (data.invoice_items || []).map((item: any) => ({
      id: item.id,
      invoiceId: data.id,
      description: item.description,
      qty: item.qty,
      unitPrice: item.price,
      totalPrice: item.price * item.qty,
      createdAt: data.created_at
    })),
    payments: (data.payments || []).map((p: any) => ({
      id: p.id,
      invoiceId: data.id,
      amount: p.amount,
      method: p.method,
      referenceNo: null,
      notes: null,
      paymentDate: p.payment_date,
      createdAt: p.payment_date,
    }))
  };
}

export async function createInvoiceFromAppointment(
  appointmentId: string,
  options: { discount?: number; notes?: string } = {},
): Promise<InvoiceDto> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) throw new Error("No clinic assigned");

  // Fetch the appointment to get patient_id
  const { data: appointment, error: aptErr } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("id", appointmentId)
    .single();

  if (aptErr) throw new Error(aptErr.message);

  const subtotal = 150.00; // Mock subtotal for demo
  const discount = options.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      clinic_id: profile.clinic_id,
      patient_id: appointment.patient_id,
      total,
      balance: total,
      status: "DRAFT"
    })
    .select()
    .single();

  if (invErr) throw new Error(invErr.message);

  // Add a dummy line item
  await supabase
    .from("invoice_items")
    .insert({
      invoice_id: invoice.id,
      description: "General Consultation (Generated from Appointment)",
      price: subtotal,
      qty: 1
    });

  return fetchInvoice(invoice.id);
}

export async function updateInvoice(
  id: string,
  body: { discount?: number; notes?: string; dueDate?: string },
): Promise<InvoiceDto> {
  // Mocked for Demo
  return fetchInvoice(id);
}

export async function addInvoicePayment(
  id: string,
  body: { amount: number; method: PaymentMethod; referenceNo?: string; notes?: string },
): Promise<InvoiceDto> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();

  if (!profile?.clinic_id) throw new Error("No clinic assigned");

  // Insert payment, trigger will update invoice balance and status
  const { error } = await supabase
    .from("payments")
    .insert({
      invoice_id: id,
      clinic_id: profile.clinic_id,
      amount: body.amount,
      method: body.method
    });

  if (error) throw new Error(error.message);

  return fetchInvoice(id);
}

export async function createPaymongoLink(
  id: string,
  method: "GCASH" | "MAYA" = "GCASH",
): Promise<{ url: string; checkoutUrl: string; mock: boolean; linkId: string | null }> {
  console.log("Mock PayMongo Link generation for invoice:", id);
  return {
    url: "https://demo.paymongo.com/checkout/mock",
    checkoutUrl: "https://demo.paymongo.com/checkout/mock",
    mock: true,
    linkId: "link_mock_" + id
  };
}

export async function simulatePaymongoPaid(id: string): Promise<InvoiceDto> {
  console.log("Simulating PayMongo Paid for invoice:", id);
  await addInvoicePayment(id, { amount: 100, method: "GCASH", notes: "PayMongo Mock" });
  return fetchInvoice(id);
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function openInvoicePdf(id: string): Promise<void> {
  try {
    const { generateInvoicePdf } = await import("../utils/invoicePdf");
    const invoice = await fetchInvoice(id);
    await generateInvoicePdf(invoice);
  } catch (err) {
    console.error("Failed to generate Invoice PDF:", err);
    throw err;
  }
}

export async function openPhilhealthWorksheetPdf(id: string): Promise<void> {
  try {
    const { generatePhilhealthPdf } = await import("../utils/philhealthPdf");
    const invoice = await fetchInvoice(id);
    await generatePhilhealthPdf(invoice);
  } catch (err) {
    console.error("Failed to generate PhilHealth PDF:", err);
    throw err;
  }
}

export async function openBir2307Pdf(id: string): Promise<void> {
  try {
    const { generateBir2307Pdf } = await import("../utils/bir2307Pdf");
    const invoice = await fetchInvoice(id);
    await generateBir2307Pdf(invoice);
  } catch (err) {
    console.error("Failed to generate BIR 2307 PDF:", err);
    throw err;
  }
}

