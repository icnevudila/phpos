import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { REMEMBER_EMAIL_KEY } from "../constants/auth";
import { useAuth } from "../hooks/useAuth";

import { DentQLLogo } from "../components/ui/DentQLLogo";

export function LoginPage(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  
  const locationState = location.state as { from?: { pathname: string }; message?: string } | null;
  const from = locationState?.from?.pathname;
  const registerBanner = locationState?.message ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroPoints = [
    t("auth.loginHeroPoint1", { defaultValue: "Login Hero Point1" }),
    t("auth.loginHeroPoint2", { defaultValue: "Login Hero Point2" }),
    t("auth.loginHeroPoint3", { defaultValue: "Login Hero Point3" }),
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
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      
      await signIn(email.trim(), password);
      
      if (from && from !== "/login") {
        void navigate(from, { replace: true });
        return;
      }
      
      void navigate("/appointments", { replace: true });
    } catch (e) {
      setError((e as Error).message || t("errors.loginNetwork", { defaultValue: "Login Network" }));
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
        <section className="relative hidden min-h-0 flex-[1.2] flex-col justify-between overflow-hidden bg-white px-10 py-12 text-slate-900 lg:flex xl:px-16 xl:py-20 border-r border-slate-100">
          <div className="relative z-10 mx-auto w-full max-w-lg">
            <div className="relative">
              <div className="flex items-center gap-3">
                <DentQLLogo size="md" />
              </div>

              <h1 className="mt-16 max-w-md text-2xl font-bold leading-[1.1] tracking-tight text-slate-800">
                {t("auth.loginHeroTitle", { defaultValue: "Login Hero Title" })}
              </h1>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-500">
                {t("auth.loginHeroSub", { defaultValue: "Login Hero Sub" })}
              </p>
            </div>

            <div className="mt-16 space-y-6">
              <div className="grid gap-4">
                {heroPoints.map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium text-slate-600"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-teal-600 text-[10px]">
                      ✓
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t("auth.loginHeroFoot", { defaultValue: "Login Hero Foot" })}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center px-4 pb-8 pt-20 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="card">
              <div className="mb-6 text-center">
                <DentQLLogo size="md" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                  {t("auth.loginTitle", { defaultValue: "Login Title" })}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{t("auth.loginSubtitle", { defaultValue: "Login Subtitle" })}</p>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {t("auth.emailLabel", { defaultValue: "Email Label" })}
                  </label>
                  <input
                    type="email"
                    required
                    data-testid="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
                    placeholder="admin@dentease.ph"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                      {t("auth.password", { defaultValue: "Password" })}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-teal-600 hover:underline"
                    >
                      {t("auth.forgotLink", { defaultValue: "Forgot Link" })}
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    data-testid="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-400 outline-none w-full transition"
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
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs font-medium text-slate-600"
                  >
                    {t("auth.rememberMe", { defaultValue: "Remember Me" })}
                  </label>
                </div>

                {registerBanner && (
                  <p className="rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">
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
                  className="btn-primary w-full justify-center"
                >
                  {loading ? t("auth.signingIn", { defaultValue: "Signing In" }) : t("auth.submit", { defaultValue: "Submit" })}
                </button>
              </form>

              <div className="mt-8 space-y-4 text-center">
                <p className="text-xs text-slate-500">
                  {t("auth.noAccount", { defaultValue: "No Account" })}{" "}
                  <Link to="/register" className="font-bold text-teal-600 hover:underline">
                    {t("auth.signUp", { defaultValue: "Sign Up" })}
                  </Link>
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  {t("auth.backToMarketing", { defaultValue: "Back To Marketing" })}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
