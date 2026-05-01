import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { getAuthProfile } from "../../hooks/authTokens";
import { createStaffUser, fetchStaffUsers, patchStaffUser, type StaffUserDto } from "../../services/staffUsers";
import type { UserRole } from "../../types/user";

const ROLES: UserRole[] = ["ADMIN", "DENTIST", "RECEPTIONIST"];

const fieldClass =
  "min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

const selectSm =
  "min-h-9 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus-visible:ring-offset-slate-950";

/**
 * Klinik personel hesapları — `/settings` (Team sekmesi) ve `/staff` sayfasında ortak.
 */
export function StaffTeamPanel(): JSX.Element {
  const { t } = useTranslation();
  const profile = getAuthProfile();

  const [staff, setStaff] = useState<StaffUserDto[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "RECEPTIONIST" as UserRole,
  });

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const rows = await fetchStaffUsers();
      setStaff(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastLoadTeamFailed"));
    } finally {
      setStaffLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  async function submitCreate(): Promise<void> {
    setCreateBusy(true);
    try {
      await createStaffUser({
        email: createForm.email.trim(),
        password: createForm.password,
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        phone: createForm.phone.trim() || null,
        role: createForm.role,
      });
      toast.success(t("pages.settings.toastMemberCreated"));
      setCreateOpen(false);
      setCreateForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "RECEPTIONIST",
      });
      await loadStaff();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastCreateFailed"));
    } finally {
      setCreateBusy(false);
    }
  }

  async function toggleActive(u: StaffUserDto): Promise<void> {
    if (u.id === profile?.id && u.isActive) {
      toast.error(t("pages.settings.toastSelfDeactivate"));
      return;
    }
    try {
      await patchStaffUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? t("pages.settings.toastUserDeactivated") : t("pages.settings.toastUserReactivated"));
      await loadStaff();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed"));
    }
  }

  async function changeRole(u: StaffUserDto, role: UserRole): Promise<void> {
    try {
      await patchStaffUser(u.id, { role });
      toast.success(t("pages.settings.toastRoleUpdated"));
      await loadStaff();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed"));
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {t("pages.settings.teamTitle")}
        </h2>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="min-h-9 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950"
        >
          {createOpen ? t("pages.settings.closeForm") : t("pages.settings.addUser")}
        </button>
      </div>

      {createOpen ? (
        <div className="mt-4 grid min-w-0 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-950/50 sm:grid-cols-2">
          <input
            className={fieldClass}
            placeholder={t("pages.settings.placeholderEmail")}
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder={t("pages.settings.placeholderPassword")}
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder={t("pages.settings.placeholderFirst")}
            value={createForm.firstName}
            onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder={t("pages.settings.placeholderLast")}
            value={createForm.lastName}
            onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
          />
          <input
            className={fieldClass}
            placeholder={t("pages.settings.placeholderPhone")}
            value={createForm.phone}
            onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <select
            className={fieldClass}
            value={createForm.role}
            onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as UserRole }))}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2">
            <button
              type="button"
              disabled={
                createBusy ||
                !createForm.email ||
                createForm.password.length < 8 ||
                !createForm.firstName ||
                !createForm.lastName
              }
              onClick={() => void submitCreate()}
              className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
            >
              {createBusy ? t("pages.settings.creating") : t("pages.settings.createAccount")}
            </button>
          </div>
        </div>
      ) : null}

      {staffLoading ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{t("pages.settings.loading")}</p>
      ) : (
        <div className="mt-4 min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-600 dark:text-slate-400">
                <th className="py-2 pr-2">{t("pages.settings.colName")}</th>
                <th className="py-2 pr-2">{t("pages.settings.colEmail")}</th>
                <th className="py-2 pr-2">{t("pages.settings.colRole")}</th>
                <th className="py-2 pr-2">{t("pages.settings.colStatus")}</th>
                <th className="py-2 pr-2">{t("pages.settings.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="py-2 pr-2 font-medium text-slate-900 dark:text-slate-100">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-2 pr-2 text-slate-700 dark:text-slate-300">{u.email}</td>
                  <td className="py-2 pr-2">
                    <select
                      className={selectSm}
                      value={u.role}
                      onChange={(e) => void changeRole(u, e.target.value as UserRole)}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-2">
                    <span
                      className={
                        u.isActive ? "font-semibold text-emerald-700 dark:text-emerald-400" : "font-semibold text-slate-500"
                      }
                    >
                      {u.isActive ? t("pages.settings.active") : t("pages.settings.inactive")}
                    </span>
                  </td>
                  <td className="py-2 pr-2">
                    <button
                      type="button"
                      className="min-h-9 text-xs font-bold text-teal-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-950"
                      onClick={() => void toggleActive(u)}
                    >
                      {u.isActive ? t("pages.settings.deactivate") : t("pages.settings.activate")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
