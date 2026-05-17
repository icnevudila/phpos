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
      navigate("/login", { state: { message: t("auth.registerBanner") } });
    } catch (e) {
      setError((e as Error).message || t("auth.registerClinic.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-white dark:bg-slate-950">
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col lg:flex-row">
        <section className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-white px-10 py-12 text-slate-900 lg:flex xl:px-16 xl:py-20 border-r border-slate-100 dark:bg-slate-950 dark:text-white dark:border-slate-800">
          <div className="absolute inset-0 bg-white dark:bg-slate-950 opacity-90" />

          <div className="relative z-10 w-full max-w-lg mx-auto p-12 rounded-[4rem] bg-slate-50/50 border border-slate-100/50 shadow-sm backdrop-blur-sm dark:bg-slate-900/50 dark:border-slate-800">
            <div className="relative">
              <div className="flex items-center gap-3">
                <DentQLLogo size="md" />
              </div>

              <h1 className="mt-16 max-w-md text-4xl font-black leading-[1.1] tracking-tight xl:text-5xl text-slate-900 dark:text-white">
                {t("auth.registerClinic.heroTitle")}
              </h1>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-500 dark:text-slate-400">
                {t("auth.registerClinic.heroSub")}
              </p>
            </div>

            <div className="mt-16">
              <div className="rounded-3xl bg-white/60 p-8 border border-white shadow-sm dark:bg-white/5 dark:border-white/10">
                <p className="text-sm font-semibold italic text-slate-700 dark:text-slate-300">
                  &ldquo;{t("auth.registerClinic.testimonial")}&rdquo;
                </p>
                <p className="mt-4 text-xs font-black text-emerald-600 uppercase tracking-widest">
                  {t("auth.registerClinic.testimonialAuthor")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-[1.4] flex-col justify-center px-4 pb-12 pt-20 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-2xl">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-10">
              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t("auth.registerClinic.formTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("auth.registerClinic.formSub")}
                </p>
              </div>

              <form className="grid gap-x-6 gap-y-5 sm:grid-cols-2" onSubmit={handleSubmit}>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.clinicName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.clinicNamePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.firstName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.firstNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.lastName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.lastNamePlaceholder")}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.phone")}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.phonePlaceholder")}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.location")}
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.locationPlaceholder")}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.workEmail")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder={t("auth.registerClinic.workEmailPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.registerClinic.password")}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
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
                    className="mt-4 flex w-full min-h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        {t("auth.registerClinic.creating")}
                      </>
                    ) : (
                      t("auth.registerClinic.submit")
                    )}
                  </button>

                  <p className="mt-6 text-center text-xs text-slate-500">
                    {t("auth.registerClinic.termsPrefix")}{" "}
                    <a href="#" className="font-bold underline">
                      {t("auth.registerClinic.terms")}
                    </a>{" "}
                    {t("auth.registerClinic.termsAnd")}{" "}
                    <a href="#" className="font-bold underline">
                      {t("auth.registerClinic.privacy")}
                    </a>
                    .
                  </p>
                </div>
              </form>

              <div className="mt-10 border-t border-slate-100 pt-8 text-center">
                <p className="text-xs text-slate-500">
                  {t("auth.registerClinic.alreadyRegistered")}{" "}
                  <Link to="/login" className="font-bold text-emerald-600 hover:underline">
                    {t("auth.registerClinic.signInWorkspace")}
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
