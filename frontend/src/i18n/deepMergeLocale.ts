/**
 * Deep-merge locale JSON: nested objects merge; arrays and scalars from `override` replace `base`.
 * Used so `ph` can ship `ph-pages/*.json` overlays on top of `pages.en.json` (see `phPagesOverlay.ts`).
 */
export function deepMergeLocale(
  base: Record<string, unknown>,
  override: Record<string, unknown> | undefined,
): Record<string, unknown> {
  if (!override) return { ...base };
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    const bVal = base[key];
    const oVal = override[key];
    const bObj = bVal !== null && typeof bVal === "object" && !Array.isArray(bVal);
    const oObj = oVal !== null && typeof oVal === "object" && !Array.isArray(oVal);
    if (bObj && oObj) {
      out[key] = deepMergeLocale(bVal as Record<string, unknown>, oVal as Record<string, unknown>);
    } else {
      out[key] = oVal;
    }
  }
  return out;
}
