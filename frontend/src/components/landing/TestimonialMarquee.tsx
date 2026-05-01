import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Quote {
  q: string;
  n: string;
  r: string;
  gradient: string;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

function QuoteCard({ q, n, r, gradient }: Quote): JSX.Element {
  return (
    <figure className="group relative flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[360px] dark:border-slate-800 dark:bg-slate-900">
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        className="h-6 w-6 text-emerald-200"
        fill="currentColor"
      >
        <path d="M10 8c-3 0-5 2-5 5v11h10V13h-5c0-2 2-3 4-3V8h-4Zm14 0c-3 0-5 2-5 5v11h10V13h-5c0-2 2-3 4-3V8h-4Z" />
      </svg>
      <blockquote className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{q}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold text-white shadow-sm`}
        >
          {initialsOf(n)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{n}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{r}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Row({
  items,
  direction = "left",
  duration = 40,
}: {
  items: Quote[];
  direction?: "left" | "right";
  duration?: number;
}): JSX.Element {
  const reduce = useReducedMotion();
  const loop = [...items, ...items];

  if (reduce) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map((q, i) => (
          <QuoteCard key={i} {...q} />
        ))}
      </div>
    );
  }

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        className="flex gap-4 will-change-transform group-hover:[animation-play-state:paused]"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
        style={{ width: "max-content" }}
      >
        {loop.map((q, i) => (
          <QuoteCard key={i} {...q} />
        ))}
      </motion.div>
    </div>
  );
}

export function TestimonialMarquee(): JSX.Element {
  const { t } = useTranslation();

  const quotes: Quote[] = Array.from({ length: 10 }).map((_, i) => ({
    q: t(`landing.testi${i + 1}Quote`),
    n: t(`landing.testi${i + 1}Name`),
    r: t(`landing.testi${i + 1}Role`),
    gradient: [
      "from-emerald-400 to-sky-500",
      "from-amber-400 to-rose-500",
      "from-sky-400 to-violet-500",
      "from-violet-500 to-fuchsia-500",
      "from-emerald-400 to-teal-500",
      "from-rose-400 to-orange-500",
      "from-sky-400 to-indigo-500",
      "from-amber-300 to-rose-400",
      "from-fuchsia-400 to-pink-500",
      "from-teal-400 to-emerald-600",
    ][i],
  }));

  const rowA = quotes.slice(0, 5);
  const rowB = quotes.slice(5);

  return (
    <div className="space-y-4">
      <Row items={rowA} direction="left" duration={45} />
      <Row items={rowB} direction="right" duration={55} />
    </div>
  );
}
