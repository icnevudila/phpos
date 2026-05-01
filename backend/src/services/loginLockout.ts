const LOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

interface Entry {
  failures: number;
  lockedUntil: number;
}

const store = new Map<string, Entry>();

function keyForEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isLoginLocked(email: string): boolean {
  const k = keyForEmail(email);
  const e = store.get(k);
  if (!e || e.lockedUntil === 0) return false;
  const now = Date.now();
  if (now >= e.lockedUntil) {
    store.delete(k);
    return false;
  }
  return true;
}

export function recordLoginFailure(email: string): void {
  const k = keyForEmail(email);
  const now = Date.now();
  let e = store.get(k);
  if (e && e.lockedUntil > 0 && now < e.lockedUntil) {
    return;
  }
  if (e && e.lockedUntil > 0 && now >= e.lockedUntil) {
    e = undefined;
  }
  const failures = (e?.failures ?? 0) + 1;
  const lockedUntil = failures >= MAX_FAILURES ? now + LOCK_MS : 0;
  store.set(k, { failures, lockedUntil });
}

export function resetLoginFailures(email: string): void {
  store.delete(keyForEmail(email));
}
