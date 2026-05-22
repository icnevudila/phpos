import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export type ChairStatus = 'empty' | 'occupied' | 'cleaning' | 'reserved';

export interface Chair {
  id: string;
  name: string;
  x: number;
  y: number;
  status: ChairStatus;
  patientName?: string;
  procedure?: string;
  dentist?: string;
  etaMinutes?: number;
}

export interface WaitingPatient {
  id: string;
  name: string;
  avatar?: string;
  appointmentTime: string;
  procedure: string;
  priority: 'normal' | 'urgent';
}

export interface ClinicFloorPlanProps {
  chairs: Chair[];
  waiting: WaitingPatient[];
  onAssignChair?: (patientId: string, chairId: string) => void;
  onUpdateChairStatus?: (chairId: string, status: ChairStatus) => void;
  className?: string;
}

const CHAIR_COLORS: Record<ChairStatus, { fill: string; stroke: string; text: string }> = {
  empty:    { fill: '#dcfce7', stroke: '#22c55e', text: '#15803d' },
  occupied: { fill: '#fee2e2', stroke: '#ef4444', text: '#b91c1c' },
  cleaning: { fill: '#fef3c7', stroke: '#f59e0b', text: '#b45309' },
  reserved: { fill: '#e0f2fe', stroke: '#0ea5e9', text: '#0369a1' },
};

const ItemTypes = { PATIENT: 'patient' };

function DraggablePatient({ patient }: { patient: WaitingPatient }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PATIENT,
    item: { id: patient.id, name: patient.name },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <div ref={drag} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-grab transition ${isDragging ? 'opacity-50' : 'opacity-100'} ${patient.priority === 'urgent' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${patient.priority === 'urgent' ? 'bg-rose-500' : 'bg-slate-500'}`}>
        {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-800 truncate">{patient.name}</p>
        <p className="text-[9px] text-slate-400 truncate">{patient.procedure}</p>
      </div>
      <span className="text-[9px] text-slate-400 ml-auto">{patient.appointmentTime}</span>
    </div>
  );
}

function DroppableChair({ chair, onDrop }: { chair: Chair; onDrop: (patientId: string) => void }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.PATIENT,
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const c = CHAIR_COLORS[chair.status];

  return (
    <g ref={drop as any} transform={`translate(${chair.x},${chair.y})`}>
      <rect x={-40} y={-30} width={80} height={60} rx={10} fill={c.fill} stroke={isOver ? '#0ea5e9' : c.stroke} strokeWidth={isOver ? 3 : 2} strokeDasharray={chair.status === 'empty' ? '4 2' : '0'} />
      <text y={-12} textAnchor="middle" fill={c.text} style={{ fontSize: '10px', fontWeight: 700 }}>{chair.name}</text>
      {chair.patientName && <text y={2} textAnchor="middle" fill={c.text} style={{ fontSize: '9px' }} className="truncate">{chair.patientName}</text>}
      {chair.procedure && <text y={14} textAnchor="middle" fill={c.text} style={{ fontSize: '8px' }}>{chair.procedure}</text>}
      {chair.etaMinutes != null && <text y={24} textAnchor="middle" fill={c.text} style={{ fontSize: '8px' }}>{chair.etaMinutes}m</text>}
      {/* Chair icon */}
      <path d="M -12,32 L -12,38 L 12,38 L 12,32 Z" fill={c.stroke} opacity={0.3} />
      <circle cx={0} cy={38} r={3} fill={c.stroke} />
    </g>
  );
}

export default function ClinicFloorPlan({ chairs, waiting, onAssignChair, onUpdateChairStatus, className = '' }: ClinicFloorPlanProps): JSX.Element {
  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const handleDrop = useCallback((chairId: string, patientId: string) => {
    setSelectedChair(chairId);
    onAssignChair?.(patientId, chairId);
  }, [onAssignChair]);

  const selected = chairs.find((c) => c.id === selectedChair);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`space-y-3 ${className}`.trim()}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">Clinic Floor Plan</h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" />Empty</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Occupied</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />Cleaning</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />Reserved</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto">
            <svg viewBox="0 0 700 420" className="h-auto w-full min-w-[700px]">
              {/* Background zones */}
              <rect x={20} y={20} width={200} height={120} rx={12} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
              <text x={30} y={38} fill="#94a3b8" style={{ fontSize: '10px', fontWeight: 600 }}>Waiting Area</text>

              <rect x={20} y={160} width={120} height={100} rx={12} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
              <text x={30} y={178} fill="#94a3b8" style={{ fontSize: '10px', fontWeight: 600 }}>Reception</text>

              <rect x={20} y={280} width={120} height={100} rx={12} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
              <text x={30} y={298} fill="#94a3b8" style={{ fontSize: '10px', fontWeight: 600 }}>X-Ray Room</text>

              <rect x={520} y={20} width={160} height={120} rx={12} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4 2" />
              <text x={530} y={38} fill="#94a3b8" style={{ fontSize: '10px', fontWeight: 600 }}>Sterilization</text>

              {/* Treatment area label */}
              <text x={350} y={38} fill="#94a3b8" style={{ fontSize: '10px', fontWeight: 600 }} textAnchor="middle">Treatment Area</text>

              {/* Chairs */}
              {chairs.map((chair) => (
                <DroppableChair key={chair.id} chair={chair} onDrop={(pid) => handleDrop(chair.id, pid)} />
              ))}
            </svg>
          </div>

          <div className="w-56 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <h4 className="text-xs font-semibold text-slate-800 mb-2">Waiting ({waiting.length})</h4>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {waiting.length === 0 && <p className="text-[10px] text-slate-400">No patients waiting</p>}
                {waiting.map((p) => <DraggablePatient key={p.id} patient={p} />)}
              </div>
            </div>

            {selected && onUpdateChairStatus && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-800 mb-2">{selected.name}</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['empty', 'occupied', 'cleaning', 'reserved'] as ChairStatus[]).map((s) => (
                    <button key={s} onClick={() => onUpdateChairStatus(selected.id, s)} className={`px-2 py-1 rounded text-[10px] font-medium border capitalize ${selected.status === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
