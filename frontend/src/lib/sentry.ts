/** Optional error tracking — set VITE_SENTRY_DSN in env. */
export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn) return;

  let Sentry: typeof import("@sentry/react");
  try {
    Sentry = await import("@sentry/react");
  } catch {
    console.warn("[sentry] @sentry/react not installed — skip init");
    return;
  }
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}
