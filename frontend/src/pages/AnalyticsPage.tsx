import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import { fetchAnalyticsOverview, type AnalyticsOverview } from "../services/analytics";
import { toast } from "sonner";
import { 
  TrendingUp as IconTrendingUp, 
  Users as IconUsers, 
  Wallet as IconWallet, 
  Stethoscope as IconStethoscope,
  ArrowUpRight as IconArrowUpRight,
  BarChart3 as IconChartDots,
} from "lucide-react";

const COLORS = ["#10b981", "#0ea5e9", "#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#f59e0b", "#14b8a6"];

export function AnalyticsPage() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const PHP_FORMAT = new Intl.NumberFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-PH', {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  });

  useEffect(() => {
    fetchAnalyticsOverview()
      .then(setData)
      .catch((err) => {
        console.error(err);
        toast.error(t("pages.analytics.loadError"));
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)]"
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-7xl space-y-12 pb-20">
      {/* Dynamic Header */}
      <header className="relative pt-4">
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-200/50">
              <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {t("pages.analytics.liveInsights")}
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white sm:text-6xl">
              {t("pages.analytics.title")} <span className="text-gradient">{t("pages.analytics.hub")}</span>
            </h1>
            <p className="max-w-xl text-lg font-medium text-slate-500 leading-relaxed">
              {t("pages.analytics.subtitle")}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="inline-flex h-14 items-center gap-3 rounded-2xl bg-white px-8 text-sm font-black uppercase tracking-widest text-slate-900 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow-md active:scale-95">
              <IconChartDots size={18} />
              {t("pages.analytics.export")}
            </button>
          </div>
        </div>
      </header>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-6 lg:grid-cols-12">
        {/* Main Growth Chart - Large */}
        <div className="glass-premium md:col-span-6 lg:col-span-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t("pages.analytics.growthTrend")}
              </p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{t("pages.analytics.retentionVelocity")}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IconTrendingUp size={20} />
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.patientGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: "#94a3b8" }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: "#94a3b8" }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "1.5rem" }}
                  itemStyle={{ fontWeight: 900, fontSize: "0.75rem" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="newPatients" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorNew)" 
                  name={t("pages.analytics.newPatients")} 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="returningPatients" 
                  stroke="#0ea5e9" 
                  fillOpacity={1} 
                  fill="url(#colorRet)" 
                  name={t("pages.analytics.returning")} 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories - Small/Tall */}
        <div className="glass-premium md:col-span-6 lg:col-span-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t("pages.analytics.distribution")}
              </p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{t("pages.analytics.treatmentShare")}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <IconStethoscope size={20} />
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="amount"
                >
                  {data.categoryRevenue.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: any) => PHP_FORMAT.format(Number(value))}
                   contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {data.categoryRevenue.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-all hover:bg-white hover:ring-1 hover:ring-slate-200">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                <span className="truncate text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity - Medium/Wide */}
        <div className="glass-premium md:col-span-6 lg:col-span-7">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t("pages.analytics.leaderboard")}
              </p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{t("pages.analytics.providerPerformance")}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <IconUsers size={20} />
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dentistProductivity} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="8 8" horizontal={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }} 
                  tickFormatter={(v) => `₱${v/1000}k`} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#475569" }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => PHP_FORMAT.format(Number(value))}
                  contentStyle={{ borderRadius: "1.5rem", border: "none" }}
                />
                <Bar 
                   dataKey="revenue" 
                   fill="#0ea5e9" 
                   radius={[0, 12, 12, 0]} 
                   barSize={24}
                >
                  {data.dentistProductivity.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#0ea5e9"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-3xl bg-emerald-50/50 p-6 ring-1 ring-emerald-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <IconArrowUpRight size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em]">{t("pages.analytics.topPerformer")}</p>
                <p className="text-lg font-black text-emerald-950">{data.dentistProductivity[0]?.name || "N/A"}</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-emerald-700 tracking-[0.2em]">{t("pages.analytics.growth")}</p>
               <p className="text-lg font-black text-emerald-950">+12.4%</p>
            </div>
          </div>
        </div>

        {/* Cashflow Source - Medium */}
        <div className="glass-premium md:col-span-6 lg:col-span-5 bg-gradient-to-br from-white/80 to-emerald-50/30">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t("pages.analytics.cashflow")}
              </p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{t("pages.analytics.fundingMix")}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IconWallet size={20} />
            </div>
          </div>

          <div className="relative h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.hmoShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={15}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip formatter={(value: any) => PHP_FORMAT.format(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t("pages.analytics.ratio")}</span>
              <span className="text-xl font-black text-emerald-600">{t("pages.analytics.hmoLead")}</span>
            </div>
          </div>
          <div className="mt-4 space-y-3">
             {data.hmoShare.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
                 <div className="flex items-center gap-4">
                   <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${idx === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                     {idx === 0 ? <IconStethoscope size={20} /> : <IconUsers size={20} />}
                   </div>
                   <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                 </div>
                 <span className="font-black text-slate-900">{PHP_FORMAT.format(item.value)}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
