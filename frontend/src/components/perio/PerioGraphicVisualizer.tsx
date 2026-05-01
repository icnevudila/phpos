import { useEffect, useMemo, useState } from 'react';
import type { PerioSiteDto, PerioToothDto } from '../../services/perio';

export type PerioPainPointId =
  | 'left-temple'
  | 'right-temple'
  | 'left-tmj'
  | 'right-tmj'
  | 'left-masseter'
  | 'right-masseter';

export interface PerioGraphicVisualizerProps {
  teeth?: PerioToothDto[];
  className?: string;
  selectedToothId?: string | number | null;
  selectedPainPointId?: PerioPainPointId | null;
  onToothClick?: (tooth: PerioToothDto) => void;
  onPainPointClick?: (painPointId: PerioPainPointId) => void;
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

type ArchName = 'upper' | 'lower';

const ARCH_LABELS: Record<ArchName, string> = {
  upper: 'Upper arch',
  lower: 'Lower arch',
};

const PAIN_POINTS: Array<{
  id: PerioPainPointId;
  label: string;
  x: number;
  y: number;
}> = [
  { id: 'left-temple', label: 'Left temple', x: 66, y: 68 },
  { id: 'right-temple', label: 'Right temple', x: 174, y: 68 },
  { id: 'left-tmj', label: 'Left TMJ', x: 62, y: 144 },
  { id: 'right-tmj', label: 'Right TMJ', x: 178, y: 144 },
  { id: 'left-masseter', label: 'Left masseter', x: 78, y: 160 },
  { id: 'right-masseter', label: 'Right masseter', x: 162, y: 160 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseNumber(value: unknown): number | null {
  if (isFiniteNumber(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getToothKey(tooth: PerioToothVisual, index: number): string {
  const toothNumber = parseNumber(tooth.toothNumber ?? tooth.number ?? tooth.label);
  if (toothNumber !== null) {
    return String(toothNumber);
  }

  const fallback = (tooth as { id?: string | number | null }).id;
  if (typeof fallback === 'string' || typeof fallback === 'number') {
    return String(fallback);
  }

  return `tooth-${index}`;
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

  return ['MB', 'B', 'DB', 'ML', 'L', 'DL'][index] ?? `S${index + 1}`;
}

function getSitePocketDepth(site: PerioSiteVisual): number {
  return Math.max(
    0,
    parseNumber(site.pocketDepth ?? (site as { probingDepth?: number | string | null }).probingDepth ?? (site as { depth?: number | string | null }).depth) ?? 0,
  );
}

function getSiteRecession(site: PerioSiteVisual): number {
  return Math.max(
    0,
    parseNumber(site.recession ?? (site as { recessionDepth?: number | string | null }).recessionDepth ?? (site as { gingivalRecession?: number | string | null }).gingivalRecession) ?? 0,
  );
}

function hasBleeding(site: PerioSiteVisual): boolean {
  return Boolean(site.bleedingOnProbing ?? site.bleeding ?? site.bop);
}

function hasPlaque(site: PerioSiteVisual): boolean {
  return Boolean(site.plaque ?? site.plaquePresent);
}

function getSiteSeverity(site: PerioSiteVisual): number {
  return clamp((getSitePocketDepth(site) + getSiteRecession(site)) / 10, 0, 1);
}

function getArchName(tooth: PerioToothVisual, index: number, total: number): ArchName {
  const archValue = String(
    tooth.arch ??
      tooth.jaw ??
      tooth.quadrant ??
      (tooth.maxillary === true ? 'upper' : tooth.mandibular === true ? 'lower' : '') ??
      '',
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

function getArchCurveYOffset(arch: ArchName, t: number): number {
  const normalized = (t - 0.5) * 2;
  const curve = normalized * normalized;
  return arch === 'upper' ? curve * 22 : -curve * 22;
}

function sortUpperToothIndex(a: PerioToothVisual, b: PerioToothVisual): number {
  const aNumber = getToothNumber(a);
  const bNumber = getToothNumber(b);

  if (aNumber === null && bNumber === null) {
    return 0;
  }

  if (aNumber === null) {
    return 1;
  }

  if (bNumber === null) {
    return -1;
  }

  return aNumber - bNumber;
}

function sortLowerToothIndex(a: PerioToothVisual, b: PerioToothVisual): number {
  const aNumber = getToothNumber(a);
  const bNumber = getToothNumber(b);

  if (aNumber === null && bNumber === null) {
    return 0;
  }

  if (aNumber === null) {
    return 1;
  }

  if (bNumber === null) {
    return -1;
  }

  return bNumber - aNumber;
}

function ToothGlyph({
  tooth,
  toothKey,
  arch,
  x,
  y,
  width,
  height,
  selected,
  onClick,
}: {
  tooth: PerioToothVisual;
  toothKey: string;
  arch: ArchName;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  onClick?: () => void;
}): JSX.Element {

  const sites = getSiteList(tooth);
  const totalScore = sites.length
    ? sites.reduce((sum, site) => sum + getSiteSeverity(site), 0) / sites.length
    : 0;
  const pocketDepth = sites.length ? Math.max(...sites.map(getSitePocketDepth)) : 0;
  const recession = sites.length ? Math.max(...sites.map(getSiteRecession)) : 0;
  const fillHeight = 16 + clamp((pocketDepth + recession) * 2.1, 0, 26);
  const apicalDirection = arch === 'upper' ? 1 : -1;
  const gumOffset = 4;
  const clipId = `tooth-clip-${toothKey}`;
  const toothId = toothKey;

  const siteMarkerPositions = sites.slice(0, 6).map((site, index) => {
    const markerX = -width * 0.35 + index * (width * 0.14);
    const markerY = arch === 'upper' ? height * 0.2 : -height * 0.2;
    return {
      id: `${toothId}-site-${index}`,
      x: markerX,
      y: markerY,
      site,
      label: getSiteLabel(site, index),
    };
  });

  return (
    <g transform={`translate(${x}, ${y})`} onClick={onClick} className={onClick ? 'cursor-pointer' : undefined}>
      <defs>
        <clipPath id={clipId}>
          <path d="M -16 8 C -17 -3 -12 -28 0 -32 C 12 -28 17 -3 16 8 L 12 30 C 11 39 -11 39 -12 30 Z" />
        </clipPath>
      </defs>

       {/* Tooth outline */}
       <path
         d="M -16 8 C -17 -3 -12 -28 0 -32 C 12 -28 17 -3 16 8 L 12 30 C 11 39 -11 39 -12 30 Z"
         fill="white"
         stroke={selected ? 'rgb(14 165 233)' : 'rgb(148 163 184)'}
         strokeWidth={selected ? 2.2 : 1.3}
         style={selected ? { filter: 'drop-shadow(0px 1px 4px rgba(14, 165, 233, 0.25))' } : undefined}
       />

       {/* Gingiva line - simulates gum recession and pocket depth */}
       {/* We'll draw a curved line representing the gum line, shifted apically by (pocketDepth + recession) */}
       <path
         d="M -10 0 Q 0 -6 10 0"
         stroke="rgb(239 68 68)"
         strokeWidth="2"
         fill="none"
         transform={`translate(0, ${arch === 'upper' ? gumOffset : -gumOffset}) translate(0, ${-fillHeight})`}
       />

       {/* Optional: red fill to represent infection/inflammation underneath the gum line */}
       <path
         d="M -10 0 Q 0 -6 10 0 L 10 20 Q 0 14 -10 20 Z"
         fill="rgb(239 68 68)"
         fillOpacity={0.18 + totalScore * 0.38}
         transform={`translate(0, ${arch === 'upper' ? gumOffset : -gumOffset}) translate(0, ${-fillHeight})`}
       />

      <path
        d="M -9 11 C -8 4 -6 -8 0 -11 C 6 -8 8 4 9 11"
        fill="none"
        stroke={selected ? 'rgb(14 165 233)' : 'rgb(203 213 225)'}
        strokeWidth="1"
        opacity="0.8"
      />

      {siteMarkerPositions.map(({ id, x: markerX, y: markerY, site, label }) => (
        <g key={id}>
          {hasBleeding(site) ? (
            <circle cx={markerX} cy={markerY} r="3.5" fill="rgb(239 68 68)" stroke="white" strokeWidth="1" />
          ) : (
            <circle cx={markerX} cy={markerY} r="2.6" fill="rgb(248 250 252)" stroke="rgb(203 213 225)" strokeWidth="1" />
          )}

          {hasPlaque(site) ? (
            <rect
              x={markerX - 3.25}
              y={markerY + (arch === 'upper' ? 5 : -8)}
              width="6.5"
              height="6.5"
              rx="1.5"
              fill="rgb(245 158 11)"
              stroke="white"
              strokeWidth="0.8"
            />
          ) : null}

          <title>
            {label}
            {hasBleeding(site) ? ' · bleeding' : ''}
            {hasPlaque(site) ? ' · plaque' : ''}
            {getSitePocketDepth(site) > 0 ? ` · PD ${getSitePocketDepth(site)}` : ''}
            {getSiteRecession(site) > 0 ? ` · REC ${getSiteRecession(site)}` : ''}
          </title>
        </g>
      ))}

      <text
        y={arch === 'upper' ? 56 : -44}
        textAnchor="middle"
        className="fill-slate-500"
        style={{ fontSize: '11px', fontWeight: 600 }}
      >
        {getToothNumber(tooth) ?? toothId}
      </text>
    </g>
  );
}

function PainPointButton({
  id,
  label,
  x,
  y,
  active,
  onClick,
}: {
  id: PerioPainPointId;
  label: string;
  x: number;
  y: number;
  active: boolean;
  onClick: (id: PerioPainPointId) => void;
}): JSX.Element {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(): void => onClick(id)}
      onKeyDown={(event): void => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(id);
        }
      }}
      className="cursor-pointer focus:outline-none"
    >
      <circle
        r="11"
        fill={active ? 'rgb(239 68 68)' : 'rgb(226 232 240)'}
        stroke={active ? 'rgb(220 38 38)' : 'rgb(148 163 184)'}
        strokeWidth={active ? 2 : 1.2}
      />
      <circle r="4.5" fill={active ? 'white' : 'rgb(100 116 139)'} opacity={active ? 0.95 : 0.7} />
      <title>{label}</title>
    </g>
  );
}

export default function PerioGraphicVisualizer({
  teeth = [],
  className = '',
  selectedPainPointId,
  selectedToothId,
  onToothClick,
  onPainPointClick,
}: PerioGraphicVisualizerProps): JSX.Element {
  const [internalPainPointId, setInternalPainPointId] = useState<PerioPainPointId | null>(selectedPainPointId ?? null);

  useEffect(() => {
    if (selectedPainPointId !== undefined) {
      setInternalPainPointId(selectedPainPointId);
    }
  }, [selectedPainPointId]);

  const normalizedTeeth = useMemo(() => teeth.filter(Boolean) as PerioToothVisual[], [teeth]);

  const grouped = useMemo(() => {
    const upper: Array<{ tooth: PerioToothVisual; index: number }> = [];
    const lower: Array<{ tooth: PerioToothVisual; index: number }> = [];

    normalizedTeeth.forEach((tooth, index) => {
      const arch = getArchName(tooth, index, normalizedTeeth.length);
      const entry = { tooth, index };
      if (arch === 'upper') {
        upper.push(entry);
      } else {
        lower.push(entry);
      }
    });

    return {
      upper: upper.sort((a, b) => sortUpperToothIndex(a.tooth, b.tooth)),
      lower: lower.sort((a, b) => sortLowerToothIndex(a.tooth, b.tooth)),
    };
  }, [normalizedTeeth]);

  const totalColumns = Math.max(grouped.upper.length, grouped.lower.length, 1);
  const width = 1200;
  const height = 420;
  const leftPadding = 64;
  const rightPadding = 64;
  const usableWidth = width - leftPadding - rightPadding;
  const spacing = totalColumns > 1 ? usableWidth / (totalColumns - 1) : usableWidth / 2;

  const selectedPainPoint = internalPainPointId ? PAIN_POINTS.find((point) => point.id === internalPainPointId) ?? null : null;

  return (
    <div className={`grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] ${className}`.trim()}>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Periodontal overview</h3>
            <p className="mt-1 text-xs text-slate-500">
              Red fill = recession / pocket burden, red dots = bleeding on probing, amber markers = plaque.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              BOP
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
              <span className="h-2 w-2 rounded-sm bg-amber-500" />
              Plaque
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <defs>
            <linearGradient id="perio-gum-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(252 165 165)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(239 68 68)" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <path
            d="M 58 108 C 290 68, 910 68, 1142 108"
            fill="none"
            stroke="rgb(226 232 240)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 58 312 C 290 352, 910 352, 1142 312"
            fill="none"
            stroke="rgb(226 232 240)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          <text x="24" y="112" className="fill-slate-500" style={{ fontSize: '11px', fontWeight: 600 }}>
            {ARCH_LABELS.upper}
          </text>
          <text x="24" y="316" className="fill-slate-500" style={{ fontSize: '11px', fontWeight: 600 }}>
            {ARCH_LABELS.lower}
          </text>

          {grouped.upper.map(({ tooth }, displayIndex) => {
            const total = grouped.upper.length;
            const t = total > 1 ? displayIndex / (total - 1) : 0.5;
            const x = leftPadding + spacing * displayIndex;
            const y = 144 + getArchCurveYOffset('upper', t);
            const toothId = getToothKey(tooth, displayIndex);
            const isSelected = selectedToothId !== undefined && selectedToothId !== null ? String(selectedToothId) === toothId : false;

            return (
              <ToothGlyph
                key={`upper-${toothId}`}
                tooth={tooth}
                toothKey={toothId}
                arch="upper"
                x={x}
                y={y}
                width={30}
                height={72}
                selected={isSelected}
                onClick={onToothClick ? (): void => onToothClick(tooth) : undefined}
              />

            );
          })}

          {grouped.lower.map(({ tooth }, displayIndex) => {
            const total = grouped.lower.length;
            const t = total > 1 ? displayIndex / (total - 1) : 0.5;
            const x = leftPadding + spacing * displayIndex;
            const y = 276 + getArchCurveYOffset('lower', t);
            const toothId = getToothKey(tooth, displayIndex);
            const isSelected = selectedToothId !== undefined && selectedToothId !== null ? String(selectedToothId) === toothId : false;

            return (
              <ToothGlyph
                key={`lower-${toothId}`}
                tooth={tooth}
                toothKey={toothId}
                arch="lower"
                x={x}
                y={y}
                width={30}
                height={72}
                selected={isSelected}
                onClick={onToothClick ? (): void => onToothClick(tooth) : undefined}
              />
            );
          })}
        </svg>

        {normalizedTeeth.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No periodontal measurements available yet.
          </div>
        ) : null}
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-900">TMJ / face anatomy</h3>
          <p className="mt-1 text-xs text-slate-500">Click a pain point to mark tenderness or pain during the exam.</p>
        </div>

        <svg viewBox="0 0 240 220" className="h-60 w-full">
          <path
            d="M 120 24
               C 79 24, 48 54, 48 93
               C 48 126, 63 150, 86 165
               C 92 169, 94 176, 95 182
               C 98 199, 111 205, 120 205
               C 129 205, 142 199, 145 182
               C 146 176, 148 169, 154 165
               C 177 150, 192 126, 192 93
               C 192 54, 161 24, 120 24 Z"
            fill="rgb(248 250 252)"
            stroke="rgb(203 213 225)"
            strokeWidth="1.5"
          />
          <path
            d="M 74 166 C 88 192, 152 192, 166 166"
            fill="none"
            stroke="rgb(203 213 225)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 82 118 C 84 139, 94 154, 109 160"
            fill="none"
            stroke="rgb(226 232 240)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 158 118 C 156 139, 146 154, 131 160"
            fill="none"
            stroke="rgb(226 232 240)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 96 82 C 101 76, 106 73, 111 73"
            fill="none"
            stroke="rgb(203 213 225)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 144 82 C 139 76, 134 73, 129 73"
            fill="none"
            stroke="rgb(203 213 225)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {PAIN_POINTS.map((point) => (
            <PainPointButton
              key={point.id}
              id={point.id}
              label={point.label}
              x={point.x}
              y={point.y}
              active={internalPainPointId === point.id}
              onClick={(painPointId): void => {
                setInternalPainPointId(painPointId);
                onPainPointClick?.(painPointId);
              }}
            />
          ))}

          <circle cx="120" cy="102" r="18" fill="white" stroke="rgb(226 232 240)" strokeWidth="1" />
          <circle cx="120" cy="102" r="4" fill="rgb(148 163 184)" />
        </svg>

        <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          {selectedPainPoint ? (
            <>
              Selected point: <span className="font-medium text-slate-900">{selectedPainPoint.label}</span>
            </>
          ) : (
            'No pain point selected.'
          )}
        </div>
      </aside>
    </div>
  );
}