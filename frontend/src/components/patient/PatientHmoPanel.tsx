import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { HMO_CLAIM_STATUS_I18N_KEY } from "../../constants/hmoClaimStatusLabels";
import {
  type HmoClaim,
  type HmoProvider,
  type PatientHmoMembership,
  createPatientHmoMembership,
  fetchHmoClaims,
  fetchHmoProviders,
  fetchPatientHmoMemberships,
} from "../../services/hmo";

const PHP = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function PatientHmoPanel({ patientId }: { patientId: string }): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [providerId, setProviderId] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(true);

  const { data: providers = [] } = useQuery({
    queryKey: ["hmoProviders"],
    queryFn: async () => {
      const all = await fetchHmoProviders();
      return all.filter((x) => x.isActive);
    },
  });

  const { data: memberships = [], isLoading: membershipsLoading } = useQuery({
    queryKey: ["patientHmoMemberships", patientId],
    queryFn: () => fetchPatientHmoMemberships(patientId),
    enabled: !!patientId,
  });

  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ["patientHmoClaims", patientId],
    queryFn: () => fetchHmoClaims({ patientId, limit: 50 }),
    enabled: !!patientId,
  });

  const loading = membershipsLoading || claimsLoading;

  const pendingClaims = useMemo(
    () => claims.filter((c) => c.status === "DRAFT" || c.status === "SUBMITTED"),
    [claims],
  );

  async function addMembership(): Promise<void> {
    if (!providerId || !memberNumber.trim()) {
      toast.error(t("pages.patientDetail.hmo.toastProviderMemberRequired", { defaultValue: "Toast Provider Member Required" }));
      return;
    }
    try {
      await createPatientHmoMembership(patientId, {
        providerId,
        memberNumber: memberNumber.trim(),
        isPrimary,
      });
      setMemberNumber("");
      await queryClient.invalidateQueries({ queryKey: ["patientHmoMemberships", patientId] });
      toast.success(t("pages.patientDetail.hmo.toastMembershipAdded", { defaultValue: "Toast Membership Added" }));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{t("pages.patientDetail.hmo.loading", { defaultValue: "Loading" })}</p>;
  }

  const dash = t("pages.patientDetail.hmo.dash", { defaultValue: "Dash" });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {t("pages.patientDetail.hmo.membershipsTitle", { defaultValue: "Memberships Title" })}
          </h3>
          {memberships.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{t("pages.patientDetail.hmo.membershipsEmpty", { defaultValue: "Memberships Empty" })}</p>
          ) : (
            <div className="mt-3 space-y-2">
              {memberships.map((m) => (
                <div key={m.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      {m.provider.name} · {m.memberNumber}
                    </p>
                    {m.isPrimary ? (
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                        {t("pages.patientDetail.hmo.primaryBadge", { defaultValue: "Primary Badge" })}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500">
                    {t("pages.patientDetail.hmo.sponsorCardholder", {
                      sponsor: m.sponsor?.trim() ? m.sponsor : dash,
                      cardholder: m.cardholderName?.trim() ? m.cardholderName : dash,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">{t("pages.patientDetail.hmo.addTitle", { defaultValue: "Add Title" })}</h3>
          <div className="mt-3 space-y-2">
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">{t("pages.patientDetail.hmo.selectProvider", { defaultValue: "Select Provider" })}</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              value={memberNumber}
              onChange={(e) => setMemberNumber(e.target.value)}
              placeholder={t("pages.patientDetail.hmo.memberNumberPlaceholder", { defaultValue: "Member Number Placeholder" })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
              {t("pages.patientDetail.hmo.primaryCheckbox", { defaultValue: "Primary Checkbox" })}
            </label>
            <button
              type="button"
              onClick={() => void addMembership()}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {t("pages.patientDetail.hmo.saveMembership", { defaultValue: "Save Membership" })}
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">{t("pages.patientDetail.hmo.claimsTitle", { defaultValue: "Claims Title" })}</h3>
        {claims.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t("pages.patientDetail.hmo.claimsEmpty", { defaultValue: "Claims Empty" })}</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-2 py-2">{t("pages.patientDetail.hmo.colClaim", { defaultValue: "Col Claim" })}</th>
                  <th className="px-2 py-2 text-center">{t("pages.patientDetail.hmo.colLines", { defaultValue: "Col Lines" })}</th>
                  <th className="px-2 py-2">{t("pages.patientDetail.hmo.colProvider", { defaultValue: "Col Provider" })}</th>
                  <th className="px-2 py-2 text-right">{t("pages.patientDetail.hmo.colRequested", { defaultValue: "Col Requested" })}</th>
                  <th className="px-2 py-2 text-right">{t("pages.patientDetail.hmo.colApproved", { defaultValue: "Col Approved" })}</th>
                  <th className="px-2 py-2">{t("pages.patientDetail.hmo.colStatus", { defaultValue: "Col Status" })}</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100">
                    <td className="px-2 py-2 font-mono text-xs">
                      <Link to={`/hmo-claims/${c.id}`} className="text-teal-700 hover:underline">
                        {c.claimNumber}
                      </Link>
                    </td>
                    <td className="px-2 py-2 text-center text-xs text-slate-600">{c.lineCount}</td>
                    <td className="px-2 py-2">{c.provider.name}</td>
                    <td className="px-2 py-2 text-right">{PHP.format(Number(c.requestedAmount))}</td>
                    <td className="px-2 py-2 text-right">
                      {c.approvedAmount ? PHP.format(Number(c.approvedAmount)) : dash}
                    </td>
                    <td className="px-2 py-2">{t(HMO_CLAIM_STATUS_I18N_KEY[c.status])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pendingClaims.length > 0 ? (
          <p className="mt-3 text-xs text-amber-700">
            {t("pages.patientDetail.hmo.pendingBanner", { count: pendingClaims.length })}
          </p>
        ) : null}
      </section>
    </div>
  );
}
