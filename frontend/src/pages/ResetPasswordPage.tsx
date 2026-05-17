import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";

import { DentQLLogo } from "../components/ui/DentQLLogo";
import { resetPasswordWithToken } from "../services/auth";

export function ResetPasswordPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(t("auth.resetInvalidLink"));
      return;
    }
    if (password.length < 8) {
      setError(t("auth.passwordMin"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await resetPasswordWithToken(token, password);
      setDone(true);
      setTimeout(() => {
        void navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      setError((err as Error).message || t("auth.resetFailed"));
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
              {t("auth.resetTitle")}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("auth.resetSubtitle")}</p>
          </div>

          {!token ? (
            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{t("auth.resetInvalidLink")}</p>
              <Link to="/forgot-password" className="mt-4 inline-flex text-sm font-bold text-emerald-600 hover:underline">
                {t("auth.forgotLink")}
              </Link>
            </div>
          ) : done ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 px-4 py-6 text-center dark:bg-emerald-950/30" role="status">
              <KeyRound className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("auth.resetSuccess")}</p>
              <Link to="/login" className="mt-4 inline-flex text-sm font-bold text-emerald-600 hover:underline">
                {t("auth.backToLogin")}
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("auth.newPasswordLabel")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t("auth.confirmPasswordLabel")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
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
                {loading ? t("auth.saving") : t("auth.savePassword")}
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
