import { useMemo, useState } from 'react';
import type { PerioSiteDto, PerioToothDto } from '../../services/perio';

export interface AdvancedPerioVisualizerProps {
  teeth?: PerioToothDto[];
  selectedToothId?: string | number | null;
  onToothSelect?: (tooth: PerioToothDto, toothIndex: number) => void;
  className?: string;
}

interface ToothRenderData {
  tooth: PerioToothDto;
  index: number;
  arch: 'upper' | 'lower';
  toothNumber: number;
  x: number;
  y: number;
}

// Diş sitelerinin ortalama değerleri
function calculateSiteAverage(sites: PerioSiteDto[] | undefined, key: keyof PerioSiteDto): number {
  if (!sites || sites.length === 0) return 0;
  const values = sites
    .map((s) => {
      const val = s[key];
      return typeof val === 'number' ? val : 0;
    })
    .filter((v) => v > 0);
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

function hasAnyBleeding(sites: PerioSiteDto[] | undefined): boolean {
  return (sites || []).some((s) => s.bleedingOnProbing || s.bop || s.bleeding);
}

function hasPlaque(sites: PerioSiteDto[] | undefined): boolean {
  return (sites || []).some((s) => s.plaque);
}

function hasSuppuration(sites: PerioSiteDto[] | undefined): boolean {
  return (sites || []).some((s) => (s as any).suppuration || (s as any).ooze || (s as any).pus);
}

function getGumColor(pocketDepth: number, recession: number, bleeding: boolean): string {
  const severity = (pocketDepth + recession) / 10;
  
  if (bleeding && severity > 0.4) return '#dc2626'; // red-600
  if (bleeding) return '#ef4444'; // red-500
  if (severity > 0.6) return '#991b1b'; // red-900
  if (severity > 0.4) return '#b91c1c'; // red-800
  if (severity > 0.2) return '#f87171'; // red-400
  return '#86efac'; // green-300 - healthy
}

function GumContour({
  x,
  y,
  width,
  height,
  pocketDepth,
  recession,
  bleeding,
  arch,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  pocketDepth: number;
  recession: number;
  bleeding: boolean;
  arch: 'upper' | 'lower';
}) {
  // Gum line curve - diş etini simüle et
  const gumDropAmount = Math.min(pocketDepth * 1.5, height * 0.5); // Pocket depth ile gum retractionı göster
  const recessionDrop = recession * 0.8; // Recession margin
  
  const startY = arch === 'upper' ? y + height : y;
  const endY = arch === 'upper' ? startY + gumDropAmount : startY - gumDropAmount;
  
  // Bezier curve path
  const controlX = x + width / 2;
  const controlY = arch === 'upper' ? startY + gumDropAmount * 0.7 : startY - gumDropAmount * 0.7;
  
  const pathData = arch === 'upper'
    ? `M ${x} ${startY} Q ${controlX} ${controlY} ${x + width} ${startY} L ${x + width} ${endY} Q ${controlX} ${controlY + gumDropAmount * 0.3} ${x} ${endY} Z`
    : `M ${x} ${startY} Q ${controlX} ${controlY} ${x + width} ${startY} L ${x + width} ${endY} Q ${controlX} ${controlY - gumDropAmount * 0.3} ${x} ${endY} Z`;

  const color = getGumColor(pocketDepth, recession, bleeding);
  
  return (
    <>
      {/* Gum fill */}
      <path d={pathData} fill={color} opacity="0.7" />
      
      {/* Gum outline */}
      <path
        d={arch === 'upper'
          ? `M ${x} ${startY} Q ${controlX} ${controlY} ${x + width} ${startY}`
          : `M ${x} ${startY} Q ${controlX} ${controlY} ${x + width} ${startY}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      
      {/* Recession indicator - thin dark line */}
      {recession > 0 && (
        <line
          x1={x + recessionDrop}
          y1={arch === 'upper' ? startY : startY}
          x2={x + width - recessionDrop}
          y2={arch === 'upper' ? startY : startY}
          stroke="#7f1d1d"
          strokeWidth="3"
          opacity="0.8"
        />
      )}
    </>
  );
}

function BleedingDroplets({
  x,
  y,
  width,
  height,
  bleedingSites,
  arch,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  bleedingSites: number;
  arch: 'upper' | 'lower';
}) {
  if (bleedingSites === 0) return null;
  
  const dropCount = Math.min(bleedingSites, 6); // Max 6 drops
  const dropletRadius = 2.5;
  const baseY = arch === 'upper' ? y + height + 6 : y - 6;
  
  return (
    <g>
      {Array.from({ length: dropCount }).map((_, i) => {
        const angle = (i / dropCount) * Math.PI;
        const dropX = x + (width / (dropCount + 1)) * (i + 1);
        const wobble = Math.sin(i) * 1.5;
        
        return (
          <circle
            key={`bleed-${i}`}
            cx={dropX + wobble}
            cy={baseY}
            r={dropletRadius}
            fill="#dc2626"
            opacity="0.85"
          />
        );
      })}
    </g>
  );
}

function SupurationMarkers({
  x,
  y,
  width,
  height,
  suppurationCount,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  suppurationCount: number;
}) {
  if (suppurationCount === 0) return null;
  
  return (
    <g>
      {Array.from({ length: Math.min(suppurationCount, 4) }).map((_, i) => {
        const posX = x + (width / 5) * (i + 1);
        const posY = y + height / 2;
        
        return (
          <g key={`supp-${i}`}>
            {/* White center */}
            <circle cx={posX} cy={posY} r="2.5" fill="#fef3c7" opacity="0.9" />
            {/* Yellow halo */}
            <circle cx={posX} cy={posY} r="4" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
          </g>
        );
      })}
    </g>
  );
}

function PlaqueBand({
  x,
  y,
  width,
  hasPlaque,
  arch,
}: {
  x: number;
  y: number;
  width: number;
  hasPlaque: boolean;
  arch: 'upper' | 'lower';
}) {
  if (!hasPlaque) return null;
  
  const bandY = arch === 'upper' ? y - 4 : y + 20;
  
  return (
    <rect
      x={x + 1}
      y={bandY}
      width={width - 2}
      height="3"
      fill="#b45309"
      opacity="0.5"
      rx="1"
    />
  );
}

function ToothRenderer({
  tooth,
  index,
  x,
  y,
  width,
  height,
  arch,
  selected,
  onSelect,
}: {
  tooth: PerioToothDto;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  arch: 'upper' | 'lower';
  selected: boolean;
  onSelect: () => void;
}) {
  const sites = (tooth as any).sites || (tooth as any).perioSites || [];
  const pocketDepth = calculateSiteAverage(sites, 'pocketDepth' as any);
  const recession = calculateSiteAverage(sites, 'recession' as any);
  const bleeding = hasAnyBleeding(sites);
  const plaque = hasPlaque(sites);
  const suppuration = hasSuppuration(sites);
  
  const bleedingCount = sites.filter((s: PerioSiteDto) => s.bleedingOnProbing || (s as any).bop).length;
  const suppressionCount = sites.filter((s: PerioSiteDto) => (s as any).suppuration || (s as any).ooze).length;
  
  const toothNumber = (tooth as any).toothNumber || (tooth as any).number || index + 1;

  return (
    <g key={`tooth-${index}`} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Tooth body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={selected ? '#bfdbfe' : '#f0f9ff'}
        stroke={selected ? '#0284c7' : '#e0f2fe'}
        strokeWidth={selected ? 2 : 1}
        rx="3"
      />

      {/* Gum contour */}
      <GumContour
        x={x + 2}
        y={y + (arch === 'upper' ? 8 : 28)}
        width={width - 4}
        height={10}
        pocketDepth={pocketDepth}
        recession={recession}
        bleeding={bleeding}
        arch={arch}
      />

      {/* Bleeding droplets */}
      <BleedingDroplets
        x={x}
        y={y + (arch === 'upper' ? 4 : 32)}
        width={width}
        height={4}
        bleedingSites={bleedingCount}
        arch={arch}
      />

      {/* Suppuration markers */}
      <SupurationMarkers
        x={x + 2}
        y={y + 10}
        width={width - 4}
        height={8}
        suppurationCount={suppressionCount}
      />

      {/* Plaque band */}
      <PlaqueBand x={x} y={y + height - 2} width={width} hasPlaque={plaque} arch={arch} />

      {/* Tooth number label */}
      <text
        x={x + width / 2}
        y={y + height / 2 + 1}
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={selected ? '#0c4a6e' : '#475569'}
      >
        {toothNumber}
      </text>

      {/* Severity indicator dot */}
      {pocketDepth > 4 && (
        <circle cx={x + width - 2} cy={y + 2} r="2" fill="#dc2626" />
      )}
    </g>
  );
}

export function AdvancedPerioVisualizer({
  teeth = [],
  selectedToothId,
  onToothSelect,
  className = '',
}: AdvancedPerioVisualizerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sortedTeeth = useMemo(() => {
    const upperTeeth: ToothRenderData[] = [];
    const lowerTeeth: ToothRenderData[] = [];

    (teeth || []).forEach((tooth, idx) => {
      const toothNum = (tooth as any).toothNumber || (tooth as any).number || idx + 1;
      const isUpper = toothNum <= 16 || (toothNum >= 21 && toothNum <= 28) || (toothNum >= 11 && toothNum <= 18);
      
      const data: ToothRenderData = {
        tooth,
        index: idx,
        arch: isUpper ? 'upper' : 'lower',
        toothNumber: toothNum,
        x: 0, // Will be calculated
        y: 0, // Will be calculated
      };
      
      if (isUpper) {
        upperTeeth.push(data);
      } else {
        lowerTeeth.push(data);
      }
    });

    // Sort by tooth number
    upperTeeth.sort((a, b) => a.toothNumber - b.toothNumber);
    lowerTeeth.sort((a, b) => b.toothNumber - a.toothNumber);

    return { upperTeeth, lowerTeeth };
  }, [teeth]);

  const svgWidth = 560;
  const svgHeight = 220;
  const toothWidth = 35;
  const toothHeight = 50;
  const upperY = 20;
  const lowerY = 110;

  // Layout teeth horizontally
  const allTeeth = [...sortedTeeth.upperTeeth, ...sortedTeeth.lowerTeeth];
  const teethPerRow = Math.ceil(sortedTeeth.upperTeeth.length);
  const spacing = (svgWidth - teethPerRow * toothWidth) / (teethPerRow + 1);

  let xPos = spacing;
  sortedTeeth.upperTeeth.forEach((data) => {
    data.x = xPos;
    data.y = upperY;
    xPos += toothWidth + spacing;
  });

  xPos = spacing;
  sortedTeeth.lowerTeeth.forEach((data) => {
    data.x = xPos;
    data.y = lowerY;
    xPos += toothWidth + spacing;
  });

  return (
    <div className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Advanced Periodontal Chart</h3>
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-300" />
            Healthy
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            Bleeding
          </span>
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            Suppuration
          </span>
        </div>
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full border border-slate-200 rounded-lg bg-slate-50"
      >
        {/* Midline */}
        <line x1={svgWidth / 2} y1={70} x2={svgWidth / 2} y2={140} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />

        {/* Upper teeth */}
        {sortedTeeth.upperTeeth.map((data) => (
          <ToothRenderer
            key={`upper-${data.index}`}
            tooth={data.tooth}
            index={data.index}
            x={data.x}
            y={data.y}
            width={toothWidth}
            height={toothHeight}
            arch="upper"
            selected={selectedToothId === String(data.toothNumber)}
            onSelect={() => onToothSelect?.(data.tooth, data.index)}
          />
        ))}

        {/* Lower teeth */}
        {sortedTeeth.lowerTeeth.map((data) => (
          <ToothRenderer
            key={`lower-${data.index}`}
            tooth={data.tooth}
            index={data.index}
            x={data.x}
            y={data.y}
            width={toothWidth}
            height={toothHeight}
            arch="lower"
            selected={selectedToothId === String(data.toothNumber)}
            onSelect={() => onToothSelect?.(data.tooth, data.index)}
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <span className="font-medium">Gum depth:</span> Redder = Deeper pockets
        </div>
        <div>
          <span className="font-medium">Drops:</span> Red = Bleeding sites
        </div>
        <div>
          <span className="font-medium">Yellow halo:</span> Suppuration/pus
        </div>
        <div>
          <span className="font-medium">Dark line:</span> Gingival recession
        </div>
      </div>
    </div>
  );
}
