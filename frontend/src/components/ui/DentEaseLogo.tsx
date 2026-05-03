import React from 'react';

export function DentEaseLogo({ size = "md" }: { size?: "sm" | "md" }): JSX.Element {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-md ${size === "sm" ? "h-9 w-9" : "h-12 w-12"}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className={size === "sm" ? "h-5 w-5" : "h-7 w-7"}>
        <path d="M12 2a5 5 0 0 0-5 5c0 2 1 3 1 5s-1 4-1 6a3 3 0 0 0 6 0c0-1 .5-1 1-1s1 0 1 1a3 3 0 0 0 6 0c0-2-1-4-1-6s1-3 1-5a5 5 0 0 0-5-5c-1 0-2 .5-2 1s-1 1-2 1-1-.5-2-1-1-1-2-1Z" />
      </svg>
    </div>
  );
}
