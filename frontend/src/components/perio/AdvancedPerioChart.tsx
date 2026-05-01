import { useState } from 'react';
import type { PerioSiteCode, PerioToothDto } from '../../services/perio';
import { SITE_CODES, SITE_ANGLES, getPDColor, calcCAL, sitePos, sortTeeth } from './perioUtils';

export interface AdvancedPerioChartProps {
  teeth: PerioToothDto[];
  readOnly?: boolean;
  onChange?: (teeth: PerioToothDto[]) => void;
  className?: string;
}

export default function AdvancedPerioChart({ teeth, className = '' }: AdvancedPerioChartProps): JSX.Element {
  const [selTooth, setSelTooth] = useState<number | null>(null);
  const [selSite, setSelSite] = useState<PerioSiteCode | null>(null);
  const { upper: upTeeth, lower: loTeeth } = sortTeeth(teeth);

  const W = 1100, H = 520, CX = W / 2, UY = 140, LY = 380, R = 420;

  const tx = (idx: number, total: number, isU: boolean) => {
    if (total <= 1) return CX;
    const range = 120, start = isU ? -range / 2 : range / 2, step = range / (total - 1);
    const deg = start + idx * step;
    return CX + R * Math.sin((deg * Math.PI) / 180) * 0.5;
  };
  const ty = (idx: number, total: number, isU: boolean) => {
    if (total <= 1) return isU ? UY : LY;
    const range = 120, start = isU ? -range / 2 : range / 2, step = range / (total - 1);
    const deg = start + idx * step;
    return (isU ? UY : LY) - Math.cos((deg * Math.PI) / 180) * 20;
  };

  const renderTooth = (tooth: PerioToothDto, i: number, total: number, isU: boolean) => {
    const x = tx(i, total, isU);
    const y = ty(i, total, isU);
    const isSel = selTooth === tooth.toothNumber;
    const sites = tooth.sites || [];
    const maxPD = sites.length ? Math.max(...sites.map((s) => s.pocketDepth)) : 0;
    const maxRec = sites.length ? Math.max(...sites.map((s) => s.recession)) : 0;
    const gr = maxRec * 1.2;
    const gy = isU ? -26 + gr : 26 - gr;
    const io = Math.min(0.1 + maxPD * 0.06, 0.55);
    const crown = isU
      ? 'M -14,8 C -16,-2 -12,-22 0,-26 C 12,-22 16,-2 14,8 Z'
      : 'M -14,-8 C -16,2 -12,22 0,26 C 12,22 16,2 14,-8 Z';
    const root = isU
      ? 'M -10,8 C -10,20 -8,32 0,36 C 8,32 10,20 10,8 Z'
      : 'M -10,-8 C -10,-20 -8,-32 0,-36 C 8,-32 10,-20 10,-8 Z';
    const gumCurve = isU ? `Q 0,${gy + 4} 18,${gy}` : `Q 0,${gy - 4} 18,${gy}`;
    const inflameClose = isU ? 'L 14,8 L -14,8 Z' : 'L 14,-8 L -14,-8 Z';
    const labelY = isU ? 48 : -48;

    return (
      <g key={`${isU ? 'U' : 'L'}-${tooth.toothNumber}`} transform={`translate(${x},${y})`} className="cursor-pointer" onClick={() => { setSelTooth(tooth.toothNumber); setSelSite(null); }}>
        {isSel && <circle r={32} fill="none" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 2" />}
        <path d={root} fill="#e8e0c5" stroke="#b8af8e" strokeWidth={0.8} />
        <path d={crown} fill="#faf8f3" stroke={isSel ? '#0ea5e9' : '#94a3b8'} strokeWidth={isSel ? 1.5 : 0.8} />
        {maxPD > 0 && <path d={`M -18,${gy} ${gumCurve} ${inflameClose}`} fill="#dc2626" opacity={io} />}
        <path d={`M -18,${gy} ${gumCurve}`} fill="none" stroke="#f87171" strokeWidth={2} />
        <text y={labelY} textAnchor="middle" className="fill-slate-600" style={{ fontSize: '11px', fontWeight: 600 }}>{tooth.toothNumber}</text>

        {SITE_CODES.map((code) => {
          const site = tooth.sites.find((s) => s.siteCode === code);
          if (!site) return null;
          const pos = sitePos(SITE_ANGLES[code], 0, 0, 28);
          const c = getPDColor(site.pocketDepth);
          return (
            <g key={code} transform={`translate(${pos.x},${pos.y})`} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelTooth(tooth.toothNumber); setSelSite(code); }}>
              {isSel && selSite === code && <circle r={14} fill="none" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="3 2" />}
              <circle r={11} fill={c} stroke="white" strokeWidth={1.5} opacity={site.pocketDepth > 0 ? 0.9 : 0.3} />
              <text textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: '9px', fontWeight: 700 }}>{site.pocketDepth > 0 ? site.pocketDepth : '-'}</text>
              {site.bleeding && <g transform="translate(0,-14)"><path d="M 0,-6 C -4,-2 -4,2 0,4 C 4,2 4,-2 0,-6 Z" fill="#dc2626" stroke="white" strokeWidth={0.5} /></g>}
              {site.suppuration && <g transform="translate(0,14)"><circle r={4} fill="#84cc16" stroke="white" strokeWidth={0.5} /></g>}
              {site.plaque && <g transform="translate(14,0)"><rect x={-3} y={-3} width={6} height={6} rx={1.5} fill="#f59e0b" stroke="white" strokeWidth={0.5} /></g>}
              <title>{code} PD:{site.pocketDepth} REC:{site.recession} CAL:{calcCAL(site.pocketDepth, site.recession)}{site.bleeding ? ' BOP+' : ''}{site.suppuration ? ' SUP+' : ''}{site.plaque ? ' PLQ+' : ''}</title>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">Advanced Periodontal Chart</h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" /><span>Healthy</span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /><span>Warning</span>
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /><span>Moderate</span>
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span>Severe</span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <path d={`M 80,${UY} Q ${CX},${UY - 40} ${W - 80},${UY}`} fill="none" stroke="#e2e8f0" strokeWidth={8} strokeLinecap="round" />
          <path d={`M 80,${LY} Q ${CX},${LY + 40} ${W - 80},${LY}`} fill="none" stroke="#e2e8f0" strokeWidth={8} strokeLinecap="round" />
          <text x={24} y={UY + 4} className="fill-slate-400" style={{ fontSize: '11px', fontWeight: 600 }}>Upper</text>
          <text x={24} y={LY + 4} className="fill-slate-400" style={{ fontSize: '11px', fontWeight: 600 }}>Lower</text>
          {upTeeth.map((t, i) => renderTooth(t, i, upTeeth.length, true))}
          {loTeeth.map((t, i) => renderTooth(t, i, loTeeth.length, false))}
        </svg>
      </div>

      {selTooth && selSite && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Tooth {selTooth} — {selSite}</h4>
          <p className="text-xs text-slate-500">Site editor would appear here with PD/REC sliders and BOP/SUP/PLQ toggles.</p>
        </div>
      )}
    </div>
  );
}

