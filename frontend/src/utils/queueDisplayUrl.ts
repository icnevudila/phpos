/** Lobby TV URL — token must match backend `PUBLIC_QUEUE_DISPLAY_TOKEN`. */
export function buildQueueDisplayUrl(origin: string, slug: string, clinicId: string): string {
  const token =
    (import.meta.env.VITE_PUBLIC_QUEUE_DISPLAY_TOKEN as string | undefined)?.trim() ||
    "YOUR_DISPLAY_TOKEN";
  const q = new URLSearchParams({
    tv: "1",
    token,
    slug,
    clinicId,
  });
  return `${origin}/queue/display?${q.toString()}`;
}
