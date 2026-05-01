const base = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const apiBaseUrl = base.replace(/\/$/, "");

export async function fetchHealth(): Promise<unknown> {
  const res = await fetch(`${apiBaseUrl}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json() as Promise<unknown>;
}
