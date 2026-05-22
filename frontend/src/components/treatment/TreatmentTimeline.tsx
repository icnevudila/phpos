import { useState, useRef } from 'react';

export type TimelineStatus = 'planned' | 'in-progress' | 'completed' | 'delayed';

export interface TimelinePhase {
  id: string;
  name: string;
  startDay: number;
  durationDays: number;
  status: TimelineStatus;
  progress: number;
  dependencies?: string[];
  dentist?: string;
  notes?: string;
}

export interface TreatmentTimelineProps {
  phases: TimelinePhase[];
  editable?: boolean;
  onUpdate?: (phases: TimelinePhase[]) => void;
  className?: string;
}

const STATUS_STYLES: Record<TimelineStatus, { bg: string; border: string; text: string; bar: string }> = {
  planned:    { bg: 'bg-sky-50',  border: 'border-sky-200',  text: 'text-sky-700',  bar: 'bg-sky-500' },
  'in-progress': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
  completed:  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', bar: 'bg-teal-500' },
  delayed:    { bg: 'bg-rose-50',  border: 'border-rose-200',  text: 'text-rose-700',  bar: 'bg-rose-500' },
};

const DAY_WIDTH = 32;
const HEADER_H = 36;
const ROW_H = 56;
const LEFT_W = 180;

export default function TreatmentTimeline({ phases, editable = false, onUpdate, className = '' }: TreatmentTimelineProps): JSX.Element {
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDays = Math.max(...phases.map((p) => p.startDay + p.durationDays), 30);
  const svgW = LEFT_W + totalDays * DAY_WIDTH + 40;
  const svgH = HEADER_H + phases.length * ROW_H + 20;

  const updatePhase = (id: string, patch: Partial<TimelinePhase>) => {
    if (!onUpdate) return;
    onUpdate(phases.map((p) => p.id === id ? { ...p, ...patch } : p));
  };

  const handleMouseDown = (e: React.MouseEvent, phaseId: string) => {
    if (!editable) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - LEFT_W;
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return;
    setDragging(phaseId);
    setDragOffset(x - phase.startDay * DAY_WIDTH);
    setSelected(phaseId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !editable) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - LEFT_W - dragOffset;
    const newStart = Math.max(0, Math.round(x / DAY_WIDTH));
    updatePhase(dragging, { startDay: newStart });
  };

  const handleMouseUp = () => { setDragging(null); };

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-800">Treatment Plan Timeline</h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />Planned</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />Completed</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />Delayed</span>
        </div>
      </div>

      <div ref={containerRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <svg width={svgW} height={svgH} className="block">
          {/* Grid */}
          {Array.from({ length: totalDays + 1 }, (_, i) => (
            <line key={`v${i}`} x1={LEFT_W + i * DAY_WIDTH} y1={0} x2={LEFT_W + i * DAY_WIDTH} y2={svgH} stroke="#f1f5f9" strokeWidth={1} />
          ))}
          {Array.from({ length: phases.length + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={HEADER_H + i * ROW_H} x2={svgW} y2={HEADER_H + i * ROW_H} stroke="#e2e8f0" strokeWidth={1} />
          ))}

          {/* Month labels */}
          {Array.from({ length: Math.ceil(totalDays / 30) }, (_, m) => (
            <text key={`m${m}`} x={LEFT_W + m * 30 * DAY_WIDTH + 4} y={24} className="fill-slate-400" style={{ fontSize: '10px', fontWeight: 600 }}>
              Month {m + 1}
            </text>
          ))}

          {/* Today marker */}
          <line x1={LEFT_W} y1={0} x2={LEFT_W} y2={svgH} stroke="#0ea5e9" strokeWidth={2} strokeDasharray="4 4" />
          <text x={LEFT_W + 4} y={12} className="fill-sky-500" style={{ fontSize: '9px', fontWeight: 700 }}>TODAY</text>

          {/* Phases */}
          {phases.map((phase, i) => {
            const sty = STATUS_STYLES[phase.status];
            const y = HEADER_H + i * ROW_H + 10;
            const x = LEFT_W + phase.startDay * DAY_WIDTH;
            const w = Math.max(phase.durationDays * DAY_WIDTH - 4, 20);
            const isSel = selected === phase.id;

            return (
              <g key={phase.id}>
                {/* Dependency lines */}
                {phase.dependencies?.map((depId) => {
                  const dep = phases.find((p) => p.id === depId);
                  if (!dep) return null;
                  const depIdx = phases.findIndex((p) => p.id === depId);
                  const x1 = LEFT_W + (dep.startDay + dep.durationDays) * DAY_WIDTH;
                  const y1 = HEADER_H + depIdx * ROW_H + ROW_H / 2;
                  const x2 = x;
                  const y2 = y + ROW_H / 2 - 10;
                  return <path key={`${phase.id}-${depId}`} d={`M ${x1},${y1} C ${x1 + 20},${y1} ${x2 - 20},${y2} ${x2},${y2}`} fill="none" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="3 3" markerEnd="url(#arrowhead)" />;
                })}

                {/* Label */}
                <text x={12} y={y + 18} className="fill-slate-700" style={{ fontSize: '11px', fontWeight: 600 }}>{phase.name}</text>
                <text x={12} y={y + 32} className="fill-slate-400" style={{ fontSize: '9px' }}>{phase.dentist || 'Unassigned'}</text>

                {/* Bar */}
                <rect
                  x={x} y={y} width={w} height={ROW_H - 20} rx={6}
                  className={`${sty.bg} ${isSel ? 'stroke-teal-600' : sty.border}`}
                  strokeWidth={isSel ? 2 : 1}
                  style={{ cursor: editable ? 'grab' : 'pointer' }}
                  onMouseDown={(e) => handleMouseDown(e, phase.id)}
                  onClick={() => setSelected(phase.id)}
                />

                {/* Progress fill */}
                <rect x={x + 1} y={y + 1} width={(w - 2) * (phase.progress / 100)} height={ROW_H - 22} rx={5} className={sty.bar} opacity={0.25} />

                {/* Progress bar */}
                <rect x={x} y={y + ROW_H - 26} width={w} height={4} rx={2} fill="#e2e8f0" />
                <rect x={x} y={y + ROW_H - 26} width={w * (phase.progress / 100)} height={4} rx={2} className={sty.bar} />

                {/* Text on bar */}
                <text x={x + 8} y={y + 20} className={sty.text} style={{ fontSize: '10px', fontWeight: 600 }}>
                  D{phase.startDay}–{phase.startDay + phase.durationDays} ({phase.progress}%)
                </text>

                {/* Milestone diamond */}
                <polygon points={`${x + w + 6},${y + 12} ${x + w + 12},${y + 18} ${x + w + 6},${y + 24} ${x + w},${y + 18}`} fill={phase.status === 'completed' ? '#14b8a6' : '#cbd5e1'} stroke="white" strokeWidth={1} />
              </g>
            );
          })}

          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#cbd5e1" />
            </marker>
          </defs>
        </svg>
      </div>

      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {(() => {
            const phase = phases.find((p) => p.id === selected);
            if (!phase) return null;
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">{phase.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_STYLES[phase.status].bg} ${STATUS_STYLES[phase.status].text} ${STATUS_STYLES[phase.status].border}`}>{phase.status}</span>
                </div>
                <p className="text-xs text-slate-500">{phase.notes || 'No notes'}</p>
                {editable && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] text-slate-500">Progress</span>
                    <input type="range" min={0} max={100} value={phase.progress} onChange={(e) => updatePhase(phase.id, { progress: Number(e.target.value) })} className="flex-1 h-1 accent-teal-600" />
                    <span className="text-[10px] text-slate-600 w-8">{phase.progress}%</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
