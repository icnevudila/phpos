import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle, Save, Trash2, Calendar, User, Phone, MapPin, CreditCard, ShieldAlert } from "lucide-react";

import api from "../services/api";
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
  philhealthType: string | null;
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
  philhealthType: "",
  isSeniorCitizen: false,
  oscaIdNo: "",
  pwdIdNo: "",
  emergencyContactName: "",
  emergencyContactPhone: undefined,
};

export function PatientForm({ open, onClose, onSaved, patientId }: PatientFormProps): JSX.Element {
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
        const res = await api.get<{ data: PatientDetailApi }>(`/patients/${patientId}`);
        if (cancelled) return;
        const p = res.data.data;
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
          philhealthType: (p.philhealthType as PatientFormValues["philhealthType"]) ?? "",
          isSeniorCitizen: !!p.isSeniorCitizen,
          oscaIdNo: p.oscaIdNo ?? "",
          pwdIdNo: p.pwdIdNo ?? "",
          emergencyContactName: p.emergencyContactName ?? "",
          emergencyContactPhone: (p.emergencyContactPhone as string | undefined) ?? undefined,
        });
      } catch (e) {
        toast.error(t("patientForm.toastLoadFailed", { defaultValue: "Toast Load Failed" }));
        onClose();
      } finally {
        if (!cancelled) setLoadingPatient(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, patientId, reset, onClose, t]);

  function addAllergy(): void {
    const text = allergyInput.trim();
    if (!text) return;
    if (allergies.includes(text)) {
      setAllergyInput("");
      return;
    }
    setValue("allergies", [...allergies, text], { shouldValidate: true });
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
    if (values.philhealthType) body.philhealthType = values.philhealthType;
    body.isSeniorCitizen = values.isSeniorCitizen;
    putIfString("oscaIdNo");
    putIfString("pwdIdNo");
    putIfString("emergencyContactName");
    if (values.emergencyContactPhone) body.emergencyContactPhone = values.emergencyContactPhone;

    try {
      if (patientId) {
        await api.put(`/patients/${patientId}`, body);
        toast.success(t("patientForm.toastUpdated", { defaultValue: "Toast Updated" }));
      } else {
        await api.post(`/patients`, body);
        toast.success(t("patientForm.toastCreated", { defaultValue: "Toast Created" }));
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(t("patientForm.toastSaveFailed", { defaultValue: "Toast Save Failed" }));
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10   ";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#f5f7f9]/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative h-full max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            role="dialog"
            aria-modal
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {patientId ? t("patientForm.titleEdit", { defaultValue: "Title Edit" }) : t("patientForm.titleNew", { defaultValue: "Title New" })}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {patientId ? `#${patientId.slice(-8)}` : t("patientForm.clinicIntake", { defaultValue: "Clinic Intake" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-2xl bg-slate-50 p-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {loadingPatient ? (
                  <div className="flex h-64 flex-col items-center justify-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
                    <p className="text-sm font-bold text-slate-500">{t("patientForm.loading", { defaultValue: "Loading" })}</p>
                  </div>
                ) : (
                  <form id="patient-form" className="space-y-10" onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
                    {/* Identity */}
                    <FormSection title={t("patientForm.identitySection", { defaultValue: "Identity Section" })} icon={<User size={16} />}>
                      <Grid cols={3}>
                        <Field label={t("patientForm.labelFirstName", { defaultValue: "Label First Name" })} error={errors.firstName?.message}>
                          <input {...register("firstName")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelMiddleName", { defaultValue: "Label Middle Name" })}>
                          <input {...register("middleName")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelLastName", { defaultValue: "Label Last Name" })} error={errors.lastName?.message}>
                          <input {...register("lastName")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelNickname", { defaultValue: "Label Nickname" })}>
                          <input {...register("nickname")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelBirthDate", { defaultValue: "Label Birth Date" })} error={errors.birthDate?.message}>
                          <input type="date" {...register("birthDate")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelGender", { defaultValue: "Label Gender" })}>
                          <select {...register("gender")} className={inputClass}>
                            <option value="">—</option>
                            <option value="MALE">{t("patientForm.genderMale", { defaultValue: "Gender Male" })}</option>
                            <option value="FEMALE">{t("patientForm.genderFemale", { defaultValue: "Gender Female" })}</option>
                            <option value="OTHER">{t("patientForm.genderOther", { defaultValue: "Gender Other" })}</option>
                          </select>
                        </Field>
                        <Field label={t("patientForm.labelCivilStatus", { defaultValue: "Label Civil Status" })}>
                          <select {...register("civilStatus")} className={inputClass}>
                            <option value="">—</option>
                            <option value="SINGLE">{t("patientForm.civilSingle", { defaultValue: "Civil Single" })}</option>
                            <option value="MARRIED">{t("patientForm.civilMarried", { defaultValue: "Civil Married" })}</option>
                            <option value="WIDOWED">{t("patientForm.civilWidowed", { defaultValue: "Civil Widowed" })}</option>
                            <option value="DIVORCED">{t("patientForm.civilDivorced", { defaultValue: "Civil Divorced" })}</option>
                            <option value="SEPARATED">{t("patientForm.civilSeparated", { defaultValue: "Civil Separated" })}</option>
                            <option value="OTHER">{t("patientForm.civilOther", { defaultValue: "Civil Other" })}</option>
                          </select>
                        </Field>
                        <Field label={t("patientForm.labelNationality", { defaultValue: "Label Nationality" })}>
                          <input {...register("nationality")} className={inputClass} placeholder={t("patientForm.placeholderNationality", { defaultValue: "Placeholder Nationality" })} />
                        </Field>
                        <Field label={t("patientForm.labelReligion", { defaultValue: "Label Religion" })}>
                          <input {...register("religion")} className={inputClass} />
                        </Field>
                      </Grid>
                    </FormSection>

                    {/* Contact */}
                    <FormSection title={t("patientForm.contactSection", { defaultValue: "Contact Section" })} icon={<Phone size={16} />}>
                      <Grid cols={2}>
                        <Field label={t("patientForm.labelPhone", { defaultValue: "Label Phone" })} error={errors.phone?.message}>
                          <input
                            placeholder={t("patientForm.placeholderPhone", { defaultValue: "Placeholder Phone" })}
                            {...register("phone")}
                            className={inputClass}
                            autoComplete="tel"
                          />
                        </Field>
                        <Field label={t("patientForm.labelEmail", { defaultValue: "Label Email" })} error={errors.email?.message}>
                          <input type="email" {...register("email")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelAddress", { defaultValue: "Label Address" })}>
                          <input {...register("address")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelCity", { defaultValue: "Label City" })}>
                          <input {...register("city")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelProvince", { defaultValue: "Label Province" })}>
                          <input {...register("province")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelPhilhealthNo", { defaultValue: "Label Philhealth No" })}>
                          <input {...register("philhealthNo")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelPhilhealthType", { defaultValue: "Label Philhealth Type" })}>
                          <select {...register("philhealthType")} className={inputClass}>
                            <option value="">—</option>
                            <option value="FORMAL">{t("patientForm.philhealthFormal", { defaultValue: "Philhealth Formal" })}</option>
                            <option value="INFORMAL">{t("patientForm.philhealthInformal", { defaultValue: "Philhealth Informal" })}</option>
                            <option value="INDIGENT">{t("patientForm.philhealthIndigent", { defaultValue: "Philhealth Indigent" })}</option>
                            <option value="SPONSORED">{t("patientForm.philhealthSponsored", { defaultValue: "Philhealth Sponsored" })}</option>
                            <option value="LIFETIME">{t("patientForm.philhealthLifetime", { defaultValue: "Philhealth Lifetime" })}</option>
                            <option value="SENIOR_CITIZEN">{t("patientForm.philhealthSeniorCitizen", { defaultValue: "Philhealth Senior Citizen" })}</option>
                          </select>
                        </Field>
                      </Grid>
                    </FormSection>

                    {/* Discount */}
                    <FormSection title={t("patientForm.discountSection", { defaultValue: "Discount Section" })} icon={<CreditCard size={16} />}>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="flex items-center gap-3 pt-6">
                          <input
                            id="patient-isSenior"
                            type="checkbox"
                            {...register("isSeniorCitizen")}
                            className="h-5 w-5 rounded-lg border-slate-300 text-sky-600 transition-all focus:ring-sky-500/20"
                          />
                          <label htmlFor="patient-isSenior" className="text-sm font-semibold text-slate-700">
                            {t("patientForm.labelSeniorCitizen", { defaultValue: "Label Senior Citizen" })}
                          </label>
                        </div>
                        <Field label={t("patientForm.labelOscaId", { defaultValue: "Label Osca Id" })}>
                          <input {...register("oscaIdNo")} className={inputClass} placeholder={t("patientForm.placeholderOptional", { defaultValue: "Placeholder Optional" })} />
                        </Field>
                        <Field label={t("patientForm.labelPwdId", { defaultValue: "Label Pwd Id" })}>
                          <input
                            {...register("pwdIdNo")}
                            className={inputClass}
                            placeholder={t("patientForm.pwdIdPlaceholder", { defaultValue: "Pwd Id Placeholder" })}
                          />
                        </Field>
                      </div>
                      <p className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <AlertCircle size={14} className="text-sky-500" />
                        {t("patientForm.hintSenior", { defaultValue: "Hint Senior" })}
                      </p>
                    </FormSection>

                    {/* Guardian */}
                    <FormSection title={t("patientForm.guardianSection", { defaultValue: "Guardian Section" })} icon={<User size={16} />}>
                      <Grid cols={3}>
                        <Field label={t("patientForm.labelGuardianName", { defaultValue: "Label Guardian Name" })}>
                          <input {...register("guardianName")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelGuardianRelation", { defaultValue: "Label Guardian Relation" })}>
                          <input {...register("guardianRelation")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelGuardianPhone", { defaultValue: "Label Guardian Phone" })} error={errors.guardianPhone?.message}>
                          <input {...register("guardianPhone")} className={inputClass} placeholder="+639…" />
                        </Field>
                      </Grid>
                    </FormSection>

                    {/* Vitals */}
                    <FormSection title={t("patientForm.dentalVitalsSection", { defaultValue: "Dental Vitals Section" })} icon={<Calendar size={16} />}>
                      <Grid cols={2}>
                        <Field label={t("patientForm.labelReferredBy", { defaultValue: "Label Referred By" })}>
                          <input {...register("referralSource")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelPrevDentist", { defaultValue: "Label Prev Dentist" })}>
                          <input {...register("previousDentist")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelLastVisit", { defaultValue: "Label Last Visit" })} error={errors.lastDentalVisit?.message}>
                          <input type="date" {...register("lastDentalVisit")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelReason", { defaultValue: "Label Reason" })}>
                          <input {...register("reasonForVisit")} className={inputClass} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label={t("patientForm.labelBpSystolic", { defaultValue: "Label Bp Systolic" })}>
                            <input
                              type="number"
                              {...register("bloodPressureSystolic", { valueAsNumber: true })}
                              className={inputClass}
                              placeholder="120"
                            />
                          </Field>
                          <Field label={t("patientForm.labelBpDiastolic", { defaultValue: "Label Bp Diastolic" })}>
                            <input
                              type="number"
                              {...register("bloodPressureDiastolic", { valueAsNumber: true })}
                              className={inputClass}
                              placeholder="80"
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label={t("patientForm.labelPulse", { defaultValue: "Label Pulse" })}>
                            <input
                              type="number"
                              {...register("pulseRate", { valueAsNumber: true })}
                              className={inputClass}
                              placeholder="72"
                            />
                          </Field>
                          <Field label={t("patientForm.labelBloodType", { defaultValue: "Label Blood Type" })}>
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
                              <option value="UNKNOWN">{t("patientForm.bloodUnknown", { defaultValue: "Blood Unknown" })}</option>
                            </select>
                          </Field>
                        </div>
                      </Grid>
                    </FormSection>

                    {/* Allergies */}
                    <FormSection title={t("patientForm.allergiesSection", { defaultValue: "Allergies Section" })} icon={<ShieldAlert size={16} />}>
                      <Field label={t("patientForm.labelAllergies", { defaultValue: "Label Allergies" })} error={errors.allergies ? String(errors.allergies.message) : undefined}>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {allergies.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-rose-600"
                            >
                              {a}
                              <button
                                type="button"
                                className="transition-colors hover:text-rose-800"
                                onClick={() => removeAllergy(a)}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex gap-2">
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
                            placeholder={t("patientForm.placeholderAllergy", { defaultValue: "Placeholder Allergy" })}
                          />
                          <button
                            type="button"
                            onClick={addAllergy}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
                          >
                            <Plus size={16} />
                            {t("patientForm.btnAdd", { defaultValue: "Btn Add" })}
                          </button>
                        </div>
                      </Field>
                      <Field label={t("patientForm.labelMedNotes", { defaultValue: "Label Med Notes" })}>
                        <textarea {...register("medicalHistory")} rows={3} className={inputClass} placeholder={t("patientForm.placeholderMedNotes", { defaultValue: "Placeholder Med Notes" })} />
                        <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                          <AlertCircle size={14} />
                          {t("patientForm.hintMedNotes", { defaultValue: "Hint Med Notes" })}
                        </p>
                      </Field>
                    </FormSection>

                    {/* Emergency */}
                    <FormSection title={t("patientForm.emergencySection", { defaultValue: "Emergency Section" })} icon={<ShieldAlert size={16} />}>
                      <Grid cols={2}>
                        <Field label={t("patientForm.labelEmergencyName", { defaultValue: "Label Emergency Name" })}>
                          <input {...register("emergencyContactName")} className={inputClass} />
                        </Field>
                        <Field label={t("patientForm.labelEmergencyPhone", { defaultValue: "Label Emergency Phone" })} error={errors.emergencyContactPhone?.message}>
                          <input
                            placeholder={t("patientForm.placeholderPhone", { defaultValue: "Placeholder Phone" })}
                            {...register("emergencyContactPhone")}
                            className={inputClass}
                          />
                        </Field>
                      </Grid>
                    </FormSection>
                  </form>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-8 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50"
                >
                  {t("patientForm.btnCancel", { defaultValue: "Btn Cancel" })}
                </button>
                <button
                  type="submit"
                  form="patient-form"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-10 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-teal-500/20 transition-all hover:bg-teal-700 hover:shadow-teal-500/40 disabled:opacity-60 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t("patientForm.btnSaving", { defaultValue: "Btn Saving" })}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t("patientForm.btnSave", { defaultValue: "Btn Save" })}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }): JSX.Element {
  return (
    <div className="group space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          {icon}
        </div>
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-600 transition-colors">{title}</h3>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/30 p-8">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }): JSX.Element {
  const cls = cols === 3 ? "grid gap-6 sm:grid-cols-3" : "grid gap-6 sm:grid-cols-2";
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
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</label>
      {children}
      {error ? (
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 px-1 text-[10px] font-bold text-rose-500"
        >
          <AlertCircle size={10} />
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}
