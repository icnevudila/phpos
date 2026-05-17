import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as IconUsers,
  CheckCircle2 as IconDone,
  Stethoscope as IconStethoscope,
  MapPin as IconRoom,
  Activity,
  Calendar,
  Volume2,
  ShieldCheck,
  Heart,
  WifiOff,
} from "lucide-react";

import { fetchPublicQueue, type PublicQueueItem } from "../services/publicQueue";

const POLL_MS = 15_000;

export function PublicQueuePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const tvMode = searchParams.get("tv") === "1";
  const token = searchParams.get("token") ?? "";
  const clinicId = searchParams.get("clinicId") ?? undefined;
  const slug = searchParams.get("slug") ?? undefined;

  const [queue, setQueue] = useState<PublicQueueItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const canFetch = Boolean(token && (clinicId || slug));

  const fetchQueue = useCallback(async () => {
    if (!canFetch) return;
    try {
      const data = await fetchPublicQueue({ token, clinicId, slug });
      setQueue(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t("pages.publicQueue.loadFailed"));
    }
  }, [canFetch, token, clinicId, slug, t]);

  useEffect(() => {
    const onOnline = (): void => {
      setOnline(true);
      void fetchQueue();
    };
    const onOffline = (): void => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [fetchQueue]);

  useEffect(() => {
    void fetchQueue();
    const qInterval = setInterval(() => void fetchQueue(), POLL_MS);
    const tInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(qInterval);
      clearInterval(tInterval);
    };
  }, [fetchQueue]);

  useEffect(() => {
    if (!tvMode) return;
    const el = document.documentElement;
    el.requestFullscreen?.().catch(() => undefined);
    return () => {
      if (document.fullscreenElement === el) {
        void document.exitFullscreen?.().catch(() => undefined);
      }
    };
  }, [tvMode]);

  const serving = useMemo(
    () => queue.filter((p) => p.status === "IN_PROGRESS"),
    [queue],
  );
  const waiting = useMemo(
    () => queue.filter((p) => p.status !== "IN_PROGRESS"),
    [queue],
  );

  const statusLabel = (status: string): string => {
    if (status === "CHECKED_IN") return t("pages.publicQueue.statusProceeding");
    if (status === "IN_PROGRESS") return t("pages.publicQueue.statusInProgress");
    return t("pages.publicQueue.statusWaiting");
  };

  if (!canFetch) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 p-8 text-center text-white">
        <div className="max-w-lg space-y-4">
          <IconStethoscope className="mx-auto text-emerald-400" size={48} />
          <h1 className="text-2xl font-black">{t("pages.publicQueue.setupTitle")}</h1>
          <p className="text-slate-400">{t("pages.publicQueue.setupHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-full flex-col overflow-hidden bg-[#fafbfc] font-sans text-slate-900 dark:bg-slate-950 ${
        tvMode ? "text-[1.08rem]" : ""
      }`}
    >
      {!online ? (
        <div
          role="alert"
          className="flex shrink-0 items-center justify-center gap-3 bg-amber-500 px-4 py-3 text-sm font-bold text-amber-950"
        >
          <WifiOff size={18} aria-hidden />
          {t("pages.publicQueue.offlineBanner")}
        </div>
      ) : null}

      {loadError ? (
        <motion.div
          role="alert"
          className="shrink-0 bg-rose-600 px-6 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
        >
          {loadError}
        </motion.div>
      ) : null}

      <header
        className={`flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-8 shadow-2xl shadow-slate-200/20 backdrop-blur-2xl dark:border-slate-800/50 dark:bg-slate-900/80 dark:shadow-none md:px-12 ${
          tvMode ? "h-24 md:h-28 md:px-16" : "h-32"
        }`}
      >
        <div className="flex items-center gap-8">
          <div className="relative h-14 w-14 rounded-[1.5rem] bg-slate-900 text-white shadow-2xl dark:bg-white dark:text-slate-900 md:h-16 md:w-16">
            <IconStethoscope className="absolute inset-0 m-auto" size={tvMode ? 36 : 32} />
          </div>
          <div className="space-y-1">
            <h1
              className={`font-black leading-none tracking-tight text-slate-900 dark:text-white ${
                tvMode ? "text-4xl md:text-5xl" : "text-3xl md:text-5xl"
              }`}
            >
              {t("pages.publicQueue.brand")}{" "}
              <span className="italic text-emerald-500">{t("pages.publicQueue.brandAccent")}</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 md:text-xs">
              {t("pages.publicQueue.subtitle")}
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <p
            className={`font-black tabular-nums leading-none tracking-tighter text-slate-900 dark:text-white ${
              tvMode ? "text-5xl md:text-6xl" : "text-4xl md:text-6xl"
            }`}
          >
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 md:text-xs">
            <Calendar size={14} aria-hidden />
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <section className="relative flex w-full flex-col overflow-hidden bg-white p-10 dark:bg-slate-900 md:w-[48%] md:p-16">
          <h2 className="mb-10 flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-slate-400">
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
            </span>
            {t("pages.publicQueue.activeSession")}
          </h2>

          <div className="flex flex-1 flex-col justify-center">
            <AnimatePresence mode="wait">
              {serving.length > 0 ? (
                serving.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="space-y-8"
                  >
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-500 px-6 py-3 text-white shadow-xl">
                      <IconRoom size={24} aria-hidden />
                      <span className="text-xl font-black uppercase md:text-2xl">{p.room}</span>
                    </div>
                    <h3
                      className={`break-words font-black uppercase leading-[0.85] tracking-tighter text-slate-900 dark:text-white ${
                        tvMode ? "text-7xl md:text-[8rem]" : "text-6xl md:text-8xl"
                      }`}
                    >
                      {p.patientName}
                    </h3>
                    <p className="text-2xl font-black uppercase italic tracking-tight text-emerald-500 opacity-80 md:text-4xl">
                      {p.procedure}
                    </p>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <Activity size={64} className="text-slate-200 dark:text-slate-700" aria-hidden />
                  <p className="text-4xl font-black uppercase italic leading-tight tracking-tighter text-slate-200 dark:text-slate-800 md:text-6xl">
                    {t("pages.publicQueue.standbyLine1")}
                    <br />
                    {t("pages.publicQueue.standbyLine2")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto rounded-[2rem] border border-slate-800 bg-slate-900 p-8">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
              <Volume2 size={14} aria-hidden />
              {t("pages.publicQueue.announcementKicker")}
            </p>
            <p className="text-lg font-bold leading-snug text-white md:text-xl">
              {t("pages.publicQueue.announcementBody")}
            </p>
          </div>
        </section>

        <section className="relative flex w-full flex-col overflow-hidden p-10 md:w-[52%] md:p-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] text-slate-400">
              <IconUsers size={18} className="opacity-40" aria-hidden />
              {t("pages.publicQueue.waitlistTitle")}
            </h2>
            <div className="rounded-2xl bg-white px-6 py-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
              {t("pages.publicQueue.pipelineCount", { count: waiting.length })}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {waiting.slice(0, tvMode ? 8 : 6).map((p, idx) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-[2.5rem] border border-slate-50 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 md:p-8"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-black italic tabular-nums text-slate-100 dark:text-slate-800 md:text-5xl">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <motion.div>
                      <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white md:text-3xl">
                        {p.patientName}
                      </h4>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {p.dentistName} · {p.room}
                      </p>
                    </motion.div>
                  </div>
                  <span
                    className={`shrink-0 rounded-2xl px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                      p.status === "CHECKED_IN"
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                    }`}
                  >
                    {statusLabel(p.status)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 opacity-40 md:gap-16">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]">
              <ShieldCheck size={18} className="text-emerald-500" aria-hidden />
              {t("pages.publicQueue.footerEncrypted")}
            </span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]">
              <IconDone size={18} className="text-emerald-500" aria-hidden />
              {t("pages.publicQueue.footerSync")}
            </span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em]">
              <Heart size={18} className="text-rose-500" aria-hidden />
              {t("pages.publicQueue.footerCare")}
            </span>
          </div>
        </section>
      </main>

      <footer className="flex h-14 shrink-0 items-center overflow-hidden bg-emerald-500 md:h-16">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap text-xs font-black uppercase tracking-[0.35em] text-white md:text-sm"
        >
          {[0, 1].map((dup) => (
            <span key={dup} className="flex gap-16">
              <span>{t("pages.publicQueue.ticker1")}</span>
              <span>{t("pages.publicQueue.ticker2")}</span>
              <span>{t("pages.publicQueue.ticker3")}</span>
            </span>
          ))}
        </motion.div>
      </footer>
    </div>
  );
}
