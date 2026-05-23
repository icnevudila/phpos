import { useTranslation } from "react-i18next";

export function useSafeTranslation() {
  const { t: originalT, i18n, ready } = useTranslation();

  function t(key: string, fallback?: string, options?: any) {
    const value = originalT(key, options);
    if (!value || value === key) return fallback ?? key;
    return value;
  }

  return { t, i18n, ready };
}