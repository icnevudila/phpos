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
    <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <DentQLLogo size="md" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {t("auth.forgotTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t("auth.forgotSubtitle")}</p>
        </div>
        {sent ? (
          <div className="mt-8 rounded-2xl bg-teal-50 px-4 py-6 text-center" role="status">
            <Mail className="mx-auto mb-3 h-10 w-10 text-teal-600" />
            <p className="text-sm font-medium text-slate-700">{t("auth.forgotSent")}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:underline"
            >
              <ArrowLeft size={16} />
              {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("auth.emailLabel")}
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                placeholder="admin@clinic.com"
              />
            </div>
            {error ? (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
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
  );
}
