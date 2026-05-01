import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  format?: (v: number) => string;
}

export function AnimatedCounter({
  to,
  from = 0,
  duration = 1.8,
  suffix = "",
  prefix = "",
  className = "",
  format,
}: AnimatedCounterProps): JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => {
    const n = Math.round(v);
    return format ? format(n) : `${prefix}${n.toLocaleString()}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, to, duration, count]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
}
