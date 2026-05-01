import { motion } from "framer-motion";

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e"];

export function Confetti({ count = 18 }: { count?: number }): JSX.Element {
  const pieces = Array.from({ length: count }).map((_, i) => {
    const x = (Math.random() - 0.5) * 300;
    const y = -Math.random() * 200 - 60;
    const rot = (Math.random() - 0.5) * 720;
    const color = COLORS[i % COLORS.length];
    const delay = Math.random() * 0.15;
    const size = 6 + Math.random() * 6;
    return { x, y, rot, color, delay, size };
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: 0 }}
          transition={{ duration: 1.3, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-1/2 block rounded-sm"
          style={{
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
