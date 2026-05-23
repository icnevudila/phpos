import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionProps } from "framer-motion";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useTranslation } from "react-i18next";

export interface FeatureDef {
  id: string;
  title: string;
  desc: string;
  longDesc?: string;
  d: string;
  color: string;
  accent: string;
  preview: JSX.Element;
  /** Staff app path for “open this screen” (ProtectedRoute sends guests to `/login`) */
  tryInAppPath?: string;
}

interface FeatureCardProps extends Pick<FeatureDef, "id" | "title" | "desc" | "d" | "color" | "accent"> {
  onClick: () => void;
  layoutProps?: MotionProps;
}

export function FeatureCard({
  id,
  title,
  desc,
  d,
  color,
  accent,
  onClick,
}: FeatureCardProps): JSX.Element {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 220, damping: 22 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const glowBg = useMotionTemplate`radial-gradient(400px circle at ${glowX} ${glowY}, rgba(16,185,129,0.14), transparent 45%)`;

  function onMove(e: ReactMouseEvent<HTMLButtonElement>): void {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave(): void {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.button
      layoutId={`feature-card-${id}`}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border bg-brand-surface p-6 text-left shadow-sm transition hover:shadow-xl [transform-style:preserve-3d]"
    >
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: glowBg }}
        />
      )}
      <motion.div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition group-hover:opacity-40 ${accent}`}
      />
      <motion.div
        layoutId={`feature-icon-${id}`}
        className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
        style={{ transform: "translateZ(20px)" }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d={d} />
        </svg>
      </motion.div>
      <motion.h3
        layoutId={`feature-title-${id}`}
        className="relative mt-4 text-lg font-semibold text-brand-text"
      >
        {title}
      </motion.h3>
      <motion.p
        layoutId={`feature-desc-${id}`}
        className="relative mt-2 text-sm leading-relaxed text-brand-muted"
      >
        {desc}
      </motion.p>
      <div className="relative mt-4 flex items-center gap-1.5 text-xs font-medium text-brand-muted transition group-hover:translate-x-1 group-hover:text-brand-text">
        {t("landing.featurePreview")}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  );
}
