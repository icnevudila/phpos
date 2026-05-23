import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { MarketingShell } from "../components/marketing/MarketingShell";

const inp =
  "mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm   ";

export function ContactPage(): JSX.Element {
  const { t } = useTranslation();
  const [clinic, setClinic] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [chairs, setChairs] = useState("1");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    if (!clinic.trim() || !name.trim() || !email.trim() || !agree) {
      toast.error(t("pages.contact.errorRequired", { defaultValue: "Error Required" }));
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSent(true);
      toast.success(t("pages.contact.successTitle", { defaultValue: "Success Title" }));
    }, 700);
  }

  return (
    <MarketingShell documentTitleKey="pages.contact.title">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{t("pages.contact.title", { defaultValue: "Title" })}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{t("pages.contact.subtitle", { defaultValue: "Subtitle" })}</p>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-2xl border border-teal-200 bg-teal-50/80 p-6 text-center"
            >
              <p className="text-lg font-bold text-teal-900">{t("pages.contact.successTitle", { defaultValue: "Success Title" })}</p>
              <p className="mt-2 text-sm text-teal-800/90">{t("pages.contact.successBody", { defaultValue: "Success Body" })}</p>
              <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky-700 underline-offset-2 hover:underline">
                {t("pages.marketingShell.navHome", { defaultValue: "Nav Home" })}
              </Link>
            </motion.div>
          ) : (
            <motion.form
              key="f"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              className="mt-10 space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldClinic", { defaultValue: "Field Clinic" })}
                  </label>
                  <input className={inp} required value={clinic} onChange={(e) => setClinic(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldName", { defaultValue: "Field Name" })}
                  </label>
                  <input className={inp} required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldRole", { defaultValue: "Field Role" })}
                  </label>
                  <input
                    className={inp}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder={t("pages.contact.rolePlaceholder", { defaultValue: "Role Placeholder" })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldEmail", { defaultValue: "Field Email" })}
                  </label>
                  <input type="email" className={inp} required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldPhone", { defaultValue: "Field Phone" })}
                  </label>
                  <input className={inp} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldChairs", { defaultValue: "Field Chairs" })}
                  </label>
                  <select className={inp} value={chairs} onChange={(e) => setChairs(e.target.value)}>
                    <option value="1">{t("pages.contact.chairs1", { defaultValue: "Chairs1" })}</option>
                    <option value="2">{t("pages.contact.chairs2", { defaultValue: "Chairs2" })}</option>
                    <option value="4">{t("pages.contact.chairs4", { defaultValue: "Chairs4" })}</option>
                    <option value="7">{t("pages.contact.chairs7", { defaultValue: "Chairs7" })}</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {t("pages.contact.fieldMessage", { defaultValue: "Field Message" })}
                  </label>
                  <textarea
                    className={`${inp} min-h-28 resize-y`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("pages.contact.messagePlaceholder", { defaultValue: "Message Placeholder" })}
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>{t("pages.contact.privacyCheck", { defaultValue: "Privacy Check" })}</span>
              </label>
              <p className="text-xs text-slate-500">{t("pages.contact.finePrint", { defaultValue: "Fine Print" })}</p>
              <button
                type="submit"
                disabled={busy}
                className="min-h-12 w-full rounded-xl bg-gradient-to-r from-teal-500 to-sky-600 text-sm font-bold text-white shadow-md disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {busy ? t("pages.contact.submitting", { defaultValue: "Submitting" }) : t("pages.contact.submit", { defaultValue: "Submit" })}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </MarketingShell>
  );
}
