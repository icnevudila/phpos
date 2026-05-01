/** Landing / demo: hasta portal yolu `/{slug}/portal`. Seed varsayılanı: `iloilo-demo`. */
export const PORTAL_DEMO_SLUG: string =
  (import.meta.env.VITE_PORTAL_DEMO_SLUG as string | undefined)?.trim() || "iloilo-demo";
