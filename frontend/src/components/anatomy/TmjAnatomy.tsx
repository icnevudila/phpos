import { useState } from 'react';

export type PainPointType = 'clicking' | 'locking' | 'pain' | 'tenderness';
export type BotoxZone = 'masseter' | 'temporalis' | 'frontalis';

export interface PainPoint {
  id: string;
  x: number;
  y: number;
  intensity: number;
  type: PainPointType;
  notes?: string;
}

export interface BruxismMarker {
  id: string;
  x: number;
  y: number;
  severity: 'mild' | 'moderate' | 'severe';
  toothNumber: number;
}

export interface BotoxPoint {
  id: string;
  x: number;
  y: number;
  zone: BotoxZone;
  units: number;
}

export interface TmjAnatomyProps {
  painPoints?: PainPoint[];
  bruxismMarkers?: BruxismMarker[];
  botoxPoints?: BotoxPoint[];
  onAddPainPoint?: (point: Omit<PainPoint, 'id'>) => void;
  onAddBruxism?: (marker: Omit<BruxismMarker, 'id'>) => void;
  onAddBotox?: (point: Omit<BotoxPoint, 'id'>) => void;
  onRemovePoint?: (id: string, type: 'pain' | 'bruxism' | 'botox') => void;
  editable?: boolean;
  className?: string;
}

const PAIN_COLORS: Record<PainPointType, string> = {
  clicking: '#f59e0b',
  locking: '#ef4444',
  pain: '#dc2626',
  tenderness: '#f97316',
};

const PAIN_LABELS: Record<PainPointType, string> = {
  clicking: 'Clicking',
  locking: 'Locking',
  pain: 'Pain',
  tenderness: 'Tenderness',
};

const BRUXISM_COLORS = { mild: '#fcd34d', moderate: '#f97316', severe: '#dc2626' };
const BOTOX_COLORS = { masseter: '#a855f7', temporalis: '#3b82f6', frontalis: '#06b6d4' };

export default function TmjAnatomy({
  painPoints = [],
  bruxismMarkers = [],
  botoxPoints = [],
  onAddPainPoint,
  onAddBruxism,
  onAddBotox,
  onRemovePoint,
  editable = false,
  className = '',
}: TmjAnatomyProps): JSX.Element {
  const [mode, setMode] = useState<'view' | 'pain' | 'bruxism' | 'botox'>('view');
  const [selectedType, setSelectedType] = useState<PainPointType>('pain');
  const [intensity, setIntensity] = useState(5);
  const [selectedZone, setSelectedZone] = useState<BotoxZone>('masseter');
  const [units, setUnits] = useState(25);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!editable || mode === 'view') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 400;

    if (mode === 'pain' && onAddPainPoint) {
      onAddPainPoint({ x, y, intensity, type: selectedType });
    } else if (mode === 'bruxism' && onAddBruxism) {
      onAddBruxism({ x, y, severity: intensity <= 3 ? 'mild' : intensity <= 6 ? 'moderate' : 'severe', toothNumber: 0 });
    } else if (mode === 'botox' && onAddBotox) {
      onAddBotox({ x, y, zone: selectedZone, units });
    }
  };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">TMJ & Facial Anatomy</h3>
        {editable && (
          <div className="flex items-center gap-1">
            {(['view', 'pain', 'bruxism', 'botox'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border capitalize ${mode === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {editable && mode === 'pain' && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
          {(['clicking', 'locking', 'pain', 'tenderness'] as PainPointType[]).map((t) => (
            <button key={t} onClick={() => setSelectedType(t)} className={`px-2 py-0.5 rounded text-[10px] font-medium border ${selectedType === t ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`} style={{ borderColor: selectedType === t ? '#1f2937' : PAIN_COLORS[t] }}>
              {PAIN_LABELS[t]}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-[10px] text-slate-500">Intensity: {intensity}/10</span>
          <input type="range" min={1} max={10} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-24 h-1 accent-red-500" />
        </div>
      )}

      {editable && mode === 'botox' && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
          {(['masseter', 'temporalis', 'frontalis'] as BotoxZone[]).map((z) => (
            <button key={z} onClick={() => setSelectedZone(z)} className={`px-2 py-0.5 rounded text-[10px] font-medium border capitalize ${selectedZone === z ? 'bg-slate-800 text-white' : 'bg-white text-slate-600'}`}>
              {z}
            </button>
          ))}
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-[10px] text-slate-500">Units: {units}</span>
          <input type="range" min={5} max={50} step={5} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="w-24 h-1 accent-violet-500" />
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <svg viewBox="0 0 500 400" className="h-auto w-full" onClick={handleSvgClick} style={{ cursor: editable && mode !== 'view' ? 'crosshair' : 'default' }}>
          {/* Background head silhouette */}
          <ellipse cx={250} cy={200} rx={140} ry={170} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />

          {/* Mandible (lower jaw) */}
          <path d="M 170,240 Q 250,340 330,240 Q 320,280 250,310 Q 180,280 170,240 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.5} />
          <path d="M 185,245 Q 250,320 315,245" fill="none" stroke="#cbd5e1" strokeWidth={1} />

          {/* Maxilla (upper jaw) */}
          <path d="M 175,200 Q 250,150 325,200 Q 315,230 250,245 Q 185,230 175,200 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1.5} />

          {/* Teeth row upper */}
          <path d="M 190,205 Q 250,215 310,205" fill="none" stroke="#cbd5e1" strokeWidth={2} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={`u${i}`} x={198 + i * 13} y={198} width={8} height={10} rx={2} fill="white" stroke="#cbd5e1" strokeWidth={0.5} />
          ))}

          {/* Teeth row lower */}
          <path d="M 195,235 Q 250,245 305,235" fill="none" stroke="#cbd5e1" strokeWidth={2} />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={`l${i}`} x={203 + i * 12} y={232} width={7} height={9} rx={2} fill="white" stroke="#cbd5e1" strokeWidth={0.5} />
          ))}

          {/* TMJ joints */}
          <circle cx={165} cy={185} r={14} fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} opacity={0.6} />
          <text x={165} y={189} textAnchor="middle" fill="#1e40af" style={{ fontSize: '8px', fontWeight: 700 }}>L-TMJ</text>

          <circle cx={335} cy={185} r={14} fill="#dbeafe" stroke="#3b82f6" strokeWidth={2} opacity={0.6} />
          <text x={335} y={189} textAnchor="middle" fill="#1e40af" style={{ fontSize: '8px', fontWeight: 700 }}>R-TMJ</text>

          {/* Articular disc */}
          <ellipse cx={165} cy={178} rx={10} ry={4} fill="#93c5fd" opacity={0.5} />
          <ellipse cx={335} cy={178} rx={10} ry={4} fill="#93c5fd" opacity={0.5} />

          {/* Masseter muscles */}
          <path d="M 150,220 Q 130,260 155,290 Q 170,270 165,230 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth={1} opacity={0.4} />
          <text x={140} y={265} fill="#7c3aed" style={{ fontSize: '8px', fontWeight: 600 }}>Masseter</text>

          <path d="M 350,220 Q 370,260 345,290 Q 330,270 335,230 Z" fill="#ddd6fe" stroke="#a855f7" strokeWidth={1} opacity={0.4} />
          <text x={360} y={265} fill="#7c3aed" style={{ fontSize: '8px', fontWeight: 600 }}>Masseter</text>

          {/* Temporalis muscles */}
          <path d="M 170,120 Q 150,80 190,70 Q 230,80 210,120 Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} opacity={0.3} />
          <text x={190} y={100} fill="#2563eb" style={{ fontSize: '8px', fontWeight: 600 }}>Temporalis</text>

          <path d="M 330,120 Q 350,80 310,70 Q 270,80 290,120 Z" fill="#bfdbfe" stroke="#3b82f6" strokeWidth={1} opacity={0.3} />
          <text x={310} y={100} fill="#2563eb" style={{ fontSize: '8px', fontWeight: 600 }}>Temporalis</text>

          {/* Pain points */}
          {painPoints.map((p) => (
            <g key={`pain-${p.id}`}>
              <circle cx={p.x} cy={p.y} r={6 + p.intensity} fill={PAIN_COLORS[p.type]} opacity={0.4} />
              <circle cx={p.x} cy={p.y} r={4} fill={PAIN_COLORS[p.type]} stroke="white" strokeWidth={1.5} />
              <text x={p.x} y={p.y + 1} textAnchor="middle" fill="white" style={{ fontSize: '8px', fontWeight: 700 }}>{p.intensity}</text>
              {onRemovePoint && (
                <text x={p.x + 8} y={p.y - 8} fill="#ef4444" style={{ fontSize: '10px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onRemovePoint(p.id, 'pain'); }}>×</text>
              )}
            </g>
          ))}

          {/* Bruxism markers */}
          {bruxismMarkers.map((b) => (
            <g key={`brux-${b.id}`}>
              <polygon points={`${b.x},${b.y - 8} ${b.x - 7},${b.y + 4} ${b.x + 7},${b.y + 4}`} fill={BRUXISM_COLORS[b.severity]} stroke="white" strokeWidth={1} opacity={0.8} />
              <text x={b.x} y={b.y + 1} textAnchor="middle" fill="white" style={{ fontSize: '7px', fontWeight: 700 }}>B</text>
              {onRemovePoint && (
                <text x={b.x + 8} y={b.y - 8} fill="#ef4444" style={{ fontSize: '10px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onRemovePoint(b.id, 'bruxism'); }}>×</text>
              )}
            </g>
          ))}

          {/* Botox points */}
          {botoxPoints.map((b) => (
            <g key={`botox-${b.id}`}>
              <circle cx={b.x} cy={b.y} r={10} fill={BOTOX_COLORS[b.zone]} opacity={0.3} />
              <circle cx={b.x} cy={b.y} r={4} fill={BOTOX_COLORS[b.zone]} stroke="white" strokeWidth={1.5} />
              <text x={b.x} y={b.y + 1} textAnchor="middle" fill="white" style={{ fontSize: '7px', fontWeight: 700 }}>{b.units}</text>
              {onRemovePoint && (
                <text x={b.x + 10} y={b.y - 10} fill="#ef4444" style={{ fontSize: '10px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); onRemovePoint(b.id, 'botox'); }}>×</text>
              )}
            </g>
          ))}

          {/* Smile design overlay lines */}
          <line x1={160} y1={175} x2={340} y2={175} stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.4} />
          <text x={350} y={178} fill="#d97706" style={{ fontSize: '8px' }}>Smile line</text>

          <line x1={250} y1={140} x2={250} y2={260} stroke="#f59e0b" strokeWidth={0.5} strokeDasharray="3 3" opacity={0.4} />
          <text x={255} y={270} fill="#d97706" style={{ fontSize: '8px' }}>Midline</text>
        </svg>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <h4 className="text-[10px] font-semibold text-slate-900 mb-1">Pain Points ({painPoints.length})</h4>
          {painPoints.length === 0 ? <p className="text-[9px] text-slate-400">None</p> : (
            <div className="space-y-0.5">
              {painPoints.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PAIN_COLORS[p.type] }} />
                  <span className="text-[9px] text-slate-600">{PAIN_LABELS[p.type]} {p.intensity}/10</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <h4 className="text-[10px] font-semibold text-slate-900 mb-1">Bruxism ({bruxismMarkers.length})</h4>
          {bruxismMarkers.length === 0 ? <p className="text-[9px] text-slate-400">None</p> : (
            <div className="space-y-0.5">
              {bruxismMarkers.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BRUXISM_COLORS[b.severity] }} />
                  <span className="text-[9px] text-slate-600 capitalize">{b.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <h4 className="text-[10px] font-semibold text-slate-900 mb-1">Botox ({botoxPoints.length})</h4>
          {botoxPoints.length === 0 ? <p className="text-[9px] text-slate-400">None</p> : (
            <div className="space-y-0.5">
              {botoxPoints.map((b) => (
                <div key={b.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BOTOX_COLORS[b.zone] }} />
                  <span className="text-[9px] text-slate-600 capitalize">{b.zone} {b.units}U</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

