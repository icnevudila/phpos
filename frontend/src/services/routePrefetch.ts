import { apiFetch } from "./api";

const prefetched = new Set<string>();

function manilaDateKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  const m = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${y}-${m}-${day}`;
}

export function prefetchRouteData(path: string): void {
  if (prefetched.has(path)) return;
  prefetched.add(path);

  void (async () => {
    try {
      if (path.startsWith("/appointments")) {
        const date = manilaDateKey(new Date());
        await apiFetch(`/appointments?from=${date}&to=${date}`);
        return;
      }
      if (path.startsWith("/patients")) {
        await apiFetch(`/patients?page=1&limit=20`);
        return;
      }
      if (path.startsWith("/invoices")) {
        await apiFetch(`/invoices`);
        return;
      }
      if (path.startsWith("/hmo-claims")) {
        await apiFetch(`/hmo/claims?limit=50`);
      }
    } catch {
      // Prefetch is best-effort only; ignore all failures.
    }
  })();
}
