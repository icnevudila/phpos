import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { REMEMBER_EMAIL_KEY } from "../constants/auth";
import { setAuthProfile, setTokens } from "../hooks/authTokens";
import { login } from "../services/auth";

import { DentQLLogo } from "../components/ui/DentQLLogo";

export function LoginPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: { pathname: string }; message?: string } | null;
  const from = locationState?.from?.pathname;
  const registerBanner = locationState?.message ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroPoints = [
    t("auth.loginHeroPoint1"),
    t("auth.loginHeroPoint2"),
    t("auth.loginHeroPoint3"),
  ];

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const json = await login(email.trim(), password);

      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      setTokens(json.data.accessToken, json.data.refreshToken);
      setAuthProfile({
        id: json.data.user.id,
        clinicId: json.data.user.clinicId,
        email: json.data.user.email,
        firstName: json.data.user.firstName,
        lastName: json.data.user.lastName,
        phone: json.data.user.phone,
        role: json.data.user.role,
      });
      const role = json.data.user.role;
      if (from && from !== "/login") {
        void navigate(from, { replace: true });
        return;
      }
      if (role === "ADMIN") {
        void navigate("/dashboard", { replace: true });
      } else {
        void navigate("/appointments", { replace: true });
      }
    } catch (e) {
      setError((e as Error).message || t("errors.loginNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-white dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/10" />
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col lg:flex-row">
        <section className="relative hidden min-h-0 flex-[1.2] flex-col justify-between overflow-hidden bg-white px-10 py-12 text-slate-900 lg:flex xl:px-16 xl:py-20 border-r border-slate-100 dark:bg-slate-950 dark:text-white dark:border-slate-800">
          <div className="absolute inset-0 bg-white dark:bg-slate-950 opacity-90" />

          <div className="relative z-10 w-full max-w-lg mx-auto p-12 rounded-[4rem] bg-slate-50/50 border border-slate-100/50 shadow-sm backdrop-blur-sm dark:bg-slate-900/50 dark:border-slate-800">
            <div className="relative">
              <div className="flex items-center gap-3">
                <DentQLLogo size="md" />
              </div>

              <h1 className="mt-16 max-w-md text-4xl font-black leading-[1.1] tracking-tight xl:text-5xl text-slate-900 dark:text-white">
                {t("auth.loginHeroTitle")}
              </h1>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-500 dark:text-slate-400">
                {t("auth.loginHeroSub")}
              </p>
            </div>

            <div className="mt-16 space-y-6">
              <div className="grid gap-4">
                {heroPoints.map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] dark:bg-emerald-900/30 dark:text-emerald-400">
                      ✓
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-200 dark:border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t("auth.loginHeroFoot")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center px-4 pb-8 pt-20 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="text-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {t("auth.loginTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("auth.loginSubtitle")}</p>
              </div>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("auth.emailLabel")}
                  </label>
                  <input
                    type="email"
                    required
                    data-testid="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder="admin@firefly.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {t("auth.password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:underline"
                    >
                      {t("auth.forgotLink")}
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    data-testid="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-600 dark:bg-slate-950/80"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs font-medium text-slate-600 dark:text-slate-400"
                  >
                    {t("auth.rememberMe")}
                  </label>
                </div>

                {registerBanner && (
                  <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {registerBanner}
                  </p>
                )}

                {error && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800">{error}</p>
                )}

                <button
                  type="submit"
                  data-testid="login-submit"
                  disabled={loading}
                  className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? t("auth.signingIn") : t("auth.submit")}
                </button>
              </form>

              <div className="mt-8 space-y-4 text-center">
                <p className="text-xs text-slate-500">
                  {t("auth.noAccount")}{" "}
                  <Link to="/register" className="font-bold text-emerald-600 hover:underline">
                    {t("auth.signUp")}
                  </Link>
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  {t("auth.backToMarketing")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
