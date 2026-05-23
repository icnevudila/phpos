import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Quote {
  q: string;
  n: string;
  r: string;
  gradient: string;
  image: string;
}

function QuoteCard({ q, n, r, image }: Quote): JSX.Element {
  return (
    <figure className="group relative flex w-[300px] shrink-0 flex-col gap-4 rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:w-[360px]">
      <div className="absolute -right-2 top-2 opacity-10 transition group-hover:opacity-20">
        <svg viewBox="0 0 32 32" className="h-12 w-12 text-teal-500" fill="currentColor">
          <path d="M10 8c-3 0-5 2-5 5v11h10V13h-5c0-2 2-3 4-3V8h-4Zm14 0c-3 0-5 2-5 5v11h10V13h-5c0-2 2-3 4-3V8h-4Z" />
        </svg>
      </div>
      <blockquote className="relative z-10 text-sm leading-relaxed text-brand-text">{q}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 border-t border-brand-border pt-3">
        <img
          src={image}
          alt={n}
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-teal-50"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-brand-text">{n}</p>
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-teal-600">{r}</p>
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

  const avatars = [
    "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150",
  ];

  const quotes: Quote[] = Array.from({ length: 10 }).map((_, i) => ({
    q: t(`landing.testi${i + 1}Quote`),
    n: t(`landing.testi${i + 1}Name`),
    r: t(`landing.testi${i + 1}Role`),
    image: avatars[i],
    gradient: "",
  }));

  const rowA = quotes.slice(0, 5);
  const rowB = quotes.slice(5);

  return (
    <div className="space-y-4">
      <p className="text-center text-[10px] font-bold uppercase tracking-widest text-brand-muted">
        {t("landing.testimonialsSample")}
      </p>
      <Row items={rowA} direction="left" duration={45} />
      <Row items={rowB} direction="right" duration={55} />
    </div>
  );
}
