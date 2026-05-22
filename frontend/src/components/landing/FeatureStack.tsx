import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string;
  index: number;
  total: number;
}

function FeatureStackCard({ title, desc, icon, index, total }: FeatureCardProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Each card starts appearing later based on its index
  const start = index / total;
  const end = (index + 1) / total;
  
  return (
    <div className="sticky top-32 mb-32 flex w-full justify-center px-6">
      <motion.div 
        style={{
           scale: 1 - (total - index) * 0.05,
           top: index * 20,
        }}
        className="relative h-[500px] w-full max-w-5xl overflow-hidden rounded-[3.5rem] border border-teal-50 bg-white p-12 shadow-[0_40px_80px_-15px_rgba(16,185,129,0.1)] md:h-[600px] md:p-20"
      >
        <div className="grid h-full gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-5xl shadow-inner">
               {icon}
            </div>
            <h3 className="text-4xl font-black tracking-tighter text-slate-900 md:text-6xl uppercase leading-none">
              {title}
            </h3>
            <p className="text-xl font-semibold leading-relaxed text-slate-500 md:text-2xl">
              {desc}
            </p>
          </div>
          
          <div className="relative hidden lg:block">
             <div className="aspect-[4/3] w-full rounded-[2.5rem] bg-slate-50 p-4">
                {/* Visual Placeholder for high-fidelity screenshots */}
                <div className="h-full w-full rounded-2xl border border-slate-100 bg-white shadow-sm">
                   <div className="flex h-10 items-center border-b border-slate-50 px-4 gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                   </div>
                   <div className="p-8 space-y-4">
                      <div className="h-4 w-1/3 rounded-full bg-teal-100" />
                      <div className="h-24 w-full rounded-2xl bg-slate-50" />
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-20 rounded-2xl bg-slate-50" />
                         <div className="h-20 rounded-2xl bg-teal-50" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FeatureStack(): JSX.Element {
  const { t } = useTranslation();
  const targetRef = useRef<HTMLDivElement>(null);
  
  const features = [
    { title: t("landing.f1Title"), desc: t("landing.f1Desc"), icon: "📅" },
    { title: t("landing.f2Title"), desc: t("landing.f2Desc"), icon: "🦷" },
    { title: t("landing.f4Title"), desc: t("landing.f4Desc"), icon: "💳" },
    { title: t("landing.f3Title"), desc: t("landing.f3Desc"), icon: "📋" },
  ];

  return (
    <section ref={targetRef} className="relative py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 mb-20 text-center lg:text-left">
         <h2 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl uppercase leading-none">
            {t("landing.capTitle", { defaultValue: "One platform, every workflow." })}
         </h2>
      </div>
      
      <div className="relative">
        {features.map((f, i) => (
          <FeatureStackCard 
            key={i} 
            {...f} 
            index={i} 
            total={features.length} 
          />
        ))}
      </div>
    </section>
  );
}
