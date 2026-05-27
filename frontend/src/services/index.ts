import api from "./api";

const base = (import.meta.env.VITE_API_URL ?? "http://localhost:4010/api").trim();

export const apiBaseUrl = base.replace(/\/$/, "");

export async function fetchHealth(): Promise<unknown> {
  const res = await api.get("/health");
  return res.data;
}
