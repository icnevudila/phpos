import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { REMEMBER_EMAIL_KEY } from "../constants/auth";
import { setAuthProfile, setTokens } from "../hooks/authTokens";
import { apiBaseUrl } from "../services/index";
import type { UserRole } from "../types/user";

const fieldFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

interface LoginSuccessBody {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      clinicId: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      role: UserRole;
    };
  };
}

interface LoginErrorBody {
  success: false;
  error: string;
  code: string;
}

function ToothLogo({ className = "h-11 w-11" }: { className?: string }): JSX.Element {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/25 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[55%] w-[55%]" aria-hidden>
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
  );
}

export function LoginPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = (await res.json()) as LoginSuccessBody | LoginErrorBody;
      if (!res.ok || !json.success) {
        setError(t("errors.loginInvalid"));
        return;
      }
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
    } catch {
      setError(t("errors.loginNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] bg-slate-100 dark:bg-slate-950">
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

      <main
        id="main"
        tabIndex={-1}
        className="relative mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col outline-none lg:flex-row"
      >
        {/* Sol panel — masaüstü klinik teması */}
        <section
          className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-10 py-12 text-white lg:flex xl:px-14 xl:py-16"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <ToothLogo className="h-12 w-12" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/90">{t("common.appName")}</p>
                <p className="text-lg font-bold text-white">{t("auth.loginHeroKicker")}</p>
              </div>
            </div>
            <h1 className="mt-10 max-w-md text-3xl font-black leading-tight tracking-tight xl:text-4xl">{t("auth.loginHeroTitle")}</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-50/95">{t("auth.loginHeroSub")}</p>
          </div>
          <ul className="relative mt-12 space-y-3 text-sm font-medium text-emerald-50">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
              {t("auth.loginHeroPoint1")}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
              {t("auth.loginHeroPoint2")}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">✓</span>
              {t("auth.loginHeroPoint3")}
            </li>
          </ul>
          <p className="relative mt-8 text-xs text-emerald-200/80">{t("auth.loginHeroFoot")}</p>
        </section>

        {/* Giriş kartı */}
        <section className="flex flex-1 flex-col justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(5rem,env(safe-area-inset-top))] sm:px-8 lg:px-12 lg:py-12 lg:pt-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <ToothLogo />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t("common.appName")}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("auth.loginHeroKicker")}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90 sm:p-8">
              <h2 className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">{t("auth.loginTitle")}</h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">{t("auth.loginSubtitle")}</p>

              <form className="mt-8 space-y-5" onSubmit={(e) => void handleSubmit(e)}>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("auth.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-950/80 dark:text-slate-100 sm:text-sm ${fieldFocus}`}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("auth.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-1.5 min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-950/80 dark:text-slate-100 sm:text-sm ${fieldFocus}`}
                  />
                </div>
                <div className="flex min-h-11 items-center gap-2 py-1">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-5 w-5 shrink-0 rounded border-slate-300 text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:focus-visible:ring-offset-slate-900"
                  />
                  <label htmlFor="remember" className="cursor-pointer select-none text-sm text-slate-700 dark:text-slate-300">
                    {t("auth.rememberMe")}
                  </label>
                </div>

                {error ? (
                  <p
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-900"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    t("auth.submit")
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <Link to="/" className="font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400">
                  {t("auth.backToMarketing")}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <svg
      className="h-4 w-4 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
