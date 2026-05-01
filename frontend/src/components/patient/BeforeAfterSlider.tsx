import { useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

export type ComparisonType = 'orthodontic' | 'whitening' | 'implant' | 'filling' | 'veneer' | 'other';

export interface BeforeAfterPair {
  id: string;
  type: ComparisonType;
  title: string;
  beforeUrl: string;
  afterUrl: string;
  beforeDate: string;
  afterDate: string;
  notes?: string;
  dentist?: string;
}

export interface BeforeAfterSliderProps {
  pairs: BeforeAfterPair[];
  className?: string;
}

const TYPE_LABELS: Record<ComparisonType, string> = {
  orthodontic: 'Orthodontic',
  whitening: 'Whitening',
  implant: 'Implant',
  filling: 'Filling',
  veneer: 'Veneer',
  other: 'Other',
};

const TYPE_COLORS: Record<ComparisonType, string> = {
  orthodontic: 'bg-sky-100 text-sky-700 border-sky-200',
  whitening: 'bg-amber-100 text-amber-700 border-amber-200',
  implant: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  filling: 'bg-violet-100 text-violet-700 border-violet-200',
  veneer: 'bg-rose-100 text-rose-700 border-rose-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function BeforeAfterSlider({ pairs, className = '' }: BeforeAfterSliderProps): JSX.Element {
  const [selected, setSelected] = useState<string>(pairs[0]?.id || '');
  const [vertical, setVertical] = useState(false);

  const active = pairs.find((p) => p.id === selected);

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Before & After Gallery</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setVertical(false)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${!vertical ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>Horizontal</button>
          <button onClick={() => setVertical(true)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${vertical ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>Vertical</button>
        </div>
      </div>

      {active && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="relative" style={{ height: 400 }}>
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={active.beforeUrl} alt="Before" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
              itemTwo={<ReactCompareSliderImage src={active.afterUrl} alt="After" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
              portrait={vertical}
              style={{ height: '100%' }}
            />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-bold">BEFORE</div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold">AFTER</div>
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-slate-900">{active.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${TYPE_COLORS[active.type]}`}>{TYPE_LABELS[active.type]}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Before: {active.beforeDate}</span>
              <span>After: {active.afterDate}</span>
              {active.dentist && <span>Dr. {active.dentist}</span>}
            </div>
            {active.notes && <p className="text-[11px] text-slate-500 mt-1">{active.notes}</p>}
          </div>
        </div>
      )}

      {pairs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pairs.map((p) => (
            <button key={p.id} onClick={() => setSelected(p.id)} className={`flex-shrink-0 w-24 rounded-xl border overflow-hidden transition ${selected === p.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="h-16 bg-slate-100 relative">
                <img src={p.afterUrl} alt={p.title} className="w-full h-full object-cover" />
                <span className={`absolute bottom-1 left-1 px-1 py-0.5 rounded text-[8px] font-medium border ${TYPE_COLORS[p.type]}`}>{TYPE_LABELS[p.type]}</span>
              </div>
              <p className="text-[9px] text-slate-600 p-1.5 truncate">{p.title}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

