import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  type HmoProvider,
  createHmoProvider,
  fetchHmoProviders,
  updateHmoProvider,
} from "../../services/hmo";

export function HmoProvidersPanel(): JSX.Element {
  const { t } = useTranslation();
  const [rows, setRows] = useState<HmoProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchHmoProviders();
      setRows(list);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(p: HmoProvider): void {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCode(p.code);
    setEditPhone(p.contactPhone ?? "");
    setEditEmail(p.contactEmail ?? "");
    setEditNotes(p.notes ?? "");
  }

  function cancelEdit(): void {
    setEditingId(null);
  }

  async function saveEdit(id: string): Promise<void> {
    setBusy(true);
    try {
      await updateHmoProvider(id, {
        name: editName.trim(),
        code: editCode.trim(),
        contactPhone: editPhone.trim() || null,
        contactEmail: editEmail.trim() || null,
        notes: editNotes.trim() || null,
      });
      toast.success(t("pages.settings.hmo.saved"));
      cancelEdit();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: HmoProvider): Promise<void> {
    setBusy(true);
    try {
      await updateHmoProvider(p.id, { isActive: !p.isActive });
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.hmo.saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function onCreate(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      toast.error(t("pages.settings.hmo.nameCodeRequired"));
      return;
    }
    setBusy(true);
    try {
      await createHmoProvider({
        name: newName.trim(),
        code: newCode.trim(),
        contactPhone: newPhone.trim() || undefined,
        contactEmail: newEmail.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
      toast.success(t("pages.settings.hmo.created"));
      setNewName("");
      setNewCode("");
      setNewPhone("");
      setNewEmail("");
      setNewNotes("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("pages.settings.hmo.createFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
        {t("pages.settings.hmo.title")}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{t("pages.settings.hmo.subtitle")}</p>

      {loading ? (
        <p className="mt-4 text-sm text-slate-500">{t("pages.settings.loading")}</p>
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">{t("pages.settings.hmo.colName")}</th>
                  <th className="py-2 pr-3">{t("pages.settings.hmo.colCode")}</th>
                  <th className="py-2 pr-3">{t("pages.settings.hmo.colActive")}</th>
                  <th className="py-2">{t("pages.settings.hmo.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    {editingId === p.id ? (
                      <>
                        <td className="py-2 pr-2" colSpan={2}>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                            <input
                              className="rounded border border-slate-300 px-2 py-1 font-mono text-xs uppercase"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                            />
                            <input
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              placeholder={t("pages.settings.phone")}
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                            />
                            <input
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              placeholder={t("pages.settings.hmo.emailPlaceholder")}
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                            <input
                              className="sm:col-span-2 rounded border border-slate-300 px-2 py-1 text-xs"
                              placeholder={t("pages.settings.hmo.notesPlaceholder")}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="py-2 align-top text-xs">{p.isActive ? "✓" : "—"}</td>
                        <td className="py-2 align-top">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void saveEdit(p.id)}
                              className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
                            >
                              {t("common.save")}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={cancelEdit}
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                            >
                              {t("common.cancel")}
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 pr-3 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2 pr-3 font-mono text-xs text-slate-600">{p.code}</td>
                        <td className="py-2 pr-3 text-xs">{p.isActive ? t("pages.settings.active") : "—"}</td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => startEdit(p)}
                              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50"
                            >
                              {t("common.edit")}
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void toggleActive(p)}
                              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50"
                            >
                              {p.isActive ? t("pages.settings.hmo.deactivate") : t("pages.settings.hmo.activate")}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={(ev) => void onCreate(ev)} className="mt-6 space-y-3 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase text-slate-600">{t("pages.settings.hmo.addNew")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder={t("pages.settings.hmo.placeholderName")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                required
                className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase"
                placeholder={t("pages.settings.hmo.placeholderCode")}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder={t("pages.settings.phone")}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder={t("pages.settings.hmo.emailPlaceholder")}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder={t("pages.settings.hmo.notesPlaceholder")}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {t("pages.settings.hmo.create")}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
