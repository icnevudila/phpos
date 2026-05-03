import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

function BentoCard({ 
  title, 
  desc, 
  icon, 
  className = "", 
  delay = 0 
}: { 
  title: string; 
  desc: string; 
  icon: string; 
  className?: string;
  delay?: number;
}): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`group relative overflow-hidden rounded-[2.5rem] border border-emerald-50 bg-white p-10 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_48px_80px_-20px_rgba(16,185,129,0.12)] ${className}`}
    >
      <div className="relative z-10">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
          {title}
        </h3>
        <p className="mt-4 text-base font-semibold leading-relaxed text-slate-500 dark:text-slate-400">
          {desc}
        </p>
      </div>
      {/* Decorative patterns */}
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <span className="text-[120px] leading-none select-none">{icon}</span>
      </div>
    </motion.div>
  );
}

export function WallOfLove(): JSX.Element {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center lg:text-left">
           <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 ring-1 ring-emerald-100">
              {t("landing.featurePreviewBadge")}
           </div>
           <h2 className="mt-6 text-5xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-6xl uppercase leading-[1.05]">
              {t("landing.capTitle", { defaultValue: "One platform, every workflow." })}
           </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <BentoCard 
            title={t("landing.f1Title")}
            desc={t("landing.f1Desc")}
            icon="📅"
            className="lg:col-span-2"
            delay={0.1}
          />
          <BentoCard 
            title={t("landing.f2Title")}
            desc={t("landing.f2Desc")}
            icon="🦷"
            delay={0.2}
          />
          <BentoCard 
            title={t("landing.f4Title")}
            desc={t("landing.f4Desc")}
            icon="💳"
            delay={0.3}
          />
          <BentoCard 
            title={t("landing.cap5Title")}
            desc={t("landing.cap5Desc")}
            icon="⏱️"
            className="lg:col-span-2"
            delay={0.4}
          />
          <BentoCard 
            title={t("landing.f5Title")}
            desc={t("landing.f5Desc")}
            icon="📦"
            delay={0.5}
          />
          <BentoCard 
            title={t("landing.f3Title")}
            desc={t("landing.f3Desc")}
            icon="📋"
            className="lg:col-span-2"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
}
