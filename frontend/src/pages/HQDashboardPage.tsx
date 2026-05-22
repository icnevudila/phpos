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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: t("pages.hq.metricBranches"),
      value: data?.totalClinics,
      icon: <Building2 />,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: t("pages.hq.metricRevenue"),
      value: `₱${data?.totalRevenue.toLocaleString() ?? "0"}`,
      icon: <TrendingUp />,
      color: "text-teal-500",
      bg: "bg-teal-50",
    },
    {
      label: t("pages.hq.metricPatients"),
      value: "2.4k",
      icon: <Users />,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7f9] pb-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 space-y-6 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-1">
              {t("pages.hq.kicker")}
            </p>
            <h1 className="page-header-title">{t("pages.hq.title")}</h1>
          </div>
          <button
            type="button"
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> {t("pages.hq.addBranch")}
          </button>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((stat, i) => (
            <div
              key={i}
              className="card"
            >
              <motion.div
                className={`h-12 w-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-5`}
              >
                {stat.icon}
              </motion.div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Globe size={18} className="text-slate-400" />
            <h2 className="text-lg font-bold tracking-tight text-slate-800">
              {t("pages.hq.branchPerformance")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.clinicStats.map((clinic) => (
              <motion.div
                key={clinic.clinicId}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden card"
              >
                <div className="absolute top-0 right-0 h-40 w-40 bg-teal-500/5 blur-[80px] group-hover:bg-teal-500/10 transition-all" />

                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold tracking-tight uppercase text-slate-800">{clinic.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                        <MapPin size={11} /> {clinic.city}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-teal-500 transition-colors">
                      <ChevronRight />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                        {t("pages.hq.mtdRevenue")}
                      </p>
                      <p className="text-lg font-bold text-teal-500 tracking-tight">
                        ₱{clinic.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                        {t("pages.hq.invoices")}
                      </p>
                      <p className="text-lg font-bold text-slate-800 tracking-tight">
                        {clinic.invoicesCount}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary w-full justify-center"
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
