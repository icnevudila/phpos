import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PerioGraphicVisualizer, type PerioPainPointId } from './PerioGraphicVisualizer';

const CH = 'pages.patientDetail.perio.chart';
import type { PerioSiteDto, PerioToothDto } from '../../services/perio';

export interface PeriodontalChartProps {
  teeth?: PerioToothDto[];
  className?: string;
  selectedToothId?: string | number | null;
  selectedPainPointId?: PerioPainPointId | null;
  onToothClick?: (tooth: PerioToothDto) => void;
  onPainPointClick?: (painPointId: PerioPainPointId) => void;
  [key: string]: unknown;
}

type PerioSiteVisual = PerioSiteDto & {
  site?: string | null;
  label?: string | null;
  code?: string | null;
  position?: string | null;
  pocketDepth?: number | null;
  recession?: number | null;
  bleedingOnProbing?: boolean | null;
  bleeding?: boolean | null;
  bop?: boolean | null;
  plaque?: boolean | null;
  plaquePresent?: boolean | null;
};

type PerioToothVisual = PerioToothDto & {
  toothNumber?: number | string | null;
  number?: number | string | null;
  label?: number | string | null;
  arch?: string | null;
  jaw?: string | null;
  quadrant?: string | number | null;
  isUpper?: boolean | null;
  maxillary?: boolean | null;
  mandibular?: boolean | null;
  sites?: PerioSiteDto[] | null;
  perioSites?: PerioSiteDto[] | null;
  siteMeasurements?: PerioSiteDto[] | null;
  measurements?: PerioSiteDto[] | null;
  faces?: PerioSiteDto[] | null;
};

const SITE_ORDER = ['MB', 'B', 'DB', 'ML', 'L', 'DL'];

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getToothKey(tooth: PerioToothVisual, index: number): string {
  const number = parseNumber(tooth.toothNumber ?? tooth.number ?? tooth.label);
  if (number !== null) {
    return String(number);
  }

  const fallback = (tooth as { id?: string | number | null }).id;
  if (typeof fallback === 'string' || typeof fallback === 'number') {
    return String(fallback);
  }

  return `tooth-${index}`;
}

function getRenderableToothKey(tooth: PerioToothVisual, index: number, arch: 'upper' | 'lower'): string {
  const key = getToothKey(tooth, index);
  return key.startsWith('tooth-') ? `${arch}-${key}` : key;
}

function getToothNumber(tooth: PerioToothVisual): number | null {
  return parseNumber(tooth.toothNumber ?? tooth.number ?? tooth.label);
}

function getSiteList(tooth: PerioToothVisual): PerioSiteVisual[] {
  const candidates = [
    tooth.sites,
    tooth.perioSites,
    tooth.siteMeasurements,
    tooth.measurements,
    tooth.faces,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(Boolean) as PerioSiteVisual[];
    }
  }

  return [];
}

function getSiteLabel(site: PerioSiteVisual, index: number): string {
  const label = site.label ?? site.site ?? site.code ?? site.position;
  if (typeof label === 'string' && label.trim().length > 0) {
    return label.trim();
  }

  return SITE_ORDER[index] ?? `S${index + 1}`;
}

function getSitePocketDepth(site: PerioSiteVisual): number {
  return Math.max(
    0,
    parseNumber(
      site.pocketDepth ??
        (site as { probingDepth?: number | string | null }).probingDepth ??
        (site as { depth?: number | string | null }).depth,
    ) ?? 0,
  );
}

function getSiteRecession(site: PerioSiteVisual): number {
  return Math.max(
    0,
    parseNumber(
      site.recession ??
        (site as { recessionDepth?: number | string | null }).recessionDepth ??
        (site as { gingivalRecession?: number | string | null }).gingivalRecession,
    ) ?? 0,
  );
}

function hasBleeding(site: PerioSiteVisual): boolean {
  return Boolean(site.bleedingOnProbing ?? site.bleeding ?? site.bop);
}

function hasPlaque(site: PerioSiteVisual): boolean {
  return Boolean(site.plaque ?? site.plaquePresent);
}

function getArchName(tooth: PerioToothVisual, index: number, total: number): 'upper' | 'lower' {
  const archValue = String(
    tooth.arch ??
      tooth.jaw ??
      tooth.quadrant ??
      (tooth.maxillary === true ? 'upper' : tooth.mandibular === true ? 'lower' : ''),
  )
    .trim()
    .toLowerCase();

  if (archValue.includes('upper') || archValue.includes('max') || archValue.includes('sup') || archValue.includes('top')) {
    return 'upper';
  }

  if (archValue.includes('lower') || archValue.includes('mand') || archValue.includes('inf') || archValue.includes('bottom')) {
    return 'lower';
  }

  if (typeof tooth.isUpper === 'boolean') {
    return tooth.isUpper ? 'upper' : 'lower';
  }

  const toothNumber = getToothNumber(tooth);
  if (toothNumber !== null) {
    const universalUpper = toothNumber >= 1 && toothNumber <= 16;
    const universalLower = toothNumber >= 17 && toothNumber <= 32;
    const fdiUpper = (toothNumber >= 11 && toothNumber <= 18) || (toothNumber >= 21 && toothNumber <= 28);
    const fdiLower = (toothNumber >= 31 && toothNumber <= 38) || (toothNumber >= 41 && toothNumber <= 48);

    if (fdiUpper || universalUpper) {
      return 'upper';
    }

    if (fdiLower || universalLower) {
      return 'lower';
    }
  }

  return index < total / 2 ? 'upper' : 'lower';
}

function resolveTeeth(props: PeriodontalChartProps): PerioToothDto[] {
  const candidateKeys = ['teeth', 'periodontalTeeth', 'toothData', 'data', 'chartData', 'rows', 'items', 'value'];

  for (const key of candidateKeys) {
    const candidate = props[key];
    if (Array.isArray(candidate)) {
      return candidate.filter(Boolean) as PerioToothDto[];
    }
  }

  return [];
}

function getSiteCells(tooth: PerioToothVisual): Array<{ label: string; site: PerioSiteVisual | null; key: string }> {
  const sites = getSiteList(tooth);
  return SITE_ORDER.map((label, index) => {
    const matchingSite =
      sites.find((site) => {
        const siteLabel = getSiteLabel(site, index).toUpperCase();
        return siteLabel === label;
      }) ?? sites[index] ?? null;

    return {
      label,
      site: matchingSite,
      key: `${label}-${index}`,
    };
  });
}

function toothMatchesSelection(
  tooth: PerioToothVisual,
  selectedToothId: string | number | null | undefined,
  index: number,
): boolean {
  if (selectedToothId === null || selectedToothId === undefined) {
    return false;
  }

  const toothKey = getToothKey(tooth, index);
  return String(selectedToothId) === toothKey;
}

export function PeriodontalChart(props: PeriodontalChartProps): JSX.Element {
  const { t } = useTranslation();
  const teeth = resolveTeeth(props);
  const className = typeof props.className === 'string' ? props.className : '';
  const selectedToothId = props.selectedToothId as string | number | null | undefined;
  const selectedPainPointId = props.selectedPainPointId as PerioPainPointId | null | undefined;
  const onToothClick = props.onToothClick as ((tooth: PerioToothDto) => void) | undefined;
  const onPainPointClick = props.onPainPointClick as ((painPointId: PerioPainPointId) => void) | undefined;
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  useEffect(() => {
    if (selectedToothId === undefined || selectedToothId === null) return;
    rowRefs.current.get(String(selectedToothId))?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedToothId]);

  const sortedTeeth = useMemo(() => {
    const visualTeeth = teeth.filter(Boolean) as PerioToothVisual[];

    return visualTeeth
      .map((tooth, index) => ({
        tooth,
        index,
        arch: getArchName(tooth, index, visualTeeth.length),
      }))
      .sort((a, b) => {
        if (a.arch !== b.arch) {
          return a.arch === 'upper' ? -1 : 1;
        }

        const aNumber = getToothNumber(a.tooth);
        const bNumber = getToothNumber(b.tooth);

        if (aNumber === null && bNumber === null) {
          return a.index - b.index;
        }

        if (aNumber === null) {
          return 1;
        }

        if (bNumber === null) {
          return -1;
        }

        return aNumber - bNumber;
      });
  }, [teeth]);

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <PerioGraphicVisualizer
        teeth={teeth}
        selectedToothId={selectedToothId}
        selectedPainPointId={selectedPainPointId}
        onToothClick={onToothClick}
        onPainPointClick={onPainPointClick}
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{t(`${CH}.gridTitle`)}</h3>
              <p className="mt-1 text-xs text-slate-500">{t(`${CH}.gridSubtitle`)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                {t(`${CH}.legendBleeding`)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
                <span className="h-2 w-2 rounded-sm bg-amber-500" />
                {t(`${CH}.legendPlaque`)}
              </span>
            </div>
          </div>
        </div>

        {sortedTeeth.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t(`${CH}.colTooth`)}
                  </th>
                  {SITE_ORDER.map((siteLabel) => (
                    <th
                      key={siteLabel}
                      className="border-b border-slate-200 px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {siteLabel}
                    </th>
                  ))}
                  <th className="border-b border-l border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t(`${CH}.colSummary`)}
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedTeeth.map(({ tooth, index, arch }) => {
                  const toothKey = getRenderableToothKey(tooth as PerioToothVisual, index, arch);
                  const selected = toothMatchesSelection(tooth as PerioToothVisual, selectedToothId, index) || String(selectedToothId ?? '') === toothKey;
                  const sites = getSiteList(tooth as PerioToothVisual);
                  const cells = getSiteCells(tooth as PerioToothVisual);
                  const maxPocket = sites.length ? Math.max(...sites.map(getSitePocketDepth)) : 0;
                  const maxRecession = sites.length ? Math.max(...sites.map(getSiteRecession)) : 0;
                  const bleedingCount = sites.filter(hasBleeding).length;
                  const plaqueCount = sites.filter(hasPlaque).length;
                  const toothNumber = getToothNumber(tooth as PerioToothVisual) ?? toothKey;

                  return (
                    <tr
                      key={toothKey}
                      ref={(el) => {
                        const rowKey = String(toothNumber);
                        if (el) rowRefs.current.set(rowKey, el);
                        else rowRefs.current.delete(rowKey);
                      }}
                      data-testid={`perio-chart-row-${toothNumber}`}
                      className={`cursor-pointer ${selected ? 'bg-sky-50/60 ring-1 ring-inset ring-sky-300' : 'odd:bg-white even:bg-slate-50/60'}`}
                      onClick={(): void => onToothClick?.(tooth)}
                    >
                      <td className="sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold ${ selected ? 'border-sky-300 bg-sky-100 text-sky-700' : 'border-slate-200 bg-white text-slate-700' }`}
                          >
                            {toothNumber}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900">
                              {t(`${CH}.toothLabel`, { n: toothNumber })}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 uppercase tracking-wide">{arch}</span>
                              {selected ? <span className="text-sky-600">{t(`${CH}.selectedBadge`)}</span> : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {cells.map(({ label, site, key }) => (
                        <td key={`${toothKey}-${key}`} className="border-b border-slate-200 px-2 py-3 text-center align-top">
                          {site ? (
                            <div className="mx-auto flex max-w-[84px] flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 shadow-sm">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                {label}
                              </div>
                              <div className="text-sm font-semibold text-slate-900">{getSitePocketDepth(site)}</div>
                              <div className="text-[10px] text-slate-500">{t(`${CH}.recValue`, { n: getSiteRecession(site) })}</div>
                              <div className="flex items-center gap-1 text-[10px]">
                                {hasBleeding(site) ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-red-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    B
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-500">—</span>
                                )}

                                {hasPlaque(site) ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-amber-600">
                                    <span className="h-1.5 w-1.5 rounded-sm bg-amber-500" />
                                    P
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">—</div>
                          )}
                        </td>
                      ))}

                      <td className="border-b border-l border-slate-200 px-4 py-3 align-top text-sm text-slate-600">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                            {t(`${CH}.pdValue`, { n: maxPocket })}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                            {t(`${CH}.recSummary`, { n: maxRecession })}
                          </span>
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                            {t(`${CH}.bopSummary`, { n: bleedingCount })}
                          </span>
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                            {t(`${CH}.plaqueSummary`, { n: plaqueCount })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-8 text-sm text-slate-500 sm:px-5">
            {t(`${CH}.emptyChart`)}
          </div>
        )}
      </section>
    </div>
  );
}