interface DentQLLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function DentQLLogo({ className = "", size = "md" }: DentQLLogoProps): JSX.Element {
  const sizeMap = {
    sm: "h-32",
    md: "h-40",
    lg: "h-56",
    xl: "h-72",
    "2xl": "h-96",
  };

  return (
    <div className={`relative flex shrink-0 items-center justify-center p-4 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none ${className}`}>
      <img 
        src="/Firefly.png" 
        alt="Firefly Logo" 
        className={`${sizeMap[size]} w-auto object-contain`}
      />
    </div>
  );
}
