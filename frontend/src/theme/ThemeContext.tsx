import { useEffect, type ReactNode } from "react";

const KEY = "dentease-theme-v2";

/**
 * DentEase yalnızca açık (light) tema kullanır; karanlık mod yok.
 * Kayıtlı "dark" tercihini ve `html.dark` sınıfını kaldırır.
 */
export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    try {
      localStorage.setItem(KEY, "light");
    } catch {
      /* ignore */
    }
  }, []);

  return <>{children}</>;
}
