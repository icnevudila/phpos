/** Dashboard KPI/charts/alerts — klinik başına kısa TTL önbellek (Redis yoksa bellek). */

type CacheEntry<T> = { expiresAt: number; value: T };

const store = new Map<string, CacheEntry<unknown>>();

function ttlSec(): number {
  const n = Number(process.env.DASHBOARD_CACHE_TTL_SEC ?? 60);
  return Number.isFinite(n) && n > 0 ? n : 60;
}

function cacheEnabled(): boolean {
  return process.env.DISABLE_DASHBOARD_CACHE !== "1";
}

export function dashboardCacheKey(clinicId: string, segment: string): string {
  return `dash:${clinicId}:${segment}`;
}

export async function withDashboardCache<T>(
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  if (!cacheEnabled()) {
    return loader();
  }
  const now = Date.now();
  const hit = store.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const value = await loader();
  store.set(key, { value, expiresAt: now + ttlSec() * 1000 });
  return value;
}

/** Randevu/ödeme sonrası manuel invalidasyon (ileride event listener). */
export function invalidateDashboardCache(clinicId: string): void {
  const prefix = `dash:${clinicId}:`;
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}

/** Bellek sızıntısını önlemek için süresi dolmuş girdileri temizle. */
export function pruneDashboardCache(): void {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (v.expiresAt <= now) store.delete(k);
  }
}
