import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

export function HowItWorksTimeline(): JSX.Element {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 40%"],
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [1, 2, 3].map((i) => ({
    i,
    title: t(`landing.step${i}Title`),
    desc: t(`landing.step${i}Desc`),
  }));

  return (
    <div ref={ref} className="relative mt-16">
      <div className="absolute left-4 right-4 top-6 hidden h-1 rounded-full bg-slate-200 md:block dark:bg-slate-800">
        <motion.div
          style={{ width: fill }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((s, idx) => (
          <motion.div
            key={s.i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: idx * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.12 + 0.2, type: "spring", stiffness: 280, damping: 18 }}
              className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 text-lg font-black text-white shadow-lg ring-4 ring-white dark:ring-slate-950"
            >
              {s.i}
            </motion.div>
            <h3 className="mt-6 text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
