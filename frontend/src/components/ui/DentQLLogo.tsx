interface DentQLLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** `app` = compact (auth, nav). `marketing` = large hero display. */
  variant?: "app" | "marketing";
}

const APP_SIZES: Record<NonNullable<DentQLLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
  "2xl": "h-16 w-16",
};

const MARKETING_SIZES: Record<NonNullable<DentQLLogoProps["size"]>, string> = {
  sm: "h-24",
  md: "h-32",
  lg: "h-40",
  xl: "h-48",
  "2xl": "h-56",
};

export function DentQLLogo({
  className = "",
  size = "md",
  variant = "app",
}: DentQLLogoProps): JSX.Element {
  if (variant === "marketing") {
    return (
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-3xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/40 ${className}`}
      >
        <img
          src="/Firefly.png"
          alt="DentQL"
          className={`${MARKETING_SIZES[size]} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <img
      src="/Firefly.png"
      alt="DentQL"
      className={`object-contain ${APP_SIZES[size]} ${className}`}
    />
  );
}
