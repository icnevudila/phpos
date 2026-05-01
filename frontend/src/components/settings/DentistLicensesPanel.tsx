import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAuthProfile } from "../../hooks/authTokens";
import { apiFetch } from "../../services/api";

const settingsField =
  "mt-1 w-full min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:bg-slate-50";

export function DentistLicensesPanel() {
  const profile = getAuthProfile();
  const [draft, setDraft] = useState({ prcNumber: "", ptrNumber: "", s2License: "", tinNumber: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      if (!profile?.id) return;
      try {
        const user = await apiFetch<any>(`/users/${profile.id}`);
        setDraft({
          prcNumber: user.prcNumber || "",
          ptrNumber: user.ptrNumber || "",
          s2License: user.s2License || "",
          tinNumber: user.tinNumber || "",
        });
      } catch (err) {
        toast.error("Failed to load licenses");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [profile?.id]);

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/prescriptions/licenses", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      toast.success("Licenses updated successfully");
    } catch (err) {
      toast.error("Failed to update licenses");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
        My Professional Licenses
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        These license numbers will appear on your generated prescriptions to comply with local regulations.
      </p>

      <div className="max-w-lg space-y-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PRC Number</label>
          <input
            className={settingsField}
            value={draft.prcNumber}
            onChange={(e) => setDraft({ ...draft, prcNumber: e.target.value })}
            placeholder="e.g. 0123456"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PTR Number</label>
          <input
            className={settingsField}
            value={draft.ptrNumber}
            onChange={(e) => setDraft({ ...draft, ptrNumber: e.target.value })}
            placeholder="e.g. 9876543"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">S2 License (Optional)</label>
          <input
            className={settingsField}
            value={draft.s2License}
            onChange={(e) => setDraft({ ...draft, s2License: e.target.value })}
            placeholder="For controlled substances"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TIN Number</label>
          <input
            className={settingsField}
            value={draft.tinNumber}
            onChange={(e) => setDraft({ ...draft, tinNumber: e.target.value })}
            placeholder="e.g. 123-456-789-000"
          />
        </div>
        <button
          disabled={saving}
          onClick={save}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Licenses"}
        </button>
      </div>
    </section>
  );
}
