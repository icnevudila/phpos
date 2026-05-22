import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { translatePortalError } from "../translatePortalError";
import { usePortalKioskSuffix } from "../usePortalKioskSuffix";
import {
  hasPortalToken,
  requestOtp,
  verifyOtp,
  type RequestOtpResponse,
} from "../services/portalApi";

const fieldRing =
  "rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100      sm:text-sm";

function ToothLogo({ className = "h-10 w-10" }: { className?: string }): JSX.Element {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-md ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[55%] w-[55%]" aria-hidden>
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
  );
}

function Spinner(): JSX.Element {
  return (
    <svg
      className="h-4 w-4 shrink-0 animate-spin text-white"
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

export function PortalLoginPage(): JSX.Element {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const kioskSuffix = usePortalKioskSuffix();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpMeta, setOtpMeta] = useState<RequestOtpResponse | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (hasPortalToken()) navigate(`/${slug}/portal/home${kioskSuffix}`, { replace: true });
  }, [slug, navigate, kioskSuffix]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onSendOtp(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await requestOtp(slug, phone);
      setOtpMeta(r);
      setCooldown(r.cooldownSec ?? 30);
      setStep("code");
      if (r.devCode) setCode(r.devCode);
    } catch (err) {
      setError(translatePortalError(err, t));
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(slug, phone, code);
      navigate(`/${slug}/portal/home${kioskSuffix}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.portal.login.incorrectCode"));
    } finally {
      setLoading(false);
    }
  }

  async function onResend(): Promise<void> {
    if (cooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const r = await requestOtp(slug, phone);
      setOtpMeta(r);
      setCooldown(r.cooldownSec ?? 30);
      if (r.devCode) setCode(r.devCode);
    } catch (err) {
      setError(translatePortalError(err, t));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -right-16 top-8 h-48 w-48 rounded-full bg-teal-400/30 blur-3xl" />
        <div className="absolute -left-12 bottom-24 h-40 w-40 rounded-full bg-teal-400/25 blur-3xl" />
      </div>

      <div className="relative flex min-h-[min(100%,42rem)] flex-1 flex-col lg:min-h-[min(100%,36rem)] lg:flex-row">
        {/* Sol: masaüstü / geniş kiosk */}
        <section
          className="relative hidden min-h-0 flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 px-8 py-10 text-white lg:flex"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <ToothLogo className="h-11 w-11" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-100/90">{t("common.appName")}</p>
                <p className="text-sm font-bold text-white">{t("pages.portal.login.heroKicker")}</p>
              </div>
            </div>
            <h1 className="mt-8 max-w-sm text-2xl font-black leading-tight tracking-tight xl:text-3xl">
              {t("pages.portal.login.heroTitle")}
            </h1>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-teal-50/95">{t("pages.portal.login.heroSub")}</p>
          </div>
          <ul className="relative mt-8 space-y-2.5 text-xs font-medium text-teal-50">
            <li className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px]">✓</span>
              {t("pages.portal.login.heroPoint1")}
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px]">✓</span>
              {t("pages.portal.login.heroPoint2")}
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px]">✓</span>
              {t("pages.portal.login.heroPoint3")}
            </li>
          </ul>
          <p className="relative mt-6 text-[10px] text-teal-200/85">{t("pages.portal.login.heroFoot")}</p>
        </section>

        {/* Sağ: OTP formları */}
        <section className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <ToothLogo />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  {t("common.appName")}
                </p>
                <p className="truncate text-xs font-bold text-slate-800">{t("pages.portal.login.heroKicker")}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-900/5 backdrop-blur-sm sm:p-7">
              <h2 className="text-center text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                {step === "phone" ? t("pages.portal.login.titlePhone") : t("pages.portal.login.titleCode")}
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                {step === "phone"
                  ? t("pages.portal.login.subtitlePhone")
                  : t("pages.portal.login.subtitleCode", { phone })}
              </p>

              {step === "phone" ? (
                <form onSubmit={(e) => void onSendOtp(e)} className="mt-8 space-y-4">
                  <div>
                    <label
                      htmlFor="portal-phone"
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {t("pages.portal.login.mobileLabel")}
                    </label>
                    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100">
                      <span className="flex items-center border-r border-slate-200 bg-slate-100/80 px-3 text-sm font-bold text-slate-600">
                        +63
                      </span>
                      <input
                        id="portal-phone"
                        type="tel"
                        autoComplete="tel-national"
                        placeholder={t("pages.portal.login.phonePlaceholder")}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="min-h-12 w-full bg-transparent px-3 py-3 text-base outline-none sm:text-sm"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">{t("pages.portal.login.formatHint")}</p>
                  </div>
                  {error ? (
                    <div
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800"
                      role="alert"
                    >
                      {error}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loading || !phone.trim()}
                    className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        {t("pages.portal.login.sending")}
                      </>
                    ) : (
                      t("pages.portal.login.sendOtp")
                    )}
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-slate-500">
                    {t("pages.portal.login.notPatient")}{" "}
                    <Link
                      to={`/${slug}/portal/register${kioskSuffix}`}
                      className="font-bold text-teal-600 hover:underline"
                    >
                      {t("pages.portal.login.registerLink")}
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={(e) => void onVerify(e)} className="mt-8 space-y-4">
                  <div>
                    <label
                      htmlFor="portal-code"
                      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      {t("pages.portal.login.codeLabel")}
                    </label>
                    <input
                      id="portal-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className={`w-full text-center text-2xl font-black tracking-[0.45em] ${fieldRing}`}
                      placeholder={t("pages.portal.login.codePlaceholder")}
                      required
                    />
                    {otpMeta?.devCode ? (
                      <p className="mt-2 text-[11px] font-medium text-amber-800">
                        {t("pages.portal.login.devAutofill", { code: otpMeta.devCode })}
                      </p>
                    ) : null}
                  </div>
                  {error ? (
                    <div
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-800"
                      role="alert"
                    >
                      {error}
                    </div>
                  ) : null}
                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        {t("pages.portal.login.verifying")}
                      </>
                    ) : (
                      t("pages.portal.login.verifyEnter")
                    )}
                  </button>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("phone");
                        setCode("");
                        setError(null);
                      }}
                      className="min-h-11 text-left text-xs font-semibold text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                    >
                      {t("pages.portal.login.changeNumber")}
                    </button>
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={() => void onResend()}
                      className="min-h-11 rounded-lg px-2 text-xs font-bold text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:text-slate-400 disabled:no-underline"
                    >
                      {cooldown > 0 ? t("pages.portal.login.resendIn", { seconds: cooldown }) : t("pages.portal.login.resend")}
                    </button>
                  </div>
                </form>
              )}

              <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs">
                <Link
                  to="/login"
                  className="font-semibold text-teal-700 underline-offset-2 hover:underline"
                >
                  {t("pages.portal.login.staffLoginCta")}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
