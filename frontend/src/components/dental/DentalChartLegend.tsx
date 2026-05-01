import { CONDITION_META, CONDITION_ORDER } from "./conditions";

export function DentalChartLegend(): JSX.Element {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      {CONDITION_ORDER.map((c) => {
        const m = CONDITION_META[c];
        return (
          <span
            key={c}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm"
          >
            <span
              className="inline-block h-3 w-3 rounded-sm border"
              style={{
                backgroundColor: m.fill,
                borderColor: m.stroke ?? "#cbd5e1",
                borderStyle: m.strokePattern === "dashed" ? "dashed" : "solid",
              }}
              aria-hidden
            />
            <span className="text-slate-700">{m.label}</span>
          </span>
        );
      })}
    </div>
  );
}
