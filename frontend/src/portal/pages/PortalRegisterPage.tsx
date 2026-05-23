import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { translatePortalError } from "../translatePortalError";
import { usePortalKioskSuffix } from "../usePortalKioskSuffix";
import {
  hasPortalToken,
  registerPortalPatient,
  requestOtp,
  verifyOtp,
  type RequestOtpResponse,
} from "../services/portalApi";

const fieldRing =
  "rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100   ";

export function PortalRegisterPage(): JSX.Element {
  const { t } = useTranslation();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const kioskSuffix = usePortalKioskSuffix();

  const [step, setStep] = useState<"form" | "code">("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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

  async function onRegister(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await registerPortalPatient(slug, {
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });
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
      setError(translatePortalError(err, t));
    } finally {
      setLoading(false);
    }
  }

  async function onResendOtp(): Promise<void> {
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
    <div>
      <div className="mx-auto w-full max-w-sm px-4 py-8">
        <h2 className="text-center text-xl font-black text-slate-900">
          {step === "form" ? t("pages.portal.register.title", { defaultValue: "Title" }) : t("pages.portal.login.titleCode", { defaultValue: "Title Code" })}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {step === "form" ? t("pages.portal.register.subtitle", { defaultValue: "Subtitle" }) : t("pages.portal.login.subtitleCode", { phone })}
        </p>

        {step === "form" ? (
          <form onSubmit={(e) => void onRegister(e)} className="mt-6 space-y-4">
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("pages.portal.register.firstName", { defaultValue: "First Name" })}
              className={fieldRing}
            />
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("pages.portal.register.lastName", { defaultValue: "Last Name" })}
              className={fieldRing}
            />
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("pages.portal.login.phonePlaceholder", { defaultValue: "Phone Placeholder" })}
              className={fieldRing}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("pages.portal.register.emailOptional", { defaultValue: "Email Optional" })}
              className={fieldRing}
            />
            {error ? <p className="text-xs font-bold text-rose-600" role="alert">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? t("pages.portal.register.submitting", { defaultValue: "Submitting" }) : t("pages.portal.register.submit", { defaultValue: "Submit" })}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void onVerify(e)} className="mt-6 space-y-4">
            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("pages.portal.login.codeLabel", { defaultValue: "Code Label" })}
              className={`${fieldRing} text-center tracking-[0.4em]`}
            />
            {error ? <p className="text-xs font-bold text-rose-600" role="alert">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full min-h-12 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? t("pages.portal.login.verifying", { defaultValue: "Verifying" }) : t("pages.portal.login.verifyEnter", { defaultValue: "Verify Enter" })}
            </button>
            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={() => void onResendOtp()}
              className="w-full text-xs font-bold text-teal-600 disabled:opacity-40"
            >
              {cooldown > 0
                ? t("pages.portal.login.resendIn", { seconds: cooldown })
                : t("pages.portal.login.resend", { defaultValue: "Resend" })}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          {t("pages.portal.register.haveAccount", { defaultValue: "Have Account" })}{" "}
          <Link to={`/${slug}/portal/login${kioskSuffix}`} className="font-bold text-teal-600">
            {t("pages.portal.register.signIn", { defaultValue: "Sign In" })}
          </Link>
        </p>
      </div>
    </div>
  );
}
