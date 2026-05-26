import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical, 
  UserMinus,
  RefreshCw,
  Search
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { createStaffUser, fetchStaffUsers, patchStaffUser, type StaffUserDto } from "../../services/staffUsers";
import type { UserRole } from "../../types/user";

const ROLES: UserRole[] = ["ADMIN", "DENTIST", "RECEPTIONIST"];

const ROLE_I18N: Record<UserRole, string> = {
  ADMIN: "pages.settings.roleAdmin",
  DENTIST: "pages.settings.roleDentist",
  RECEPTIONIST: "pages.settings.roleReceptionist",
};

const fieldClass =
  "h-10 w-full rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow";

const selectSm =
  "h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-shadow";

export function StaffTeamPanel(): JSX.Element {
  const { t } = useTranslation();
  const { user } = useAuth();
  const profile = user;
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [qInput, setQInput] = useState("");
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "RECEPTIONIST" as UserRole,
  });

  const { data: staff = [], isLoading: staffLoading, isFetching } = useQuery({
    queryKey: ["staffUsers"],
    queryFn: fetchStaffUsers,
  });

  const filteredStaff = staff.filter(u => 
    [u.firstName, u.lastName, u.email].join(" ").toLowerCase().includes(qInput.toLowerCase())
  );

  async function submitCreate(): Promise<void> {
    if (!createForm.email.trim() || !createForm.password || !createForm.firstName.trim() || !createForm.lastName.trim()) {
      toast.error(t("pages.settings.errors.fillRequired", { defaultValue: "Please fill all required fields." }));
      return;
    }

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
      toast.success(t("pages.settings.toastMemberCreated", { defaultValue: "Toast Member Created" }));
      setCreateOpen(false);
      setCreateForm({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "RECEPTIONIST",
      });
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastCreateFailed", { defaultValue: "Toast Create Failed" }));
    } finally {
      setCreateBusy(false);
    }
  }

  async function toggleActive(u: StaffUserDto): Promise<void> {
    if (u.id === profile?.id && u.isActive) {
      toast.error(t("pages.settings.toastSelfDeactivate", { defaultValue: "Toast Self Deactivate" }));
      return;
    }
    try {
      await patchStaffUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? t("pages.settings.toastUserDeactivated", { defaultValue: "Toast User Deactivated" }) : t("pages.settings.toastUserReactivated", { defaultValue: "Toast User Reactivated" }));
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed", { defaultValue: "Toast Update Failed" }));
    }
  }

  async function changeRole(u: StaffUserDto, role: UserRole): Promise<void> {
    try {
      await patchStaffUser(u.id, { role });
      toast.success(t("pages.settings.toastRoleUpdated", { defaultValue: "Toast Role Updated" }));
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed", { defaultValue: "Toast Update Failed" }));
    }
  }

  return (
    <section className="space-y-10">
      {/* Search & Action Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
         <div className="relative flex-1 group max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={16} />
            <input 
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.settings.searchStaffPlaceholder", { defaultValue: "Search Staff Placeholder" })}
              className="h-10 w-full rounded-[var(--radius-md)] border border-brand-border bg-brand-surface pl-10 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-brand-primary transition-shadow"
            />
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 h-10 rounded-[var(--radius-md)] border border-brand-border bg-brand-surface">
               <div className={`h-2 w-2 rounded-full ${isFetching ? 'bg-brand-primary animate-pulse' : 'bg-slate-200'}`} />
               <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                 {isFetching ? t("pages.settings.staffSyncing", { defaultValue: "Staff Syncing" }) : t("pages.settings.staffEncrypted", { defaultValue: "Staff Encrypted" })}
               </span>
            </div>
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className={`btn-primary flex items-center gap-2 ${createOpen ? "bg-brand-danger border-brand-danger" : ""}`}
            >
              {createOpen ? <UserMinus size={16} /> : <UserPlus size={16} />}
              {createOpen ? "Close Form" : "Recruit Member"}
            </button>
         </div>
      </div>

      <AnimatePresence>
        {createOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card">
               <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-brand-primary-soft text-brand-primary">
                     <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-text">{t("pages.settings.onboardingPortal", { defaultValue: "Onboarding Portal" })}</h3>
                    <p className="text-xs font-semibold text-brand-muted uppercase tracking-widest">{t("pages.settings.onboardingSubtitle", { defaultValue: "Onboarding Subtitle" })}</p>
                  </div>
               </div>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelFirstName", { defaultValue: "Label First Name" })}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEnterFirst", { defaultValue: "Placeholder Enter First" })}
                       value={createForm.firstName}
                       onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelLastName", { defaultValue: "Label Last Name" })}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEnterLast", { defaultValue: "Placeholder Enter Last" })}
                       value={createForm.lastName}
                       onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelEmailIdentity", { defaultValue: "Label Email Identity" })}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEmailClinic", { defaultValue: "Placeholder Email Clinic" })}
                       value={createForm.email}
                       onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelSecurityKey", { defaultValue: "Label Security Key" })}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderMinPassword", { defaultValue: "Placeholder Min Password" })}
                       type="password"
                       value={createForm.password}
                       onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.phone", { defaultValue: "Phone" })}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderPhonePh", { defaultValue: "Placeholder Phone Ph" })}
                       value={createForm.phone}
                       onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelAccessRole", { defaultValue: "Label Access Role" })}</label>
                     <select
                       className={fieldClass}
                       value={createForm.role}
                       onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                     >
                       {ROLES.map((r) => (
                         <option key={r} value={r}>{t(ROLE_I18N[r])}</option>
                       ))}
                     </select>
                  </div>
               </div>

               <div className="mt-10 flex justify-end">
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
                    className="btn-primary disabled:opacity-40"
                  >
                    {createBusy ? t("pages.settings.initializing", { defaultValue: "Initializing" }) : t("pages.settings.activateAccount", { defaultValue: "Activate Account" })}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Workspace */}
      <div className="card p-0 overflow-hidden">
        <div className="data-table-wrapper">
          <table className="data-table min-w-[1000px]">
            <thead>
              <tr>
                <th>{t("pages.settings.colName", { defaultValue: "Col Name" })}</th>
                <th>{t("pages.settings.colEmail", { defaultValue: "Col Email" })}</th>
                <th>{t("pages.settings.colRole", { defaultValue: "Col Role" })}</th>
                <th>{t("pages.settings.colStatus", { defaultValue: "Col Status" })}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {staffLoading ? (
                  <tr><td colSpan={5} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                ) : filteredStaff.map((u, idx) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-indigo-50/30 transition-colors"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                         <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-xs font-semibold transition-all ${ u.isActive ? "bg-brand-primary-soft text-brand-primary" : "bg-brand-surface-muted text-brand-muted" }`}>
                           {u.firstName.slice(0, 1)}{u.lastName.slice(0, 1)}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-brand-text leading-none">{u.firstName} {u.lastName}</p>
                            <p className="text-[10px] font-medium text-brand-muted mt-1 flex items-center gap-1.5">
                               <Shield size={10} className="text-brand-primary" />
                               {t("pages.settings.roleAccess", { role: t(ROLE_I18N[u.role as UserRole] ?? u.role) })}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td>
                       <div className="flex items-center gap-2 text-sm font-medium text-brand-text-soft">
                          <Mail size={13} className="opacity-40" />
                          {u.email}
                       </div>
                    </td>
                    <td>
                      <select
                        className={selectSm}
                        value={u.role}
                        onChange={(e) => void changeRole(u, e.target.value as UserRole)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{t(ROLE_I18N[r])}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                       <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border text-[10px] font-semibold uppercase tracking-wider ${ u.isActive ? "bg-brand-success-soft text-brand-success border-brand-success-soft" : "bg-brand-surface-muted text-brand-muted border-brand-border" }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-brand-success animate-pulse" : "bg-slate-300"}`} />
                          {u.isActive ? t("pages.settings.active", { defaultValue: "Active" }) : t("pages.settings.inactive", { defaultValue: "Inactive" })}
                       </div>
                    </td>
                    <td>
                       <div className="flex items-center justify-end gap-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                             <button
                               onClick={() => void toggleActive(u)}
                               className={`h-8 px-3 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-widest transition-colors ${ u.isActive ? "bg-brand-danger-soft text-brand-danger hover:bg-brand-danger hover:text-white" : "bg-brand-success-soft text-brand-success hover:bg-brand-success hover:text-white" }`}
                             >
                               {u.isActive ? t("pages.settings.deactivate", { defaultValue: "Deactivate" }) : t("pages.settings.activate", { defaultValue: "Activate" })}
                             </button>
                          </div>
                          <button className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-brand-surface-muted text-brand-muted hover:bg-brand-primary hover:text-white transition-colors">
                             <MoreVertical size={16} />
                          </button>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

