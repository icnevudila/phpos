import type { PerioSiteCode, PerioToothDto } from '../../services/perio';

export const SITE_CODES: PerioSiteCode[] = ['MB', 'B', 'DB', 'DL', 'L', 'ML'];

export const SITE_ANGLES: Record<PerioSiteCode, number> = {
  MB: 300, B: 270, DB: 240, DL: 120, L: 90, ML: 60,
};

export const PD_COLORS = {
  healthy: '#22c55e', warning: '#eab308', moderate: '#f97316', severe: '#dc2626',
};

export function getPDColor(depth: number): string {
  if (depth <= 3) return PD_COLORS.healthy;
  if (depth <= 5) return PD_COLORS.warning;
  if (depth <= 8) return PD_COLORS.moderate;
  return PD_COLORS.severe;
}

export function getPDLabel(depth: number): string {
  if (depth <= 3) return 'Healthy';
  if (depth <= 5) return 'Warning';
  if (depth <= 8) return 'Moderate';
  return 'Severe';
}

export function calcCAL(pd: number, rec: number): number {
  return pd + rec;
}

export function sitePos(angleDeg: number, cx: number, cy: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}

export function isUpperTooth(n: number): boolean {
  return n >= 1 && n <= 16;
}

export function sortTeeth(teeth: PerioToothDto[]) {
  return {
    upper: teeth.filter((t) => isUpperTooth(t.toothNumber)).sort((a, b) => a.toothNumber - b.toothNumber),
    lower: teeth.filter((t) => !isUpperTooth(t.toothNumber)).sort((a, b) => b.toothNumber - a.toothNumber),
  };
}
