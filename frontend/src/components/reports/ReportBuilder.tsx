import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  Settings2, 
  LayoutGrid, 
  ChevronRight, 
  Zap, 
  Download,
  Share2,
  RefreshCw,
  AlertCircle,
  Activity
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Area,
  AreaChart
} from 'recharts';

import { fetchCustomReport } from '../../services/reports';

type ReportDimension = 'date' | 'doctor' | 'category' | 'status';
type ReportMetric = 'revenue' | 'count' | 'patientGrowth';
type ChartType = 'bar' | 'line' | 'area';

export function ReportBuilder() {
  const { t } = useTranslation();
  const [dimension, setDimension] = useState<ReportDimension>('date');
  const [metric, setMetric] = useState<ReportMetric>('revenue');
  const [chartType, setChartType] = useState<ChartType>('area');

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['customReport', dimension, metric],
    queryFn: () => fetchCustomReport({ dimension, metric }),
    staleTime: 60000
  });

  const chartData = data ? data.labels.map((label, i) => ({
    name: label,
    value: data.values[i]
  })) : [];

  const chartColors: Record<ReportMetric, string> = {
    revenue: '#10b981',
    count: '#0ea5e9',
    patientGrowth: '#8b5cf6'
  };

  return (
    <div className="flex flex-col gap-6 rounded-[3.5rem] bg-white border border-slate-100 p-10 shadow-2xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-100">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <Settings2 size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t("pages.reportBuilder.title") || "Report Architect"}</h3>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("pages.reportBuilder.subtitle") || "Configure your clinical data streams"}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-[1.5rem]">
            <button className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-colors">
               <Share2 size={14} className="inline mr-2" /> {t("common.share")}
            </button>
            <button className="h-10 px-8 rounded-xl bg-white text-white text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95">
               <Download size={14} className="inline mr-2" /> {t("common.export")}
            </button>
         </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-4">
         {/* Configuration Side */}
         <div className="lg:col-span-4 space-y-10">
            <div className="space-y-5">
               <div className="flex items-center gap-2 px-2">
                  <LayoutGrid size={14} className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("pages.reportBuilder.dimensionLabel")}</p>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {(['date', 'doctor', 'category', 'status'] as ReportDimension[]).map(d => (
                    <button 
                      key={d}
                      onClick={() => setDimension(d)}
                      className={`h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ dimension === d ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-50 text-slate-500 hover:bg-slate-100' }`}
                    >
                      {t(`pages.reportBuilder.dimensions.${d}`)}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-5">
               <div className="flex items-center gap-2 px-2">
                  <Activity size={14} className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("pages.reportBuilder.metricLabel")}</p>
               </div>
               <div className="space-y-3">
                  {(['revenue', 'count', 'patientGrowth'] as ReportMetric[]).map(m => (
                    <button 
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`w-full group flex items-center justify-between px-6 py-4 rounded-2xl border transition-all ${ metric === m ? 'bg-white border-indigo-500 shadow-xl' : 'bg-transparent border-slate-100 text-slate-400' }`}
                    >
                       <span className="text-[10px] font-black uppercase tracking-widest">{t(`pages.reportBuilder.metrics.${m}`)}</span>
                       <Zap size={16} className={metric === m ? 'text-indigo-500 animate-pulse' : 'text-slate-200'} />
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-5">
               <div className="flex items-center gap-2 px-2">
                  <BarChart3 size={14} className="text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t("pages.reportBuilder.vizLabel")}</p>
               </div>
               <div className="flex gap-3">
                  {(['area', 'bar', 'line'] as ChartType[]).map(type => (
                    <button 
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`h-14 flex-1 rounded-2xl flex items-center justify-center transition-all ${ chartType === type ? 'bg-white text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100' }`}
                    >
                       {type === 'area' ? <LayoutGrid size={20} /> : type === 'bar' ? <BarChart3 size={20} /> : <LineChartIcon size={20} />}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Visualization Viewport */}
         <div className="lg:col-span-8">
            <div className="relative h-full min-h-[500px] rounded-[3rem] bg-slate-50 border border-slate-100 p-10 overflow-hidden">
               
               <div className="relative z-10 mb-10 flex items-center justify-between">
                  <div>
                     <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{t("pages.reportBuilder.livePreview")}</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <div className={`h-2 w-2 rounded-full ${isFetching ? 'bg-indigo-500 animate-ping' : 'bg-teal-500'}`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           {isFetching ? "Re-Architecting Data..." : `Streaming ${t(`pages.reportBuilder.dimensions.${dimension}`)} Analysis`}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="relative z-10 h-72 w-full">
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center gap-4"
                      >
                         <RefreshCw className="h-10 w-10 animate-spin text-indigo-500" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compiling Report...</p>
                      </motion.div>
                    ) : error ? (
                      <motion.div 
                        key="error"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center gap-4 text-rose-500"
                      >
                         <AlertCircle size={40} />
                         <p className="text-xs font-black uppercase tracking-widest">Query Failed</p>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="chart"
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                        className="h-full w-full"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                           {chartType === 'area' ? (
                             <AreaChart data={chartData}>
                                <defs>
                                   <linearGradient id="builderGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor={chartColors[metric]} stopOpacity={0.4} />
                                      <stop offset="95%" stopColor={chartColors[metric]} stopOpacity={0} />
                                   </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="8 8" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" dy={10} />
                                <YAxis hide />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                                />
                                <Area type="monotone" dataKey="value" stroke={chartColors[metric]} strokeWidth={4} fill="url(#builderGrad)" animationDuration={1000} />
                             </AreaChart>
                           ) : chartType === 'bar' ? (
                              <BarChart data={chartData}>
                                 <CartesianGrid strokeDasharray="8 8" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                 <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" dy={10} />
                                 <YAxis hide />
                                 <Tooltip 
                                   cursor={{ fill: 'rgba(148, 163, 184, 0.05)', radius: 10 }}
                                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                                 />
                                 <Bar dataKey="value" fill={chartColors[metric]} radius={[10, 10, 10, 10]} barSize={40} animationDuration={1000} />
                              </BarChart>
                           ) : (
                              <LineChart data={chartData}>
                                 <CartesianGrid strokeDasharray="8 8" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                                 <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" dy={10} />
                                 <YAxis hide />
                                 <Tooltip 
                                   contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                                 />
                                 <Line type="monotone" dataKey="value" stroke={chartColors[metric]} strokeWidth={4} dot={{ r: 6, fill: chartColors[metric], strokeWidth: 4, stroke: '#fff' }} animationDuration={1000} />
                              </LineChart>
                           )}
                        </ResponsiveContainer>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="relative z-10 mt-12 flex items-center justify-between pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-8">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Projected Peak</span>
                        <span className="text-2xl font-black text-slate-900 tabular-nums">
                           {metric === 'revenue' ? '₱' : ''}{chartData.reduce((max, d) => Math.max(max, d.value), 0).toLocaleString()}
                        </span>
                     </div>
                     <div className="h-10 w-px bg-slate-200" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Growth Index</span>
                        <span className="text-2xl font-black text-teal-500 tabular-nums">+14.2%</span>
                     </div>
                  </div>
                  
                  <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500 hover:text-indigo-600 transition-all">
                     {t("pages.reportBuilder.savePreset") || "Save to Vault"} <ChevronRight size={16} />
                  </button>
               </div>

               {/* Background Decorative Element */}
               <div className="absolute -bottom-24 -right-24 h-64 w-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            </div>
         </div>
      </div>
    </div>
  );
}
