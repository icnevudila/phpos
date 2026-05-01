import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgressBar(): JSX.Element {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
      aria-hidden
    />
  );
}
