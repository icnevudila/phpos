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

import { getAuthProfile } from "../../hooks/authTokens";
import { createStaffUser, fetchStaffUsers, patchStaffUser, type StaffUserDto } from "../../services/staffUsers";
import type { UserRole } from "../../types/user";

const ROLES: UserRole[] = ["ADMIN", "DENTIST", "RECEPTIONIST"];

const ROLE_I18N: Record<UserRole, string> = {
  ADMIN: "pages.settings.roleAdmin",
  DENTIST: "pages.settings.roleDentist",
  RECEPTIONIST: "pages.settings.roleReceptionist",
};

const fieldClass =
  "h-14 w-full rounded-2xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white";

const selectSm =
  "h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:border-indigo-500 focus:outline-none transition-all dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300";

export function StaffTeamPanel(): JSX.Element {
  const { t } = useTranslation();
  const profile = getAuthProfile();
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
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
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
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed"));
    }
  }

  async function changeRole(u: StaffUserDto, role: UserRole): Promise<void> {
    try {
      await patchStaffUser(u.id, { role });
      toast.success(t("pages.settings.toastRoleUpdated"));
      await queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("pages.settings.toastUpdateFailed"));
    }
  }

  return (
    <section className="space-y-10">
      {/* Search & Action Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
         <div className="relative flex-1 group max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              placeholder={t("pages.settings.searchStaffPlaceholder")}
              className="h-16 w-full rounded-[2rem] bg-white dark:bg-slate-900 pl-16 pr-8 text-sm font-bold outline-none ring-1 ring-slate-100 dark:ring-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-6 h-16 rounded-[2rem] bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
               <div className={`h-2 w-2 rounded-full ${isFetching ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                 {isFetching ? t("pages.settings.staffSyncing") : t("pages.settings.staffEncrypted")}
               </span>
            </div>
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className={`flex h-16 items-center gap-3 px-10 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                createOpen 
                  ? "bg-rose-500 text-white shadow-rose-500/20" 
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl"
              } hover:scale-105 active:scale-95`}
            >
              {createOpen ? <UserMinus size={18} /> : <UserPlus size={18} />}
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
            <div className="rounded-[3rem] bg-indigo-50/30 dark:bg-indigo-950/10 p-10 border border-indigo-100 dark:border-indigo-900/30">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                     <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t("pages.settings.onboardingPortal")}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("pages.settings.onboardingSubtitle")}</p>
                  </div>
               </div>

               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelFirstName")}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEnterFirst")}
                       value={createForm.firstName}
                       onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelLastName")}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEnterLast")}
                       value={createForm.lastName}
                       onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelEmailIdentity")}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderEmailClinic")}
                       value={createForm.email}
                       onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelSecurityKey")}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderMinPassword")}
                       type="password"
                       value={createForm.password}
                       onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.phone")}</label>
                     <input
                       className={fieldClass}
                       placeholder={t("pages.settings.placeholderPhonePh")}
                       value={createForm.phone}
                       onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t("pages.settings.labelAccessRole")}</label>
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
                    className="h-16 px-12 rounded-[1.5rem] bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-40"
                  >
                    {createBusy ? t("pages.settings.initializing") : t("pages.settings.activateAccount")}
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staff Workspace */}
      <div className="rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.colName")}</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.colEmail")}</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.colRole")}</th>
                <th className="px-8 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t("pages.settings.colStatus")}</th>
                <th className="px-10 py-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              <AnimatePresence mode="popLayout">
                {staffLoading ? (
                  <tr><td colSpan={5} className="py-40 text-center"><RefreshCw className="animate-spin mx-auto text-slate-200" size={40} /></td></tr>
                ) : filteredStaff.map((u, idx) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                         <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                           u.isActive ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40" : "bg-slate-100 text-slate-400"
                         }`}>
                           {u.firstName.slice(0, 1)}{u.lastName.slice(0, 1)}
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none">{u.firstName} {u.lastName}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                               <Shield size={10} className="text-indigo-400" />
                               {t("pages.settings.roleAccess", { role: t(ROLE_I18N[u.role as UserRole] ?? u.role) })}
                            </p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                          <Mail size={14} className="opacity-40" />
                          {u.email}
                       </div>
                    </td>
                    <td className="px-8 py-8">
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
                    <td className="px-8 py-8">
                       <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${
                         u.isActive 
                           ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30" 
                           : "bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                       }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                          {u.isActive ? t("pages.settings.active") : t("pages.settings.inactive")}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center justify-end gap-3">
                          <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <button
                               onClick={() => void toggleActive(u)}
                               className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                 u.isActive 
                                   ? "bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white" 
                                   : "bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                               }`}
                             >
                               {u.isActive ? t("pages.settings.deactivate") : t("pages.settings.activate")}
                             </button>
                          </div>
                          <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm">
                             <MoreVertical size={18} />
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

