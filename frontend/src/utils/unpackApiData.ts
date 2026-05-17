/** Axios interceptor returns body directly; typings may still say AxiosResponse. */
export function unpackApiData<T>(res: unknown): T {
  if (Array.isArray(res)) return res as T;
  if (res && typeof res === "object" && "data" in res) {
    const wrapped = res as { data?: unknown };
    if (wrapped.data !== undefined) return wrapped.data as T;
  }
  return res as T;
}
