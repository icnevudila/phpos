import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { registerClinic } from "../services/auth";
import { DentQLLogo } from "../components/ui/DentQLLogo";

export function RegisterPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [clinicName, setClinicName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerClinic({
        clinicName,
        firstName,
        lastName,
        phone,
        location,
        email: email.trim(),
        password,
      });
      navigate("/login", { state: { message: t("auth.registerBanner", { defaultValue: "Register Banner" }) } });
    } catch (e) {
      setError((e as Error).message || t("auth.registerClinic.failed", { defaultValue: "Failed" }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#f5f7f9]">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col lg:flex-row">
        <section className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-white px-10 py-12 text-slate-900 lg:flex xl:px-16 xl:py-20 border-r border-slate-100">
          <div className="relative z-10 w-full max-w-lg mx-auto p-12 rounded-[4rem] bg-slate-50/50 border border-slate-100/50 shadow-sm backdrop-blur-sm">
            <div className="relative">
              <div className="flex items-center gap-3">
                <DentQLLogo size="md" />
              </div>

              <h1 className="mt-16 max-w-md text-2xl font-bold leading-[1.1] tracking-tight text-slate-800">
                {t("auth.registerClinic.heroTitle", { defaultValue: "Hero Title" })}
              </h1>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-500">
                {t("auth.registerClinic.heroSub", { defaultValue: "Hero Sub" })}
              </p>
            </div>

            <div className="mt-16">
              <div className="rounded-3xl bg-white/60 p-8 border border-white shadow-sm">
                <p className="text-sm font-semibold italic text-slate-700">
                  &ldquo;{t("auth.registerClinic.testimonial", { defaultValue: "Testimonial" })}&rdquo;
                </p>
                <p className="mt-4 text-xs font-bold text-teal-600 uppercase tracking-widest">
                  {t("auth.registerClinic.testimonialAuthor", { defaultValue: "Testimonial Author" })}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-[1.4] flex-col justify-center px-4 pb-12 pt-20 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-2xl">
            <div className="card sm:p-10">
              <div className="mb-10">
                <div className="flex justify-center mb-4">
                  <DentQLLogo size="md" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                  {t("auth.registerClinic.formTitle", { defaultValue: "Form Title" })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("auth.registerClinic.formSub", { defaultValue: "Form Sub" })}
                </p>
              </div>

              <form className="grid gap-x-6 gap-y-5 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.clinicName", { defaultValue: "Clinic Name" })}
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.clinicNamePlaceholder", { defaultValue: "Clinic Name Placeholder" })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.firstName", { defaultValue: "First Name" })}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.firstNamePlaceholder", { defaultValue: "First Name Placeholder" })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.lastName", { defaultValue: "Last Name" })}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.lastNamePlaceholder", { defaultValue: "Last Name Placeholder" })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.phone", { defaultValue: "Phone" })}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.phonePlaceholder", { defaultValue: "Phone Placeholder" })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.location", { defaultValue: "Location" })}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.locationPlaceholder", { defaultValue: "Location Placeholder" })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.workEmail", { defaultValue: "Work Email" })}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder={t("auth.registerClinic.workEmailPlaceholder", { defaultValue: "Work Email Placeholder" })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.registerClinic.password", { defaultValue: "Password" })}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder="••••••••"
                  />
                </div>

                <div className="sm:col-span-2">
                  {error && (
                    <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary mt-4 w-full justify-center"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        {t("auth.registerClinic.creating", { defaultValue: "Creating" })}
                      </>
                    ) : (
                      t("auth.registerClinic.submit", { defaultValue: "Submit" })
                    )}
                  </button>

                  <p className="mt-6 text-center text-xs text-slate-500">
                    {t("auth.registerClinic.termsPrefix", { defaultValue: "Terms Prefix" })}{" "}
                    <a href="#" className="font-bold underline">
                      {t("auth.registerClinic.terms", { defaultValue: "Terms" })}
                    </a>{" "}
                    {t("auth.registerClinic.termsAnd", { defaultValue: "Terms And" })}{" "}
                    <a href="#" className="font-bold underline">
                      {t("auth.registerClinic.privacy", { defaultValue: "Privacy" })}
                    </a>
                    .
                  </p>
                </div>
              </form>

              <div className="mt-10 border-t border-slate-100 pt-8 text-center">
                <p className="text-xs text-slate-500">
                  {t("auth.registerClinic.alreadyRegistered", { defaultValue: "Already Registered" })}{" "}
                  <Link to="/login" className="font-bold text-teal-600 hover:underline">
                    {t("auth.registerClinic.signInWorkspace", { defaultValue: "Sign In Workspace" })}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
