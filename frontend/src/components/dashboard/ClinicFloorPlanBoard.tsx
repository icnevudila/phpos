import { useMemo, useState, type DragEvent } from 'react';

export type ClinicFloorPlanZoneId = 'waiting-room' | 'unit-1' | 'unit-2' | 'xray-room';

export interface ClinicFloorPlanBoardPatient {
  id: string;
  name: string;
  status?: string | null;
  chair?: string | null;
  note?: string | null;
  currentZoneId?: ClinicFloorPlanZoneId | null;
}

export interface ClinicFloorPlanBoardProps {
  dashboard: unknown;
  onPatientDrop: (appointmentId: string, zoneId: ClinicFloorPlanZoneId) => void | Promise<void>;
  className?: string;
}

export interface ClinicFloorPlanZoneAction {
  status: string;
  chair: string | null;
}

export const CLINIC_FLOOR_PLAN_ZONE_ACTIONS: Record<ClinicFloorPlanZoneId, ClinicFloorPlanZoneAction> = {
  'waiting-room': {
    status: 'queued',
    chair: null,
  },
  'unit-1': {
    status: 'in_clinic',
    chair: 'Unit 1',
  },
  'unit-2': {
    status: 'in_clinic',
    chair: 'Unit 2',
  },
  'xray-room': {
    status: 'xray',
    chair: 'X-Ray',
  },
};

interface FloorPlanZoneViewModel {
  id: ClinicFloorPlanZoneId;
  label: string;
  description: string;
  accentClassName: string;
}

const FLOOR_PLAN_ZONES: FloorPlanZoneViewModel[] = [
  {
    id: 'waiting-room',
    label: 'Waiting room',
    description: 'Queued patients waiting for an available chair.',
    accentClassName: 'from-amber-400/20 to-amber-100/20 border-amber-200/70 text-amber-900',
  },
  {
    id: 'unit-1',
    label: 'Unit 1',
    description: 'Primary operatory chair for active treatment.',
    accentClassName: 'from-sky-400/20 to-sky-100/20 border-sky-200/70 text-sky-900',
  },
  {
    id: 'unit-2',
    label: 'Unit 2',
    description: 'Secondary operatory chair for active treatment.',
    accentClassName: 'from-emerald-400/20 to-emerald-100/20 border-emerald-200/70 text-emerald-900',
  },
  {
    id: 'xray-room',
    label: 'X-ray room',
    description: 'Imaging room for scans and diagnostics.',
    accentClassName: 'from-violet-400/20 to-violet-100/20 border-violet-200/70 text-violet-900',
  },
];

const STATUS_TO_ZONE: Array<[RegExp, ClinicFloorPlanZoneId]> = [
  [/x[\s-]?ray/i, 'xray-room'],
  [/unit[\s-]?2|chair[\s-]?2|operatory[\s-]?2/i, 'unit-2'],
  [/unit[\s-]?1|chair[\s-]?1|operatory[\s-]?1/i, 'unit-1'],
  [/wait|queue|queued|line/i, 'waiting-room'],
  [/clinic|chair|treat/i, 'unit-1'],
];

const safeString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readNestedRecord = (value: unknown): Record<string, unknown> | undefined =>
  isRecord(value) ? value : undefined;

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const text = safeString(value);
    if (text) {
      return text;
    }
  }

  return undefined;
};

const inferCurrentZoneId = (status?: string | null, chair?: string | null): ClinicFloorPlanZoneId => {
  const combined = `${status ?? ''} ${chair ?? ''}`.trim();
  for (const [pattern, zoneId] of STATUS_TO_ZONE) {
    if (pattern.test(combined)) {
      return zoneId;
    }
  }

  return 'waiting-room';
};

const getDashboardArrayCandidate = (dashboard: unknown): Record<string, unknown>[] => {
  if (!isRecord(dashboard)) {
    return [];
  }

  const candidateKeys = ['queue', 'queueRows', 'appointments', 'activePatients', 'patients', 'inClinicPatients'];

  for (const key of candidateKeys) {
    const candidate = dashboard[key];
    if (Array.isArray(candidate)) {
      return candidate.filter(isRecord);
    }
  }

  return [];
};

const normalizeDashboardPatients = (dashboard: unknown): ClinicFloorPlanBoardPatient[] => {
  return getDashboardArrayCandidate(dashboard).map((row, index) => {
    const patientRecord = readNestedRecord(row.patient) ?? readNestedRecord(row.patientInfo) ?? readNestedRecord(row.patientDetails);
    const sourceRecord = patientRecord ?? row;

    const id = pickString(
      row.id,
      row._id,
      row.appointmentId,
      row.visitId,
      row.queueId,
      row.patientId,
      sourceRecord.id,
      sourceRecord._id,
    ) ?? `floor-plan-patient-${index}`;

    const firstName = pickString(
      sourceRecord.firstName,
      sourceRecord.givenName,
      sourceRecord.nameFirst,
      sourceRecord.preferredName,
    );

    const lastName = pickString(
      sourceRecord.lastName,
      sourceRecord.familyName,
      sourceRecord.nameLast,
      sourceRecord.surname,
    );

    const fullName = pickString(
      sourceRecord.fullName,
      sourceRecord.name,
      row.patientName,
      row.fullName,
      row.name,
    );

      const name = (fullName ?? [firstName, lastName].filter(Boolean).join(' ').trim()) || `Patient ${index + 1}`;

    const status = pickString(
      row.status,
      row.queueStatus,
      row.appointmentStatus,
      row.state,
      row.currentStatus,
      sourceRecord.status,
    ) ?? null;

    const chair = pickString(
      row.chair,
      row.chairName,
      row.chairLabel,
      row.unit,
      row.room,
      row.location,
      sourceRecord.chair,
      sourceRecord.chairName,
      sourceRecord.chairLabel,
    ) ?? null;

    const note = pickString(
      row.note,
      row.reason,
      row.reasonForVisit,
      row.time,
      row.scheduledAt,
      row.appointmentTime,
      row.slot,
    ) ?? null;

    const currentZoneId = inferCurrentZoneId(
      status,
      chair ?? pickString(row.zone, row.zoneName, sourceRecord.zone, sourceRecord.zoneName) ?? null,
    );

    return {
      id,
      name,
      status,
      chair,
      note,
      currentZoneId,
    };
  });
};

const getZoneMeta = (zoneId: ClinicFloorPlanZoneId): FloorPlanZoneViewModel =>
  FLOOR_PLAN_ZONES.find((zone) => zone.id === zoneId) ?? FLOOR_PLAN_ZONES[0];

export default function ClinicFloorPlanBoard({
  dashboard,
  onPatientDrop,
  className,
}: ClinicFloorPlanBoardProps) {
  const [draggedPatientId, setDraggedPatientId] = useState<string | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<ClinicFloorPlanZoneId | null>(null);

  const patients = useMemo(() => normalizeDashboardPatients(dashboard), [dashboard]);

  const onDragStart = (patientId: string) => {
    return (event: DragEvent<HTMLButtonElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', patientId);
      setDraggedPatientId(patientId);
    };
  };

  const onDragEnd = () => {
    setDraggedPatientId(null);
    setActiveZoneId(null);
  };

  const onZoneDrop = (zoneId: ClinicFloorPlanZoneId) => {
    return async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const patientId = event.dataTransfer.getData('text/plain') || draggedPatientId;

      setDraggedPatientId(null);
      setActiveZoneId(null);

      if (!patientId) {
        return;
      }

      await onPatientDrop(patientId, zoneId);
    };
  };

  const patientCountByZone = useMemo(() => {
    return patients.reduce<Record<ClinicFloorPlanZoneId, number>>(
      (accumulator, patient) => {
        const zoneId = patient.currentZoneId ?? 'waiting-room';
        accumulator[zoneId] += 1;
        return accumulator;
      },
      {
        'waiting-room': 0,
        'unit-1': 0,
        'unit-2': 0,
        'xray-room': 0,
      },
    );
  }, [patients]);

  return (
    <section className={['rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur', className]
      .filter(Boolean)
      .join(' ')}
    >
      <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Clinic floor plan</p>
          <h3 className="text-lg font-semibold text-slate-900">Drag patients into a room or chair</h3>
          <p className="mt-1 text-sm text-slate-500">
            Drop a chip onto a zone to update the patient's appointment status and chair assignment.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Queued</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">In clinic</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">X-ray</span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.15),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.08),transparent_24%),linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:100%_100%,100%_100%,48px_48px,48px_48px]" />
          <div className="relative grid min-h-[28rem] gap-3 sm:grid-cols-2 sm:grid-rows-2">
            {FLOOR_PLAN_ZONES.map((zone) => {
              const zonePatients = patients.filter((patient) => (patient.currentZoneId ?? 'waiting-room') === zone.id);
              const isActive = activeZoneId === zone.id;
              const zoneMeta = getZoneMeta(zone.id);

              return (
                <div
                  key={zone.id}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setActiveZoneId(zone.id);
                  }}
                  onDragLeave={() => {
                    setActiveZoneId((currentZoneId) => (currentZoneId === zone.id ? null : currentZoneId));
                  }}
                  onDrop={onZoneDrop(zone.id)}
                  className={[
                    'group relative flex min-h-[13rem] flex-col overflow-hidden rounded-2xl border bg-white/90 p-3 shadow-sm transition',
                    zoneMeta.accentClassName,
                    isActive ? 'scale-[1.01] border-dashed ring-2 ring-sky-300/60' : 'hover:-translate-y-0.5 hover:shadow-md',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{zoneMeta.label}</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{zoneMeta.description}</p>
                    </div>

                    <div className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm ring-1 ring-slate-200">
                      {patientCountByZone[zone.id]} {patientCountByZone[zone.id] === 1 ? 'patient' : 'patients'}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {zonePatients.length > 0 ? (
                      zonePatients.map((patient) => (
                        <span
                          key={patient.id}
                          className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                        >
                          <span className="h-2 w-2 rounded-full bg-sky-500" />
                          <span className="truncate">{patient.name}</span>
                        </span>
                      ))
                    ) : (
                      <div className="max-w-[16rem] rounded-2xl border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-xs leading-5 text-slate-400">
                        Drop a chip here to move the patient into this zone.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Active chips</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Drag any queued or in-clinic patient chip into a floor-plan zone.
              </p>
            </div>
            <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
              {patients.length}
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {patients.length > 0 ? (
              patients.map((patient) => {
                const zoneMeta = getZoneMeta(patient.currentZoneId ?? 'waiting-room');

                return (
                  <button
                    key={patient.id}
                    type="button"
                    draggable
                    onDragStart={onDragStart(patient.id)}
                    onDragEnd={onDragEnd}
                    className={[
                      'flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition',
                      'cursor-grab active:cursor-grabbing hover:-translate-y-px hover:shadow-md',
                      draggedPatientId === patient.id ? 'opacity-60 ring-2 ring-sky-300' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{patient.name}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {zoneMeta.label}
                        {patient.status ? ` • ${patient.status}` : ''}
                        {patient.chair ? ` • ${patient.chair}` : ''}
                        {patient.note ? ` • ${patient.note}` : ''}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-sm text-slate-500">
                No active patients are available for the floor plan.
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}