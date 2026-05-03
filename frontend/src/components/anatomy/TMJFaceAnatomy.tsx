import { useState, useMemo } from 'react';
import { Zap, RotateCcw, Download } from 'lucide-react';

export interface PainPoint {
  id: string;
  label: string;
  type: 'tmj' | 'muscle' | 'nerve' | 'bone';
  x: number;
  y: number;
}

export interface ClinicNotePoint {
  pointId: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  date: string;
}

export interface TMJFaceAnatomyProps {
  selectedPoints?: string[];
  onPointSelect?: (pointId: string, severity: 'mild' | 'moderate' | 'severe') => void;
  onPointClear?: (pointId: string) => void;
  notes?: ClinicNotePoint[];
  className?: string;
}

const PAIN_POINTS: PainPoint[] = [
  // TMJ points
  { id: 'tmj-left', label: 'Left TMJ', type: 'tmj', x: 120, y: 140 },
  { id: 'tmj-right', label: 'Right TMJ', type: 'tmj', x: 280, y: 140 },
  
  // Muscle points
  { id: 'masseter-left', label: 'Left Masseter', type: 'muscle', x: 100, y: 160 },
  { id: 'masseter-right', label: 'Right Masseter', type: 'muscle', x: 300, y: 160 },
  { id: 'temporalis-left', label: 'Left Temporalis', type: 'muscle', x: 80, y: 100 },
  { id: 'temporalis-right', label: 'Right Temporalis', type: 'muscle', x: 320, y: 100 },
  
  // Nerve points
  { id: 'trigeminal-left', label: 'Left Trigeminal', type: 'nerve', x: 110, y: 180 },
  { id: 'trigeminal-right', label: 'Right Trigeminal', type: 'nerve', x: 290, y: 180 },
  
  // Bone points
  { id: 'mandible-left', label: 'Left Mandible', type: 'bone', x: 130, y: 200 },
  { id: 'mandible-right', label: 'Right Mandible', type: 'bone', x: 270, y: 200 },
  { id: 'maxilla', label: 'Maxilla', type: 'bone', x: 200, y: 80 },
];

const POINT_COLORS = {
  tmj: { default: '#0ea5e9', mild: '#fbbf24', moderate: '#f97316', severe: '#dc2626' },
  muscle: { default: '#ec4899', mild: '#fbbf24', moderate: '#f97316', severe: '#dc2626' },
  nerve: { default: '#a855f7', mild: '#fbbf24', moderate: '#f97316', severe: '#dc2626' },
  bone: { default: '#f59e0b', mild: '#fbbf24', moderate: '#f97316', severe: '#dc2626' },
};

function FaceOutline() {
  return (
    <g>
      {/* Head oval */}
      <ellipse cx="200" cy="120" rx="80" ry="100" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      
      {/* Face midline */}
      <line x1="200" y1="30" x2="200" y2="210" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
      
      {/* Nose */}
      <polygon points="200,80 190,120 210,120" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      
      {/* Eyes */}
      <circle cx="160" cy="90" r="5" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="240" cy="90" r="5" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      
      {/* Mouth */}
      <path d="M 170 140 Q 200 150 230 140" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      
      {/* Mandible outline */}
      <path
        d="M 140 160 Q 200 220 260 160"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
    </g>
  );
}

function MuscleLayers() {
  return (
    <g opacity="0.3">
      {/* Masseter muscle left */}
      <ellipse cx="100" cy="160" rx="35" ry="25" fill="#ec4899" stroke="none" />
      
      {/* Masseter muscle right */}
      <ellipse cx="300" cy="160" rx="35" ry="25" fill="#ec4899" stroke="none" />
      
      {/* Temporalis left */}
      <path
        d="M 80 80 Q 100 90 110 120 Q 100 110 85 100 Z"
        fill="#ec4899"
        stroke="none"
      />
      
      {/* Temporalis right */}
      <path
        d="M 320 80 Q 300 90 290 120 Q 300 110 315 100 Z"
        fill="#ec4899"
        stroke="none"
      />
    </g>
  );
}

function PainMarker({
  point,
  severity,
  isSelected,
  onSelect,
}: {
  point: PainPoint;
  severity?: 'mild' | 'moderate' | 'severe';
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colors = POINT_COLORS[point.type];
  const fillColor = severity ? colors[severity] : colors.default;
  
  return (
    <g key={point.id} onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Outer ring for selection */}
      {isSelected && (
        <circle
          cx={point.x}
          cy={point.y}
          r="12"
          fill="none"
          stroke={fillColor}
          strokeWidth="2"
          opacity="0.5"
        />
      )}
      
      {/* Main point */}
      <circle
        cx={point.x}
        cy={point.y}
        r="7"
        fill={fillColor}
        stroke="white"
        strokeWidth="2"
        opacity={isSelected ? 1 : 0.8}
      />
      
      {/* Inner dot */}
      <circle
        cx={point.x}
        cy={point.y}
        r="3"
        fill="white"
      />
      
      {/* Hover label */}
      <title>{point.label}</title>
    </g>
  );
}

export function TMJFaceAnatomy({
  selectedPoints = [],
  onPointSelect,
  onPointClear,
  notes = [],
  className = '',
}: TMJFaceAnatomyProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
  const [showMuscles, setShowMuscles] = useState(false);

  const pointsByType = useMemo(() => {
    return PAIN_POINTS.reduce(
      (acc, p) => {
        if (!acc[p.type]) acc[p.type] = [];
        acc[p.type].push(p);
        return acc;
      },
      {} as Record<string, PainPoint[]>,
    );
  }, []);

  const notesByPoint = useMemo(() => {
    return notes.reduce(
      (acc, n) => {
        acc[n.pointId] = n;
        return acc;
      },
      {} as Record<string, ClinicNotePoint>,
    );
  }, [notes]);

  const handlePointClick = (pointId: string) => {
    onPointSelect?.(pointId, selectedSeverity);
  };

  const handleClearAll = () => {
    selectedPoints.forEach((pid) => onPointClear?.(pid));
  };

  return (
    <div className={`space-y-3 rounded-lg bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Zap size={16} />
          TMJ & Face Anatomy
        </h3>
        <button
          onClick={handleClearAll}
          disabled={selectedPoints.length === 0}
          className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 flex items-center gap-1"
        >
          <RotateCcw size={12} /> Clear
        </button>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>TMJ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span>Muscle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Nerve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Bone</span>
        </div>
      </div>

      {/* Severity selector */}
      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
        <span className="text-xs font-medium text-slate-700">Severity:</span>
        <button
          onClick={() => setSelectedSeverity('mild')}
          className={`px-2 py-1 rounded text-xs font-medium ${
            selectedSeverity === 'mild'
              ? 'bg-yellow-400 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Mild
        </button>
        <button
          onClick={() => setSelectedSeverity('moderate')}
          className={`px-2 py-1 rounded text-xs font-medium ${
            selectedSeverity === 'moderate'
              ? 'bg-orange-500 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Moderate
        </button>
        <button
          onClick={() => setSelectedSeverity('severe')}
          className={`px-2 py-1 rounded text-xs font-medium ${
            selectedSeverity === 'severe'
              ? 'bg-red-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Severe
        </button>
        <label className="ml-auto flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showMuscles}
            onChange={(e) => setShowMuscles(e.target.checked)}
            className="rounded"
          />
          Show muscles
        </label>
      </div>

      {/* SVG Canvas */}
      <svg
        width="400"
        height="300"
        viewBox="0 0 400 300"
        className="w-full border border-slate-200 rounded-lg bg-gradient-to-b from-slate-50 to-white"
      >
        {/* Face outline */}
        <FaceOutline />

        {/* Muscle layers */}
        {showMuscles && <MuscleLayers />}

        {/* Pain points */}
        {PAIN_POINTS.map((point) => (
          <PainMarker
            key={point.id}
            point={point}
            severity={notesByPoint[point.id]?.severity}
            isSelected={selectedPoints.includes(point.id)}
            onSelect={() => handlePointClick(point.id)}
          />
        ))}
      </svg>

      {/* Selected points summary */}
      {selectedPoints.length > 0 && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-900">
            {selectedPoints.length} point{selectedPoints.length !== 1 ? 's' : ''} marked
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPoints.map((pid) => {
              const point = PAIN_POINTS.find((p) => p.id === pid);
              const note = notesByPoint[pid];
              if (!point) return null;

              return (
                <div
                  key={pid}
                  className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs border"
                  style={{
                    borderColor: POINT_COLORS[point.type][note?.severity || 'default'],
                  }}
                >
                  <span className="font-medium">{point.label}</span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: POINT_COLORS[point.type][note?.severity || 'default'],
                    }}
                  >
                    {note?.severity || 'unmarked'}
                  </span>
                  <button
                    onClick={() => onPointClear?.(pid)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-semibold text-slate-900">Clinical Notes</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {notes.map((note) => {
              const point = PAIN_POINTS.find((p) => p.id === note.pointId);
              if (!point) return null;

              return (
                <div key={note.pointId} className="rounded bg-slate-50 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{point.label}</span>
                    <span
                      className="px-2 py-0.5 rounded text-white font-bold text-[10px]"
                      style={{
                        backgroundColor: POINT_COLORS[point.type][note.severity],
                      }}
                    >
                      {note.severity.toUpperCase()}
                    </span>
                  </div>
                  {note.notes && (
                    <p className="mt-1 text-slate-600">{note.notes}</p>
                  )}
                  <p className="text-[10px] text-slate-500 mt-1">{note.date}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
