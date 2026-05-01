import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

import { InvoiceHmoClaimChips } from "../components/invoices/InvoiceHmoClaimChips";
import { InvoiceStatusBadge } from "../components/invoices/InvoiceStatusBadge";
import { PaymentModal } from "../components/invoices/PaymentModal";
import {
  createPaymongoLink,
  fetchInvoice,
  openInvoicePdf,
  openPhilhealthWorksheetPdf,
  simulatePaymongoPaid,
  updateInvoice,
} from "../services/invoices";
import {
  createHmoClaim,
  fetchHmoProviders,
  fetchPatientHmoMemberships,
  type HmoProvider,
  type PatientHmoMembership,
} from "../services/hmo";
import type { InvoiceDto } from "../types/invoice";
import { formatPHP } from "../types/invoice";

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function InvoicePage(): JSX.Element {
  const { t } = useTranslation();
  const { id = "" } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountDraft, setDiscountDraft] = useState("0");
  const [paymongoUrl, setPaymongoUrl] = useState<string | null>(null);
  const [paymongoMock, setPaymongoMock] = useState(false);
  const [busyGcash, setBusyGcash] = useState(false);
  const [providers, setProviders] = useState<HmoProvider[]>([]);
  const [memberships, setMemberships] = useState<PatientHmoMembership[]>([]);
  const [claimOpen, setClaimOpen] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimProviderId, setClaimProviderId] = useState("");
  const [claimSelectedLineIds, setClaimSelectedLineIds] = useState<string[]>([]);
  const [claimCopay, setClaimCopay] = useState(0);
  const [claimNotes, setClaimNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const inv = await fetchInvoice(id);
      setInvoice(inv);
      setDiscountDraft(inv.discount);
      const [p, m] = await Promise.all([
        fetchHmoProviders(),
        fetchPatientHmoMemberships(inv.patient.id),
      ]);
      setProviders(p.filter((x) => x.isActive));
      setMemberships(m);
      setClaimSelectedLineIds(inv.treatments.map((t) => t.id));
      setClaimProviderId(m.find((x) => x.isPrimary)?.providerId ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pages.invoice.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDiscount(): Promise<void> {
    if (!invoice) return;
    const value = Number(discountDraft);
    if (Number.isNaN(value) || value < 0) return;
    try {
      const updated = await updateInvoice(invoice.id, { discount: value });
      setInvoice(updated);
      setEditingDiscount(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertDiscountFailed"));
    }
  }

  async function onGcashClick(): Promise<void> {
    if (!invoice) return;
    setBusyGcash(true);
    try {
      const res = await createPaymongoLink(invoice.id, "GCASH");
      const payUrl = res.checkoutUrl ?? res.url;
      setPaymongoUrl(payUrl);
      setPaymongoMock(res.mock);
      window.open(payUrl, "_blank");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertGcashFailed"));
    } finally {
      setBusyGcash(false);
    }
  }

  async function onMockPaid(): Promise<void> {
    if (!invoice) return;
    try {
      const updated = await simulatePaymongoPaid(invoice.id);
      setInvoice(updated);
      setPaymongoUrl(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.alertSimulateFailed"));
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-slate-500">{t("pages.invoice.loading")}</div>;
  }
  if (error || !invoice) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-700">{error ?? t("pages.invoice.notFound")}</p>
        <Link to="/invoices" className="mt-3 inline-block text-sm font-semibold text-emerald-700">
          {t("pages.invoice.backList")}
        </Link>
      </div>
    );
  }

  const balance = Number(invoice.balance);
  const isPaid = invoice.status === "PAID";
  const currentInvoice = invoice;
  const claimRequested = invoice.treatments
    .filter((t) => claimSelectedLineIds.includes(t.id))
    .reduce((sum, t) => sum + Number(t.lineTotal), 0);
  const claimCoverage = Math.max(0, claimRequested - claimCopay);
  const selectedMembership = memberships.find((m) => m.providerId === claimProviderId);
  const showNonPrimaryPlanHint = Boolean(
    selectedMembership &&
      !selectedMembership.isPrimary &&
      memberships.some((m) => m.isPrimary),
  );

  async function submitClaim(): Promise<void> {
    if (!claimProviderId) {
      toast.error(t("pages.invoice.toastSelectProvider"));
      return;
    }
    if (claimRequested <= 0) {
      toast.error(t("pages.invoice.toastSelectLine"));
      return;
    }
    setClaimBusy(true);
    try {
      const lineDesc = currentInvoice.treatments
        .filter((t) => claimSelectedLineIds.includes(t.id))
        .map(
          (tr) =>
            `${tr.procedure}(${tr.toothIds.join(",") || t("pages.invoice.generalLine")})`,
        )
        .join(" | ");
      await createHmoClaim({
        patientId: currentInvoice.patient.id,
        invoiceId: currentInvoice.id,
        providerId: claimProviderId,
        patientHmoId: selectedMembership?.id,
        treatmentIds: claimSelectedLineIds,
        requestedAmount: claimRequested,
        patientCopay: claimCopay,
        status: "SUBMITTED",
        notes: claimNotes || t("pages.invoice.claimNotesAuto", { lines: lineDesc }),
      });
      toast.success(t("pages.invoice.toastClaimSubmitted"));
      setClaimOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.invoice.toastClaimFailed"));
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className={`space-y-5 print:bg-white ${!isPaid && balance > 0 ? "pb-28 md:pb-0" : ""}`}>
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/invoices"
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          {t("pages.invoice.backInvoices")}
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("pages.invoice.print")}
          </button>
          <button
            type="button"
            onClick={() =>
              openInvoicePdf(invoice.id).catch(() => toast.error(t("pages.invoice.pdfFailed")))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("pages.invoice.downloadPdf")}
          </button>
          {invoice.patient.philhealthNo ? (
            <button
              type="button"
              onClick={() =>
                openPhilhealthWorksheetPdf(invoice.id).catch(() =>
                  toast.error(t("pages.invoice.philhealthWorksheetPdfFailed")),
                )
              }
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
            >
              {t("pages.invoice.philhealthWorksheet")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        {/* Header card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {t("pages.invoice.officialReceipt")}
              </p>
              <h1 className="mt-1 font-mono text-2xl font-bold text-slate-900">
                {invoice.orNumber ?? t("pages.invoice.orPending")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {t("pages.invoice.issued", { date: fmtDateTime(invoice.createdAt) })}
              </p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.invoice.billedTo")}
              </p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {invoice.patient.fullName}
              </p>
              <p className="text-sm text-slate-600">{invoice.patient.phone}</p>
              {invoice.patient.email ? (
                <p className="text-sm text-slate-600">{invoice.patient.email}</p>
              ) : null}
              {invoice.patient.philhealthNo ? (
                <p className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                  PhilHealth · {invoice.patient.philhealthNo}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {invoice.patient.isSeniorCitizen ? (
                  <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
                    {t("pages.invoice.seniorCitizenBadge")}
                  </span>
                ) : null}
                {invoice.patient.pwdIdNo?.trim() ? (
                  <span className="inline-block rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900 ring-1 ring-sky-200">
                    {t("pages.invoice.pwdBadge")}
                  </span>
                ) : null}
              </div>
              {invoice.patient.isSeniorCitizen || invoice.patient.pwdIdNo?.trim() ? (
                <p className="mt-2 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                  {t("pages.invoice.statutoryDiscountNote")}
                </p>
              ) : null}
            </div>
            {invoice.appointment ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("pages.invoice.appointment")}
                </p>
                <p className="mt-1 text-sm text-slate-800">
                  {fmtDateTime(invoice.appointment.scheduledAt)}
                </p>
                <p className="text-sm text-slate-600">
                  Dr. {invoice.appointment.dentist.fullName}
                </p>
                {invoice.appointment.type ? (
                  <p className="text-sm text-slate-500">
                    {invoice.appointment.type.replace(/_/g, " ")}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {(invoice.hmoClaims?.length ?? 0) > 0 ? (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {t("pages.invoice.hmoClaimsSection")}
              </p>
              <div className="mt-2">
                <InvoiceHmoClaimChips claims={invoice.hmoClaims ?? []} />
              </div>
            </div>
          ) : null}
        </section>

        {/* Line items */}
        <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[520px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">{t("pages.invoice.colProcedure")}</th>
                <th className="px-4 py-3">{t("pages.invoice.colTooth")}</th>
                <th className="px-4 py-3 text-right">{t("pages.invoice.colQty")}</th>
                <th className="px-4 py-3 text-right">{t("pages.invoice.colUnit")}</th>
                <th className="px-4 py-3 text-right">{t("pages.invoice.colTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.treatments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    {t("pages.invoice.noTreatments")}
                  </td>
                </tr>
              ) : (
                invoice.treatments.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {row.procedure.replace(/_/g, " ")}
                      </div>
                      {row.notes ? (
                        <div className="text-xs text-slate-500">{row.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {row.toothIds.length ? row.toothIds.join(", ") : t("pages.common.empty")}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{row.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatPHP(row.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatPHP(row.lineTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex flex-col items-end gap-2 border-t border-slate-100 px-4 py-4">
            <div className="flex w-full max-w-sm items-center justify-between text-sm text-slate-600">
              <span>{t("pages.invoice.subtotal")}</span>
              <span>{formatPHP(invoice.subtotal)}</span>
            </div>
            <div className="flex w-full max-w-sm items-center justify-between gap-3 text-sm text-slate-600">
              <span>{t("pages.invoice.discount")}</span>
              {editingDiscount && !isPaid ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={discountDraft}
                    onChange={(e) => setDiscountDraft(e.target.value)}
                    className="w-24 rounded border border-slate-300 px-2 py-0.5 text-right text-sm"
                  />
                  <button
                    type="button"
                    onClick={saveDiscount}
                    className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white"
                  >
                    {t("pages.invoice.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDiscount(false);
                      setDiscountDraft(invoice.discount);
                    }}
                    className="rounded border border-slate-300 px-2 py-0.5 text-xs font-semibold"
                  >
                    {t("pages.invoice.cancel")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{formatPHP(invoice.discount)}</span>
                  {!isPaid ? (
                    <button
                      type="button"
                      onClick={() => setEditingDiscount(true)}
                      className="text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      {t("pages.invoice.edit")}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex w-full max-w-sm items-center justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-semibold text-slate-900">{t("pages.invoice.total")}</span>
              <span className="text-xl font-extrabold text-slate-900">{formatPHP(invoice.total)}</span>
            </div>
          </div>
        </section>

        {/* Payments + actions */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                {t("pages.invoice.paymentsTitle")}
              </h2>
              {!isPaid ? (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow"
                >
                  {t("pages.invoice.addPayment")}
                </button>
              ) : null}
            </div>
            {invoice.payments.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t("pages.invoice.noPayments")}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {formatPHP(p.amount)}
                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          {p.method}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {fmtDateTime(p.paidAt)}
                        {p.referenceNo ? t("pages.invoice.refLine", { ref: p.referenceNo }) : ""}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("pages.invoice.hmoClaim")}
                </p>
                <button
                  type="button"
                  onClick={() => setClaimOpen((v) => !v)}
                  className="min-h-9 rounded border border-teal-300 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-teal-700 dark:text-teal-200 dark:hover:bg-teal-950/40 dark:focus-visible:ring-offset-slate-950"
                >
                  {claimOpen ? t("pages.invoice.close") : t("pages.invoice.createHmoClaim")}
                </button>
              </div>
              {claimOpen ? (
                <div className="mt-3 space-y-3 text-sm">
                  {memberships.length > 1 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium leading-snug text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                      {t("pages.invoice.multiMembershipHint", { count: memberships.length })}
                    </div>
                  ) : null}
                  {claimProviderId && showNonPrimaryPlanHint ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-[11px] font-medium leading-snug text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100">
                      {t("pages.invoice.nonPrimaryMemberHint")}
                    </div>
                  ) : null}
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {t("pages.invoice.provider")}
                    </label>
                    <select
                      value={claimProviderId}
                      onChange={(e) => setClaimProviderId(e.target.value)}
                      className={`min-h-11 w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 ${fieldFocus}`}
                    >
                      <option value="">{t("pages.invoice.selectProvider")}</option>
                      {providers.map((p) => {
                        const mem = memberships.find((m) => m.providerId === p.id);
                        const primarySuffix = mem?.isPrimary ? t("pages.invoice.providerOptionPrimary") : "";
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {primarySuffix}
                          </option>
                        );
                      })}
                    </select>
                    {memberships.length > 0 ? (
                      <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
                        <span>
                          {t("pages.invoice.membership")}{" "}
                          {memberships.find((m) => m.providerId === claimProviderId)?.memberNumber ??
                            memberships.find((m) => m.isPrimary)?.memberNumber ??
                            t("pages.common.empty")}
                        </span>
                        {selectedMembership?.isPrimary ? (
                          <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal-900">
                            {t("pages.invoice.primaryPlanBadge")}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-slate-200 p-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {t("pages.invoice.lineMapping")}
                    </p>
                    <div className="space-y-1">
                      {invoice.treatments.map((row) => (
                        <label key={row.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={claimSelectedLineIds.includes(row.id)}
                              onChange={(e) => {
                                setClaimSelectedLineIds((prev) =>
                                  e.target.checked
                                    ? [...prev, row.id]
                                    : prev.filter((id) => id !== row.id),
                                );
                              }}
                            />
                            <span>
                              {row.procedure} ·{" "}
                              {row.toothIds.join(", ") || t("pages.common.general")}
                            </span>
                          </span>
                          <span className="font-semibold text-slate-700">{formatPHP(row.lineTotal)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t("pages.invoice.patientCopay")}
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={claimCopay}
                        onChange={(e) => setClaimCopay(Number(e.target.value) || 0)}
                        className={`min-h-11 w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 ${fieldFocus}`}
                      />
                    </div>
                    <div className="rounded-lg border border-teal-200 bg-teal-50/80 px-3 py-2.5 text-xs leading-relaxed text-teal-950 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                        {t("pages.invoice.claimEstimateTitle")}
                      </p>
                      <p className="mt-1.5">
                        {t("pages.invoice.requested", { amount: formatPHP(claimRequested.toFixed(2)) })}
                      </p>
                      <p className="mt-0.5">
                        {t("pages.invoice.copayAmount", { amount: formatPHP(claimCopay.toFixed(2)) })}
                      </p>
                      <p className="mt-1.5 border-t border-teal-200/80 pt-1.5 font-semibold text-teal-900 dark:border-teal-800 dark:text-teal-50">
                        {t("pages.invoice.coverage", { amount: formatPHP(claimCoverage.toFixed(2)) })}
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    rows={2}
                    placeholder={t("pages.invoice.claimNotesPlaceholder")}
                    className={`w-full rounded border border-slate-300 bg-white px-2 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 ${fieldFocus}`}
                  />
                  <button
                    type="button"
                    disabled={claimBusy}
                    onClick={() => void submitClaim()}
                    className="flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-slate-950"
                  >
                    {claimBusy ? t("pages.invoice.submitting") : t("pages.invoice.submitClaim")}
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">{t("pages.invoice.claimHintClosed")}</p>
              )}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 to-teal-900 p-5 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/90">
                {t("pages.invoice.remainingBalance")}
              </p>
              <p className="mt-1 text-3xl font-extrabold">{formatPHP(invoice.balance)}</p>
              <p className="mt-1 text-xs text-emerald-100/80">
                {t("pages.invoice.paidOf", {
                  paid: formatPHP(invoice.paid),
                  total: formatPHP(invoice.total),
                })}
              </p>
            </div>

            {!isPaid ? (
              <div className="hidden md:block">
                <p className="mb-2 text-[11px] leading-snug text-slate-500">{t("pages.invoice.payMongoHint")}</p>
                <button
                  type="button"
                  disabled={busyGcash || balance <= 0}
                  onClick={onGcashClick}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
                    <path d="M4 6h16a2 2 0 0 1 2 2v1H2V8a2 2 0 0 1 2-2Zm-2 5h20v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5Z" />
                  </svg>
                  {busyGcash ? t("pages.invoice.opening") : t("pages.invoice.payGcashMaya")}
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                {t("pages.invoice.paidFull", {
                  date: invoice.paidAt ? fmtDateTime(invoice.paidAt) : t("pages.common.empty"),
                })}
              </div>
            )}

            {paymongoUrl ? (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm">
                <p className="font-semibold text-teal-900">{t("pages.invoice.awaitingOnline")}</p>
                <a
                  href={paymongoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block truncate text-xs text-teal-700 underline"
                >
                  {paymongoUrl}
                </a>
                {paymongoMock ? (
                  <button
                    type="button"
                    onClick={onMockPaid}
                    className="mt-3 w-full rounded-lg bg-teal-600 px-3 py-2 text-xs font-bold text-white hover:bg-teal-700"
                  >
                    {t("pages.invoice.devSimulatePaid")}
                  </button>
                ) : null}
              </div>
            ) : null}

            {invoice.notes ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("pages.invoice.notes")}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {invoice.notes}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {invoice ? (
        <PaymentModal
          open={modalOpen}
          invoice={invoice}
          onClose={() => setModalOpen(false)}
          onSaved={(inv) => {
            setInvoice(inv);
            setModalOpen(false);
          }}
        />
      ) : null}

      {!isPaid && balance > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md print:hidden md:hidden">
          <p className="mb-2 text-center text-[10px] leading-snug text-slate-500">{t("pages.invoice.payMongoHint")}</p>
          <button
            type="button"
            disabled={busyGcash || balance <= 0}
            onClick={onGcashClick}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
              <path d="M4 6h16a2 2 0 0 1 2 2v1H2V8a2 2 0 0 1 2-2Zm-2 5h20v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5Z" />
            </svg>
            <span className="text-left leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-white/90">
                {t("pages.invoice.stickyPayLabel")}
              </span>
              <span className="text-base">{busyGcash ? t("pages.invoice.opening") : formatPHP(invoice.balance)}</span>
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
