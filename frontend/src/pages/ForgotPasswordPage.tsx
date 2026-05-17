import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

import { DentQLLogo } from "../components/ui/DentQLLogo";
import { requestPasswordReset } from "../services/auth";

export function ForgotPasswordPage(): JSX.Element {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError((err as Error).message || t("auth.forgotFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center bg-white px-4 py-12 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/10" />
      </div>
      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex justify-center">
            <DentQLLogo size="md" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("auth.forgotTitle")}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("auth.forgotSubtitle")}</p>
          </div>
          {sent ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 px-4 py-6 text-center dark:bg-emerald-950/30" role="status">
              <Mail className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("auth.forgotSent")}</p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline"
              >
                <ArrowLeft size={16} />
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("auth.emailLabel")}
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                  placeholder="admin@clinic.com"
                />
              </div>
              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? t("auth.sending") : t("auth.sendResetLink")}
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={14} />
                {t("auth.backToLogin")}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
