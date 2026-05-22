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
    <div className="min-h-screen bg-[#f5f7f9] flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <DentQLLogo size="md" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {t("auth.resetTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t("auth.resetSubtitle")}</p>
        </div>

        {!token ? (
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-rose-700">{t("auth.resetInvalidLink")}</p>
            <Link to="/forgot-password" className="mt-4 inline-flex text-sm font-bold text-teal-600 hover:underline">
              {t("auth.forgotLink")}
            </Link>
          </div>
        ) : done ? (
          <div className="mt-8 rounded-2xl bg-teal-50 px-4 py-6 text-center" role="status">
            <KeyRound className="mx-auto mb-3 h-10 w-10 text-teal-600" />
            <p className="text-sm font-medium text-slate-700">{t("auth.resetSuccess")}</p>
            <Link to="/login" className="mt-4 inline-flex text-sm font-bold text-teal-600 hover:underline">
              {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("auth.newPasswordLabel")}
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t("auth.confirmPasswordLabel")}
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
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
  );
}
