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
      className={`group relative overflow-hidden rounded-[2.5rem] border border-teal-50 bg-brand-surface p-10 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.06)] transition-all hover:scale-[1.02] hover:shadow-[0_48px_80px_-20px_rgba(16,185,129,0.12)] ${className}`}
    >
      <div className="relative z-10">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-black tracking-tighter text-brand-text uppercase leading-none">
          {title}
        </h3>
        <p className="mt-4 text-base font-semibold leading-relaxed text-brand-muted">
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
    <section className="py-32 bg-brand-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-20 text-center lg:text-left">
           <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 ring-1 ring-teal-100">
              {t("landing.featurePreviewBadge", { defaultValue: "Feature Preview Badge" })}
           </div>
           <h2 className="mt-6 text-5xl font-black tracking-tighter text-brand-text sm:text-6xl uppercase leading-[1.05]">
              {t("landing.capTitle", { defaultValue: "One platform, every workflow." })}
           </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <BentoCard 
            title={t("landing.f1Title", { defaultValue: "F1 Title" })}
            desc={t("landing.f1Desc", { defaultValue: "F1 Desc" })}
            icon="📅"
            className="lg:col-span-2"
            delay={0.1}
          />
          <BentoCard 
            title={t("landing.f2Title", { defaultValue: "F2 Title" })}
            desc={t("landing.f2Desc", { defaultValue: "F2 Desc" })}
            icon="🦷"
            delay={0.2}
          />
          <BentoCard 
            title={t("landing.f4Title", { defaultValue: "F4 Title" })}
            desc={t("landing.f4Desc", { defaultValue: "F4 Desc" })}
            icon="💳"
            delay={0.3}
          />
          <BentoCard 
            title={t("landing.cap5Title", { defaultValue: "Cap5 Title" })}
            desc={t("landing.cap5Desc", { defaultValue: "Cap5 Desc" })}
            icon="⏱️"
            className="lg:col-span-2"
            delay={0.4}
          />
          <BentoCard 
            title={t("landing.f5Title", { defaultValue: "F5 Title" })}
            desc={t("landing.f5Desc", { defaultValue: "F5 Desc" })}
            icon="📦"
            delay={0.5}
          />
          <BentoCard 
            title={t("landing.f3Title", { defaultValue: "F3 Title" })}
            desc={t("landing.f3Desc", { defaultValue: "F3 Desc" })}
            icon="📋"
            className="lg:col-span-2"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
}
