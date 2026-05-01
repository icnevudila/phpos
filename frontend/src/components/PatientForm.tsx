import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { apiFetch } from "../services/api";
import { patientFormSchema, type PatientFormValues } from "../validation/patientForm";

interface PatientDetailApi {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nickname: string | null;
  phone: string;
  email: string | null;
  birthDate: string | null;
  gender: string | null;
  civilStatus: string | null;
  religion: string | null;
  nationality: string | null;
  occupation: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianPhone: string | null;
  referralSource: string | null;
  previousDentist: string | null;
  lastDentalVisit: string | null;
  reasonForVisit: string | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  pulseRate: number | null;
  bloodType: string | null;
  allergies: string[];
  medicalHistoryText: string | null;
  philhealthNo: string | null;
  isSeniorCitizen?: boolean;
  oscaIdNo?: string | null;
  pwdIdNo?: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}

export interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  patientId?: string;
}

const DEFAULTS: PatientFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  nickname: "",
  phone: "",
  email: undefined,
  birthDate: "",
  gender: "",
  civilStatus: "",
  religion: "",
  nationality: "",
  occupation: "",
  address: "",
  city: "",
  province: "",
  guardianName: "",
  guardianRelation: "",
  guardianPhone: undefined,
  referralSource: "",
  previousDentist: "",
  lastDentalVisit: "",
  reasonForVisit: "",
  bloodPressureSystolic: undefined,
  bloodPressureDiastolic: undefined,
  pulseRate: undefined,
  bloodType: "",
  allergies: [],
  medicalHistory: "",
  philhealthNo: "",
  isSeniorCitizen: false,
  oscaIdNo: "",
  pwdIdNo: "",
  emergencyContactName: "",
  emergencyContactPhone: undefined,
};

export function PatientForm({ open, onClose, onSaved, patientId }: PatientFormProps): JSX.Element | null {
  const { t } = useTranslation();
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [allergyInput, setAllergyInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: DEFAULTS,
  });

  const allergies = watch("allergies") ?? [];

  useEffect(() => {
    if (!open) return;
    if (!patientId) {
      reset(DEFAULTS);
      return;
    }
    let cancelled = false;
    setLoadingPatient(true);
    void (async () => {
      try {
        const res = await apiFetch<{ success: true; data: PatientDetailApi }>(`/patients/${patientId}`);
        if (cancelled) return;
        const p = res.data;
        const dateOnly = (iso: string | null): string =>
          iso && iso.length >= 10 ? iso.slice(0, 10) : "";
        reset({
          firstName: p.firstName,
          middleName: p.middleName ?? "",
          lastName: p.lastName,
          nickname: p.nickname ?? "",
          phone: p.phone,
          email: p.email ?? undefined,
          birthDate: dateOnly(p.birthDate),
          gender: (p.gender as PatientFormValues["gender"]) ?? "",
          civilStatus: (p.civilStatus as PatientFormValues["civilStatus"]) ?? "",
          religion: p.religion ?? "",
          nationality: p.nationality ?? "",
          occupation: p.occupation ?? "",
          address: p.address ?? "",
          city: p.city ?? "",
          province: p.province ?? "",
          guardianName: p.guardianName ?? "",
          guardianRelation: p.guardianRelation ?? "",
          guardianPhone: (p.guardianPhone as string | undefined) ?? undefined,
          referralSource: p.referralSource ?? "",
          previousDentist: p.previousDentist ?? "",
          lastDentalVisit: dateOnly(p.lastDentalVisit),
          reasonForVisit: p.reasonForVisit ?? "",
          bloodPressureSystolic: p.bloodPressureSystolic ?? undefined,
          bloodPressureDiastolic: p.bloodPressureDiastolic ?? undefined,
          pulseRate: p.pulseRate ?? undefined,
          bloodType: (p.bloodType as PatientFormValues["bloodType"]) ?? "",
          allergies: p.allergies ?? [],
          medicalHistory: p.medicalHistoryText ?? "",
          philhealthNo: p.philhealthNo ?? "",
          isSeniorCitizen: !!p.isSeniorCitizen,
          oscaIdNo: p.oscaIdNo ?? "",
          pwdIdNo: p.pwdIdNo ?? "",
          emergencyContactName: p.emergencyContactName ?? "",
          emergencyContactPhone: (p.emergencyContactPhone as string | undefined) ?? undefined,
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load patient");
        onClose();
      } finally {
        if (!cancelled) setLoadingPatient(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, patientId, reset, onClose]);

  function addAllergy(): void {
    const t = allergyInput.trim();
    if (!t) return;
    if (allergies.includes(t)) {
      setAllergyInput("");
      return;
    }
    setValue("allergies", [...allergies, t], { shouldValidate: true });
    setAllergyInput("");
  }

  function removeAllergy(tag: string): void {
    setValue(
      "allergies",
      allergies.filter((a) => a !== tag),
      { shouldValidate: true },
    );
  }

  async function onSubmit(values: PatientFormValues): Promise<void> {
    const body: Record<string, unknown> = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      allergies: values.allergies,
    };
    const putIfString = (key: keyof PatientFormValues, out?: string): void => {
      const v = values[key];
      if (typeof v === "string" && v.trim() !== "") body[out ?? (key as string)] = v;
    };
    const putIfNumber = (key: keyof PatientFormValues, out?: string): void => {
      const v = values[key];
      if (typeof v === "number" && Number.isFinite(v)) body[out ?? (key as string)] = v;
    };
    putIfString("middleName");
    putIfString("nickname");
    if (values.email) body.email = values.email;
    if (values.birthDate) body.birthDate = new Date(values.birthDate).toISOString();
    if (values.gender) body.gender = values.gender;
    if (values.civilStatus) body.civilStatus = values.civilStatus;
    putIfString("religion");
    putIfString("nationality");
    putIfString("occupation");
    putIfString("address");
    putIfString("city");
    putIfString("province");
    putIfString("guardianName");
    putIfString("guardianRelation");
    if (values.guardianPhone) body.guardianPhone = values.guardianPhone;
    putIfString("referralSource");
    putIfString("previousDentist");
    if (values.lastDentalVisit) body.lastDentalVisit = new Date(values.lastDentalVisit).toISOString();
    putIfString("reasonForVisit");
    putIfNumber("bloodPressureSystolic");
    putIfNumber("bloodPressureDiastolic");
    putIfNumber("pulseRate");
    if (values.bloodType) body.bloodType = values.bloodType;
    putIfString("medicalHistory");
    putIfString("philhealthNo");
    body.isSeniorCitizen = values.isSeniorCitizen;
    putIfString("oscaIdNo");
    putIfString("pwdIdNo");
    putIfString("emergencyContactName");
    if (values.emergencyContactPhone) body.emergencyContactPhone = values.emergencyContactPhone;

    try {
      if (patientId) {
        await apiFetch(`/patients/${patientId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        toast.success(t("pages.patientForm.toastUpdated"));
      } else {
        await apiFetch(`/patients`, {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success(t("pages.patientForm.toastCreated"));
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.patientForm.toastSaveFailed"));
    }
  }

  if (!open) return null;

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {patientId ? "Edit patient" : "New patient"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {loadingPatient ? (
          <p className="mt-6 text-sm text-slate-500">{t("pages.patientForm.loading")}</p>
        ) : (
          <form className="mt-4 space-y-6" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            {/* Identity */}
            <Section title="Identity">
              <Grid cols={3}>
                <Field label="First name *" error={errors.firstName?.message}>
                  <input {...register("firstName")} className={inputClass} />
                </Field>
                <Field label="Middle name">
                  <input {...register("middleName")} className={inputClass} />
                </Field>
                <Field label="Last name *" error={errors.lastName?.message}>
                  <input {...register("lastName")} className={inputClass} />
                </Field>
                <Field label="Nickname">
                  <input {...register("nickname")} className={inputClass} />
                </Field>
                <Field label="Birth date" error={errors.birthDate?.message}>
                  <input type="date" {...register("birthDate")} className={inputClass} />
                </Field>
                <Field label="Gender">
                  <select {...register("gender")} className={inputClass}>
                    <option value="">—</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Civil status">
                  <select {...register("civilStatus")} className={inputClass}>
                    <option value="">—</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="WIDOWED">Widowed</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="SEPARATED">Separated</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Field>
                <Field label="Nationality">
                  <input {...register("nationality")} className={inputClass} placeholder="Filipino" />
                </Field>
                <Field label="Religion">
                  <input {...register("religion")} className={inputClass} />
                </Field>
                <Field label="Occupation">
                  <input {...register("occupation")} className={inputClass} />
                </Field>
              </Grid>
            </Section>

            {/* Contact */}
            <Section title="Contact">
              <Grid cols={2}>
                <Field label="Phone * (+63…)" error={errors.phone?.message}>
                  <input
                    placeholder="+639171234567"
                    {...register("phone")}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input type="email" {...register("email")} className={inputClass} />
                </Field>
                <Field label="Address">
                  <input {...register("address")} className={inputClass} />
                </Field>
                <Field label="City">
                  <input {...register("city")} className={inputClass} />
                </Field>
                <Field label="Province">
                  <input {...register("province")} className={inputClass} />
                </Field>
                <Field label="PhilHealth no.">
                  <input {...register("philhealthNo")} className={inputClass} />
                </Field>
              </Grid>
            </Section>

            <Section title="Discount eligibility (PH — RA 9994 / RA 10754)">
              <Grid cols={2}>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    id="patient-isSenior"
                    type="checkbox"
                    {...register("isSeniorCitizen")}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="patient-isSenior" className="text-sm text-slate-700">
                    Senior citizen (verified at clinic / OSCA)
                  </label>
                </div>
                <Field label="OSCA ID no.">
                  <input {...register("oscaIdNo")} className={inputClass} placeholder="Optional" />
                </Field>
                <Field label="PWD ID no.">
                  <input {...register("pwdIdNo")} className={inputClass} placeholder="If applicable" />
                </Field>
              </Grid>
              <p className="mt-2 text-xs text-slate-500">
                Used as the statutory discount floor on invoices when applicable. VAT line item is not yet split in the UI.
              </p>
            </Section>

            {/* Guardian (for minors) */}
            <Section title="Guardian (if minor)">
              <Grid cols={3}>
                <Field label="Guardian name">
                  <input {...register("guardianName")} className={inputClass} />
                </Field>
                <Field label="Relation">
                  <input {...register("guardianRelation")} className={inputClass} />
                </Field>
                <Field label="Guardian phone" error={errors.guardianPhone?.message}>
                  <input {...register("guardianPhone")} className={inputClass} placeholder="+639…" />
                </Field>
              </Grid>
            </Section>

            {/* Dental background + Vitals */}
            <Section title="Dental history & vitals">
              <Grid cols={2}>
                <Field label="Referred by">
                  <input {...register("referralSource")} className={inputClass} />
                </Field>
                <Field label="Previous dentist">
                  <input {...register("previousDentist")} className={inputClass} />
                </Field>
                <Field label="Last dental visit" error={errors.lastDentalVisit?.message}>
                  <input type="date" {...register("lastDentalVisit")} className={inputClass} />
                </Field>
                <Field label="Reason for visit">
                  <input {...register("reasonForVisit")} className={inputClass} />
                </Field>
                <Field label="BP systolic">
                  <input
                    type="number"
                    {...register("bloodPressureSystolic", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="120"
                  />
                </Field>
                <Field label="BP diastolic">
                  <input
                    type="number"
                    {...register("bloodPressureDiastolic", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="80"
                  />
                </Field>
                <Field label="Pulse rate (bpm)">
                  <input
                    type="number"
                    {...register("pulseRate", { valueAsNumber: true })}
                    className={inputClass}
                    placeholder="72"
                  />
                </Field>
                <Field label="Blood type">
                  <select {...register("bloodType")} className={inputClass}>
                    <option value="">—</option>
                    <option value="A_POS">A+</option>
                    <option value="A_NEG">A−</option>
                    <option value="B_POS">B+</option>
                    <option value="B_NEG">B−</option>
                    <option value="AB_POS">AB+</option>
                    <option value="AB_NEG">AB−</option>
                    <option value="O_POS">O+</option>
                    <option value="O_NEG">O−</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </Field>
              </Grid>
            </Section>

            {/* Allergies + Medical notes */}
            <Section title="Allergies & legacy notes">
              <Field label="Allergies" error={errors.allergies ? String(errors.allergies.message) : undefined}>
                <div className="mt-1 flex flex-wrap gap-2">
                  {allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-800"
                    >
                      {a}
                      <button
                        type="button"
                        className="text-slate-500 hover:text-red-600"
                        onClick={() => removeAllergy(a)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAllergy();
                      }
                    }}
                    className={inputClass}
                    placeholder="Add allergy, Enter to add"
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="rounded-lg bg-slate-200 px-3 text-sm"
                  >
                    Add
                  </button>
                </div>
              </Field>
              <Field label="Legacy medical notes (free text)">
                <textarea {...register("medicalHistory")} rows={2} className={inputClass} />
                <p className="mt-1 text-xs text-slate-500">
                  Structured medical history has its own Medical tab with 28-condition checklist.
                </p>
              </Field>
            </Section>

            {/* Emergency */}
            <Section title="Emergency contact">
              <Grid cols={2}>
                <Field label="Name">
                  <input {...register("emergencyContactName")} className={inputClass} />
                </Field>
                <Field
                  label="Phone"
                  error={errors.emergencyContactPhone?.message}
                >
                  <input
                    placeholder="+639171234567"
                    {...register("emergencyContactPhone")}
                    className={inputClass}
                  />
                </Field>
              </Grid>
            </Section>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }): JSX.Element {
  const cls = cols === 3 ? "grid gap-3 sm:grid-cols-3" : "grid gap-3 sm:grid-cols-2";
  return <div className={cls}>{children}</div>;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div>
      <label className="text-xs font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
