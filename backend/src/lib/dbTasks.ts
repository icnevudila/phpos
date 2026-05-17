/** Supabase PgBouncer / tek bağlantılı pool — Promise.all timeout (P2024) üretir. */
export function isPgBouncerSingleConnection(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return /connection_limit=1|pgbouncer=true/i.test(url);
}

/** Tek bağlantıda sıralı, aksi halde paralel. Çağrıda `as const` kullanın. */
export async function dbTasks<const T extends readonly (() => Promise<unknown>)[]>(
  tasks: T,
): Promise<{ -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  if (isPgBouncerSingleConnection()) {
    const results: unknown[] = [];
    for (const task of tasks) {
      results.push(await task());
    }
    return results as { -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> };
  }
  return Promise.all(tasks.map((task) => task())) as Promise<{
    -readonly [K in keyof T]: Awaited<ReturnType<T[K]>>;
  }>;
}
