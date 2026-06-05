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
    <div className="relative min-h-[100dvh] bg-[var(--color-paper)] font-body text-[var(--color-ink-2)] selection:bg-[var(--color-accent)] selection:text-[var(--color-accent-ink)]">
      {/* 
        /* Hallmark · genre: modern-minimal · macrostructure: 05-workbench · theme: cobalt · enrichment: E0 · nav: none · footer: none */
      */}
      <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher />
      </div>

      <main className="relative mx-auto flex min-h-[100dvh] w-full flex-col lg:flex-row">
        {/* Left Side: Split Diptych Content */}
        <section className="relative hidden min-h-0 lg:flex w-full lg:w-[45%] flex-col justify-between overflow-hidden bg-[var(--color-paper-subtle)] px-10 py-12 xl:px-16 xl:py-20 border-r border-[var(--color-rule)]">
          <div className="relative z-10 mx-auto w-full max-w-lg">
            <div className="relative reveal is-in">
              <div className="flex items-center gap-3 mb-16">
                <DentQLLogo size="md" />
              </div>

              <div className="font-mono-label text-[10px] text-[var(--color-muted)] mb-4">DENTQL · SECURE LOGIN</div>
              <h1 className="max-w-md text-3xl font-semibold leading-[1.1] tracking-tight text-[var(--color-ink)] font-display">
                {t("auth.loginHeroTitle", { defaultValue: "Welcome back." })}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-ink-2)]">
                {t("auth.loginHeroSub", { defaultValue: "Sign in to manage your clinic, schedules, and patient records from one secure workbench." })}
              </p>
            </div>

            <div className="mt-16 space-y-6 reveal is-in" style={{transitionDelay: '100ms'}}>
              <div className="grid gap-4">
                {heroPoints.map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium text-[var(--color-ink)]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-[10px] border border-[var(--color-accent)]/20 font-mono">
                      {`0${i + 1}`}
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-[var(--color-rule)] mt-12">
                <p className="font-mono-label text-[10px] text-[var(--color-muted)]">
                  {t("auth.loginHeroFoot", { defaultValue: "HIPAA COMPLIANT · SOC2 READY" })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Form */}
        <section className="flex flex-1 flex-col justify-center px-4 pb-8 pt-20 sm:px-8 lg:px-12 lg:py-12 bg-[var(--color-paper)]">
          <div className="mx-auto w-full max-w-sm reveal is-in">
            <div className="lg:hidden mb-12 text-center">
              <DentQLLogo size="md" className="mx-auto mb-4" />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] font-display">
                {t("auth.loginTitle", { defaultValue: "Sign in" })}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-2)]">
                {t("auth.loginSubtitle", { defaultValue: "Enter your credentials to access your terminal." })}
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[10px] font-mono-label text-[var(--color-muted)] mb-2">
                  {t("auth.emailLabel", { defaultValue: "Email" })}
                </label>
                <input
                  type="email"
                  required
                  data-testid="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted-2)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] outline-none transition-shadow"
                  placeholder="admin@dentease.ph"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-mono-label text-[var(--color-muted)]">
                    {t("auth.password", { defaultValue: "Password" })}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-mono-label text-[var(--color-accent)] hover:opacity-80 transition-opacity"
                  >
                    {t("auth.forgotLink", { defaultValue: "Reset" })}
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  data-testid="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-rule-2)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted-2)] focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] outline-none transition-shadow"
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
                  className="h-3.5 w-3.5 rounded-[2px] border-[var(--color-rule-2)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] bg-[var(--color-paper)] accent-[var(--color-accent)]"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs font-medium text-[var(--color-ink)]"
                >
                  {t("auth.rememberMe", { defaultValue: "Remember me for 30 days" })}
                </label>
              </div>

              {registerBanner && (
                <div className="rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 px-3 py-2 text-xs font-medium text-[var(--color-ink)]">
                  {registerBanner}
                </div>
              )}

              {error && (
                <div className="rounded-[var(--radius-md)] bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-800">
                  {error}
                </div>
              )}

              <button
                type="submit"
                data-testid="login-submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-2"
              >
                {loading ? t("auth.signingIn", { defaultValue: "Signing In..." }) : t("auth.submit", { defaultValue: "Sign In →" })}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[var(--color-rule)] space-y-4 text-left">
              <p className="text-xs text-[var(--color-ink-2)]">
                {t("auth.noAccount", { defaultValue: "Don't have an account?" })}{" "}
                <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
                  {t("auth.signUp", { defaultValue: "Request access." })}
                </Link>
              </p>
              <div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                >
                  ← {t("auth.backToMarketing", { defaultValue: "Back to Home" })}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
