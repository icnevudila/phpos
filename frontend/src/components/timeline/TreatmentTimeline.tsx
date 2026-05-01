import { useMemo, useState } from 'react';
import { Calendar, ChevronRight, AlertCircle } from 'lucide-react';

export interface TreatmentPhase {
  id: string;
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: 'pending' | 'in-progress' | 'completed' | 'paused';
  treatments?: string[];
  notes?: string;
  order: number;
}

export interface TreatmentTimelineProps {
  phases: TreatmentPhase[];
  onPhaseUpdate?: (phase: TreatmentPhase) => void;
  onPhaseReorder?: (phases: TreatmentPhase[]) => void;
  className?: string;
}

function parseDate(d: Date | string): Date {
  return typeof d === 'string' ? new Date(d) : d;
}

function formatDate(d: Date | string): string {
  const date = parseDate(d);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getDaysBetween(start: Date | string, end: Date | string): number {
  const s = parseDate(start);
  const e = parseDate(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusColor(status: TreatmentPhase['status']): {
  bg: string;
  border: string;
  text: string;
  bar: string;
} {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-green-50',
        border: 'border-green-300',
        text: 'text-green-700',
        bar: 'bg-green-500',
      };
    case 'in-progress':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        text: 'text-blue-700',
        bar: 'bg-blue-500',
      };
    case 'paused':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        bar: 'bg-amber-500',
      };
    default:
      return {
        bg: 'bg-slate-50',
        border: 'border-slate-300',
        text: 'text-slate-700',
        bar: 'bg-slate-400',
      };
  }
}

function PhaseBar({
  phase,
  minDate,
  maxDate,
  totalDays,
}: {
  phase: TreatmentPhase;
  minDate: Date;
  maxDate: Date;
  totalDays: number;
}) {
  const phaseStart = parseDate(phase.startDate);
  const phaseEnd = parseDate(phase.endDate);

  const startOffset = (phaseStart.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  const phaseDuration = getDaysBetween(phaseStart, phaseEnd);

  const leftPercent = (startOffset / totalDays) * 100;
  const widthPercent = (phaseDuration / totalDays) * 100;

  const colors = getStatusColor(phase.status);

  return (
    <div
      key={`bar-${phase.id}`}
      className="relative h-10 rounded-lg border-2 transition-all hover:shadow-md"
      style={{
        marginLeft: `${Math.max(0, leftPercent)}%`,
        width: `${Math.max(5, widthPercent)}%`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Status indicator dot */}
      <div
        className={`absolute -top-1.5 left-1 h-3 w-3 rounded-full ${colors.bar}`}
      />

      {/* Phase title */}
      <div className="flex h-full items-center justify-center px-2">
        <span className={`truncate text-xs font-semibold ${colors.text}`}>
          {phase.title}
        </span>
      </div>

      {/* Duration label on hover */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:opacity-100">
        {phaseDuration} days
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  onUpdate,
}: {
  phase: TreatmentPhase;
  index: number;
  onUpdate?: (phase: TreatmentPhase) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const daysDuration = getDaysBetween(phase.startDate, phase.endDate);
  const colors = getStatusColor(phase.status);

  return (
    <div
      className={`rounded-lg border-l-4 p-4 shadow-sm transition-all ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              Phase {index + 1}:
            </span>
            <h4 className="text-sm font-semibold text-slate-900">
              {phase.title}
            </h4>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors.text}`}
              style={{
                backgroundColor: `${colors.bar}20`,
                color: colors.text,
              }}
            >
              {phase.status}
            </span>
          </div>

          {phase.description && (
            <p className="mt-1 text-xs text-slate-600">{phase.description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(phase.startDate)}</span>
            </div>
            <ChevronRight size={14} className="text-slate-400" />
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(phase.endDate)}</span>
            </div>
            <span className="font-medium text-slate-700">
              ({daysDuration} days)
            </span>
          </div>

          {phase.treatments && phase.treatments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {phase.treatments.slice(0, 3).map((treatment, i) => (
                <span
                  key={i}
                  className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-slate-700"
                >
                  {treatment}
                </span>
              ))}
              {phase.treatments.length > 3 && (
                <span className="inline-block rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                  +{phase.treatments.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`ml-2 text-slate-500 transition-transform ${
            isExpanded ? 'rotate-90' : ''
          }`}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t pt-3">
          {phase.notes && (
            <div>
              <p className="text-xs font-medium text-slate-700">Notes:</p>
              <p className="mt-1 text-xs text-slate-600">{phase.notes}</p>
            </div>
          )}

          {phase.treatments && phase.treatments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-700">Treatments:</p>
              <ul className="mt-1 space-y-1">
                {phase.treatments.map((treatment, i) => (
                  <li key={i} className="text-xs text-slate-600">
                    • {treatment}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {phase.status === 'pending' && (
            <button
              onClick={() =>
                onUpdate?.({ ...phase, status: 'in-progress' })
              }
              className="mt-3 w-full rounded bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
            >
              Start Phase
            </button>
          )}

          {phase.status === 'in-progress' && (
            <button
              onClick={() =>
                onUpdate?.({ ...phase, status: 'completed' })
              }
              className="mt-3 w-full rounded bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600"
            >
              Complete Phase
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function TreatmentTimeline({
  phases = [],
  onPhaseUpdate,
  onPhaseReorder,
  className = '',
}: TreatmentTimelineProps) {
  const sortedPhases = useMemo(
    () => [...phases].sort((a, b) => a.order - b.order),
    [phases],
  );

  const dateRange = useMemo(() => {
    if (sortedPhases.length === 0) {
      return { min: new Date(), max: new Date() };
    }

    const dates = sortedPhases.flatMap((p) => [
      parseDate(p.startDate),
      parseDate(p.endDate),
    ]);
    return {
      min: new Date(Math.min(...dates.map((d) => d.getTime()))),
      max: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [sortedPhases]);

  const totalDays = getDaysBetween(dateRange.min, dateRange.max) || 1;

  const stats = useMemo(() => {
    return {
      total: sortedPhases.length,
      completed: sortedPhases.filter((p) => p.status === 'completed').length,
      inProgress: sortedPhases.filter((p) => p.status === 'in-progress').length,
      pending: sortedPhases.filter((p) => p.status === 'pending').length,
    };
  }, [sortedPhases]);

  const progressPercent = (stats.completed / Math.max(1, stats.total)) * 100;

  return (
    <div className={`space-y-4 rounded-lg bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Treatment Roadmap
        </h3>
        <div className="text-xs text-slate-500">
          {stats.completed}/{stats.total} phases completed
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded bg-slate-50 p-2 text-center">
          <div className="text-xs font-semibold text-slate-900">
            {stats.total}
          </div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="rounded bg-green-50 p-2 text-center">
          <div className="text-xs font-semibold text-green-700">
            {stats.completed}
          </div>
          <div className="text-xs text-green-600">Completed</div>
        </div>
        <div className="rounded bg-blue-50 p-2 text-center">
          <div className="text-xs font-semibold text-blue-700">
            {stats.inProgress}
          </div>
          <div className="text-xs text-blue-600">In Progress</div>
        </div>
        <div className="rounded bg-slate-100 p-2 text-center">
          <div className="text-xs font-semibold text-slate-700">
            {stats.pending}
          </div>
          <div className="text-xs text-slate-600">Pending</div>
        </div>
      </div>

      {/* Gantt chart */}
      {sortedPhases.length > 0 && (
        <div className="space-y-1 rounded-lg bg-slate-50 p-3">
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-600 mb-2">
              <span>{formatDate(dateRange.min)}</span>
              <span>{formatDate(dateRange.max)}</span>
            </div>
            <div className="space-y-2">
              {sortedPhases.map((phase) => (
                <PhaseBar
                  key={`gantt-${phase.id}`}
                  phase={phase}
                  minDate={dateRange.min}
                  maxDate={dateRange.max}
                  totalDays={totalDays}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Phase cards */}
      <div className="space-y-3">
        {sortedPhases.map((phase, index) => (
          <PhaseCard
            key={`card-${phase.id}`}
            phase={phase}
            index={index}
            onUpdate={onPhaseUpdate}
          />
        ))}
      </div>

      {sortedPhases.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-2 text-slate-400" size={24} />
            <p className="text-sm text-slate-500">No treatment phases yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
