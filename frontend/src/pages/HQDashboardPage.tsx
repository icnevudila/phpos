import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Building2,
  TrendingUp,
  Users,
  MapPin,
  ChevronRight,
  Plus,
  RefreshCw,
  Globe,
} from "lucide-react";
import api from "../services/api";

interface ClinicStat {
  clinicId: string;
  name: string;
  city: string;
  revenue: number;
  invoicesCount: number;
}

interface HqData {
  totalClinics: number;
  totalRevenue: number;
  clinicStats: ClinicStat[];
}

export function HQDashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<HqData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/hq/dashboard")
      .then((res: { data: HqData }) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div className="flex flex-col items-center justify-center py-40 gap-4">
        <RefreshCw className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          {t("pages.hq.loading")}
        </p>
      </motion.div>
    );
  }

  const metrics = [
    {
      label: t("pages.hq.metricBranches"),
      value: data?.totalClinics,
      icon: <Building2 />,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      label: t("pages.hq.metricRevenue"),
      value: `₱${data?.totalRevenue.toLocaleString() ?? "0"}`,
      icon: <TrendingUp />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: t("pages.hq.metricPatients"),
      value: "2.4k",
      icon: <Users />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-slate-950 pb-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 space-y-12 pt-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">
              {t("pages.hq.kicker")}
            </p>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              {t("pages.hq.title")}
            </h1>
          </div>
          <button
            type="button"
            className="h-14 px-8 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 flex items-center gap-3"
          >
            <Plus size={18} /> {t("pages.hq.addBranch")}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {metrics.map((stat, i) => (
            <div
              key={i}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none"
            >
              <motion.div
                className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}
              >
                {stat.icon}
              </motion.div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <Globe size={20} className="text-slate-400" />
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("pages.hq.branchPerformance")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data?.clinicStats.map((clinic) => (
              <motion.div
                key={clinic.clinicId}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none p-10"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-all" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tight uppercase">{clinic.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin size={12} /> {clinic.city}
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <ChevronRight />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {t("pages.hq.mtdRevenue")}
                      </p>
                      <p className="text-xl font-black text-emerald-500 tracking-tighter">
                        ₱{clinic.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {t("pages.hq.invoices")}
                      </p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {clinic.invoicesCount}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
                  >
                    {t("pages.hq.switchBranch")}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
