interface Props {
  variant?: "wave" | "curve" | "angle" | "zigzag";
  fromColor?: string;
  toColor?: string;
  flip?: boolean;
}

export function SectionDivider({
  variant = "wave",
  fromColor = "rgba(16,185,129,0.04)",
  toColor = "rgba(14,165,233,0.06)",
  flip = false,
}: Props): JSX.Element {
  const paths: Record<string, string> = {
    wave: "M0,40 C320,120 640,0 960,60 C1280,120 1440,80 1440,80 L1440,120 L0,120 Z",
    curve: "M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 Z",
    angle: "M0,120 L720,0 L1440,120 Z",
    zigzag:
      "M0,60 L240,20 L480,80 L720,10 L960,70 L1200,20 L1440,80 L1440,120 L0,120 Z",
  };

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -my-px ${flip ? "rotate-180" : ""}`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[80px] w-full sm:h-[120px]"
      >
        <defs>
          <linearGradient id="sd-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>
        <path d={paths[variant]} fill="url(#sd-grad)" />
      </svg>
    </div>
  );
}
