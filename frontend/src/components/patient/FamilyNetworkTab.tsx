import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Heart, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import {
  createPatientFamily,
  fetchPatientFamily,
  linkFamilyMember,
  unlinkFamilyMember,
} from "../../services/family";
import api from "../../services/api";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

interface FamilyNetworkTabProps {
  patientId: string;
}

interface PatientSearchRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function FamilyNetworkTab({ patientId }: FamilyNetworkTabProps): JSX.Element {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [linkOpen, setLinkOpen] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search, 300);

  const { data: family, isLoading } = useQuery({
    queryKey: ["patientFamily", patientId],
    queryFn: () => fetchPatientFamily(patientId),
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["patients", "family-link", q],
    enabled: linkOpen && q.trim().length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "8", q: q.trim() });
      const res = await api.get<any, { data: { data: PatientSearchRow[] } }>(`/patients?${params}`);
      return res.data.data.filter((p: PatientSearchRow) => p.id !== patientId);
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["patientFamily", patientId] });

  const createMut = useMutation({
    mutationFn: () => createPatientFamily(patientId, familyName.trim() || undefined),
    onSuccess: async () => {
      await invalidate();
      setFamilyName("");
      toast.success(t("pages.patientDetail.family.created"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("common.error")),
  });

  const linkMut = useMutation({
    mutationFn: (memberId: string) => linkFamilyMember(patientId, memberId),
    onSuccess: async () => {
      await invalidate();
      setLinkOpen(false);
      setSearch("");
      toast.success(t("pages.patientDetail.family.memberLinked"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("common.error")),
  });

  const unlinkMut = useMutation({
    mutationFn: (memberId: string) => unlinkFamilyMember(patientId, memberId),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("pages.patientDetail.family.memberRemoved"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("common.error")),
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm font-bold uppercase tracking-widest text-slate-400">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight">{t("pages.patientDetail.family.title")}</h3>
          <p className="text-sm text-slate-400">{t("pages.patientDetail.family.subtitle")}</p>
          {family ? (
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
              {family.name}
            </p>
          ) : null}
        </div>
        {!family ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("pages.patientDetail.family.householdName")}
              </span>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder={t("pages.patientDetail.family.householdPlaceholder")}
                className="mt-1 h-11 w-56 rounded-xl border border-slate-200 px-3 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={createMut.isPending}
              onClick={() => createMut.mutate()}
              className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500"
            >
              <UserPlus size={16} />
              {t("pages.patientDetail.family.create")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setLinkOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500"
          >
            <UserPlus size={16} />
            {t("pages.patientDetail.family.addMember")}
          </button>
        )}
      </header>

      {family ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {family.patients.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex items-center gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-6"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-500 shadow-sm">
                <Heart size={24} className={member.id === patientId ? "fill-indigo-500" : ""} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {member.id === patientId
                    ? t("pages.patientDetail.family.currentPatient")
                    : t("pages.patientDetail.family.member")}
                </p>
                <Link
                  to={`/patients/${member.id}`}
                  className="truncate text-lg font-black hover:text-indigo-600"
                >
                  {member.firstName} {member.lastName}
                </Link>
                <p className="text-xs text-slate-500">{member.phone}</p>
              </div>
              {member.id !== patientId ? (
                <button
                  type="button"
                  disabled={unlinkMut.isPending}
                  onClick={() => unlinkMut.mutate(member.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100"
                  aria-label={t("pages.patientDetail.family.removeMember")}
                >
                  <Trash2 size={18} />
                </button>
              ) : null}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-300">
            <Users size={40} />
          </div>
          <h4 className="text-lg font-black text-slate-900">
            {t("pages.patientDetail.family.emptyTitle")}
          </h4>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            {t("pages.patientDetail.family.emptyHint")}
          </p>
        </div>
      )}

      {linkOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-black">{t("pages.patientDetail.family.linkTitle")}</h4>
              <button
                type="button"
                onClick={() => {
                  setLinkOpen(false);
                  setSearch("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pages.patientDetail.family.searchPlaceholder")}
              className="mb-4 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
              autoFocus
            />
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {searchResults.map((p: PatientSearchRow) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={linkMut.isPending}
                    onClick={() => linkMut.mutate(p.id)}
                    className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <span className="font-bold">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-xs text-slate-500">{p.phone}</span>
                  </button>
                </li>
              ))}
              {q.trim().length >= 2 && !searchResults.length ? (
                <li className="px-4 py-6 text-center text-sm text-slate-500">
                  {t("pages.patientDetail.family.noSearchResults")}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
