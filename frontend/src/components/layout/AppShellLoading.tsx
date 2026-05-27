import { useTranslation } from "react-i18next";

export function AppShellLoading(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-6 py-16 bg-brand-bg select-none"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Logo Wrapper */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          {/* Outer glowing pulsing aura */}
          <span className="absolute inset-0 rounded-full bg-teal-500/10 animate-ping opacity-60 duration-1000" />
          <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-teal-500/10 to-sky-500/10 animate-pulse duration-1500" />
          
          {/* Logo SVG Container */}
          <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-xl shadow-teal-500/10 border border-teal-50/50">
            <svg viewBox="0 0 100 100" className="h-16 w-16" aria-hidden>
              <defs>
                <linearGradient id="logoTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky 500 */}
                  <stop offset="100%" stopColor="#0f9f9a" /> {/* Teal Brand */}
                </linearGradient>
                <linearGradient id="logoMirrorGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#083344" /> {/* Cyan 900 */}
                  <stop offset="100%" stopColor="#0d9488" /> {/* Teal 600 */}
                </linearGradient>
              </defs>
              
              {/* Tooth Outline (Left side and Roots) */}
              <path 
                d="M 40 25 
                   C 20 22, 18 45, 20 58 
                   C 22 70, 24 85, 32 88 
                   C 38 90, 44 78, 48 70 
                   C 52 78, 58 90, 64 88 
                   C 72 85, 74 70, 76 58 
                   C 78 48, 77 36, 73 28" 
                fill="none" 
                stroke="url(#logoTealGrad)" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="animate-pulse"
                style={{ animationDuration: '2s' }}
              />

              {/* Tooth Top Crown Left curve */}
              <path 
                d="M 40 25 C 44 28, 46 28, 50 25" 
                fill="none" 
                stroke="url(#logoTealGrad)" 
                strokeWidth="6" 
                strokeLinecap="round"
              />

              {/* Dental Mirror Handle wrapping diagonally */}
              <path 
                d="M 23 60 C 35 48, 50 35, 68 23" 
                fill="none" 
                stroke="url(#logoMirrorGrad)" 
                strokeWidth="5" 
                strokeLinecap="round"
              />

              {/* Dental Mirror Circle Head */}
              <circle 
                cx="72" 
                cy="20" 
                r="9" 
                fill="#ffffff" 
                stroke="url(#logoTealGrad)" 
                strokeWidth="5.5" 
              />
              {/* Mirror Inner Reflection reflection arc */}
              <path 
                d="M 69 17 A 6 6 0 0 1 75 15" 
                fill="none" 
                stroke="#0ea5e9" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Brand Text Rendering matching the upload */}
        <div className="text-center space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-0.5">
            <span className="text-[#1e3a8a]">{t("common.appNameLeft", { defaultValue: "Dent" })}</span>
            <span className="bg-gradient-to-r from-sky-500 to-[#0f9f9a] bg-clip-text text-transparent">{t("common.appNameRight", { defaultValue: "QL" })}</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
            {t("common.appSubTitle", { defaultValue: "Advanced Dental Management System" })}
          </p>
          <p className="pt-2 text-xs font-semibold text-teal-600/90 animate-pulse uppercase tracking-wider">
            {t("common.preparingWorkspace", { defaultValue: "Preparing workspace..." })}
          </p>
        </div>
      </div>

      {/* Modern Wave Shimmer Loading Indicator */}
      <div className="flex items-center gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 opacity-80 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

