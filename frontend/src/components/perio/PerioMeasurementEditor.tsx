import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PERIO_SITE_CODES, type PerioSiteCode, type PerioToothDto } from "../../services/perio";

interface PerioMeasurementEditorProps {
  teeth: PerioToothDto[];
  selectedTooth: number | null;
  onChange: (teeth: PerioToothDto[]) => void;
  onSelectTooth: (n: number | null) => void;
}

function updateTooth(
  teeth: PerioToothDto[],
  toothNumber: number,
  updater: (t: PerioToothDto) => PerioToothDto,
): PerioToothDto[] {
  const idx = teeth.findIndex((t) => t.toothNumber === toothNumber);
  if (idx < 0) {
    return [
      ...teeth,
      updater({
        toothNumber,
        mobility: null,
        furcation: null,
        missing: false,
        sites: PERIO_SITE_CODES.map((code) => ({
          siteCode: code,
          pocketDepth: 0,
          recession: 0,
          bleeding: false,
          suppuration: false,
          plaque: false,
        })),
      }),
    ];
  }
  return teeth.map((t, i) => (i === idx ? updater(t) : t));
}

export function PerioMeasurementEditor({
  teeth,
  selectedTooth,
  onChange,
  onSelectTooth,
}: PerioMeasurementEditorProps): JSX.Element {
  const { t } = useTranslation();
  const toothBtnRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const tooth = selectedTooth != null ? teeth.find((x) => x.toothNumber === selectedTooth) : null;

  useEffect(() => {
    if (selectedTooth == null) return;
    toothBtnRefs.current.get(selectedTooth)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedTooth]);

  function patchSite(siteCode: PerioSiteCode, patch: Partial<PerioToothDto["sites"][0]>): void {
    if (selectedTooth == null) return;
    onChange(
      updateTooth(teeth, selectedTooth, (t) => ({
        ...t,
        sites: PERIO_SITE_CODES.map((code) => {
          const existing = t.sites.find((s) => s.siteCode === code) ?? {
            siteCode: code,
            pocketDepth: 0,
            recession: 0,
            bleeding: false,
            suppuration: false,
            plaque: false,
          };
          return code === siteCode ? { ...existing, ...patch } : existing;
        }),
      })),
    );
  }

  function patchTooth(patch: Partial<PerioToothDto>): void {
    if (selectedTooth == null) return;
    onChange(updateTooth(teeth, selectedTooth, (t) => ({ ...t, ...patch })));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
          {t("pages.patientDetail.perio.selectToothHint", { defaultValue: "Select Tooth Hint" })}
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 32 }, (_, i) => i + 1).map((n) => {
            const recorded = teeth.some((x) => x.toothNumber === n);
            const active = selectedTooth === n;
            return (
              <button
                key={n}
                ref={(el) => {
                  if (el) toothBtnRefs.current.set(n, el);
                  else toothBtnRefs.current.delete(n);
                }}
                type="button"
                data-testid={`perio-tooth-btn-${n}`}
                aria-pressed={active}
                onClick={() => onSelectTooth(active ? null : n)}
                className={`h-9 w-9 rounded-lg text-xs font-black transition ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${ active ? "bg-teal-600 text-white ring-2 ring-sky-400 ring-offset-2" : recorded ? "bg-teal-100 text-teal-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200" }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {!tooth ? (
          <p className="text-sm text-slate-500">{t("pages.patientDetail.perio.pickTooth", { defaultValue: "Pick Tooth" })}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="text-xs font-bold text-slate-600">
                {t("pages.patientDetail.perio.mobility", { defaultValue: "Mobility" })}
                <input
                  type="number"
                  min={0}
                  max={3}
                  className="mt-1 block w-16 rounded border px-2 py-1"
                  value={tooth.mobility ?? ""}
                  onChange={(e) =>
                    patchTooth({ mobility: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </label>
              <label className="text-xs font-bold text-slate-600">
                {t("pages.patientDetail.perio.furcation", { defaultValue: "Furcation" })}
                <input
                  type="number"
                  min={0}
                  max={3}
                  className="mt-1 block w-16 rounded border px-2 py-1"
                  value={tooth.furcation ?? ""}
                  onChange={(e) =>
                    patchTooth({ furcation: e.target.value === "" ? null : Number(e.target.value) })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <input
                  type="checkbox"
                  checked={tooth.missing}
                  onChange={(e) => patchTooth({ missing: e.target.checked })}
                />
                {t("pages.patientDetail.perio.missing", { defaultValue: "Missing" })}
              </label>
            </div>

            {!tooth.missing ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-500">
                      <th className="py-2 pr-2">{t("pages.patientDetail.perio.site", { defaultValue: "Site" })}</th>
                      <th className="py-2 pr-2">{t("pages.patientDetail.perio.colPd", { defaultValue: "Col Pd" })}</th>
                      <th className="py-2 pr-2">{t("pages.patientDetail.perio.colRec", { defaultValue: "Col Rec" })}</th>
                      <th className="py-2 pr-2">{t("pages.patientDetail.perio.colBop", { defaultValue: "Col Bop" })}</th>
                      <th className="py-2 pr-2">{t("pages.patientDetail.perio.colSup", { defaultValue: "Col Sup" })}</th>
                      <th className="py-2">{t("pages.patientDetail.perio.colPlq", { defaultValue: "Col Plq" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERIO_SITE_CODES.map((code) => {
                      const site = tooth.sites.find((s) => s.siteCode === code) ?? {
                        siteCode: code,
                        pocketDepth: 0,
                        recession: 0,
                        bleeding: false,
                        suppuration: false,
                        plaque: false,
                      };
                      return (
                        <tr key={code} className="border-b border-slate-100">
                          <td className="py-2 font-bold">{code}</td>
                          <td className="py-2">
                            <input
                              type="number"
                              min={0}
                              max={15}
                              className="w-14 rounded border px-1 py-0.5"
                              value={site.pocketDepth}
                              onChange={(e) =>
                                patchSite(code, { pocketDepth: Number(e.target.value) || 0 })
                              }
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              min={0}
                              max={15}
                              className="w-14 rounded border px-1 py-0.5"
                              value={site.recession}
                              onChange={(e) =>
                                patchSite(code, { recession: Number(e.target.value) || 0 })
                              }
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={site.bleeding}
                              onChange={(e) => patchSite(code, { bleeding: e.target.checked })}
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={site.suppuration}
                              onChange={(e) => patchSite(code, { suppuration: e.target.checked })}
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              checked={site.plaque}
                              onChange={(e) => patchSite(code, { plaque: e.target.checked })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
