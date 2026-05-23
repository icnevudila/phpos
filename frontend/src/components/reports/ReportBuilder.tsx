import { useState } from 'react';
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
    revenue: '#0d9488', // teal-600
    count: '#475569', // slate-600
    patientGrowth: '#0f766e' // teal-700
  };

  const dimensionLabels: Record<ReportDimension, string> = {
    date: 'Date Range',
    doctor: 'Provider',
    category: 'Category',
    status: 'Status'
  };

  const metricLabels: Record<ReportMetric, string> = {
    revenue: 'Gross Revenue',
    count: 'Appointment Volume',
    patientGrowth: 'Patient Acquisition'
  };

  return (
    <div className="card border border-brand-border bg-white overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-brand-border">
         {/* Configuration Side */}
         <div className="lg:col-span-4 p-5 space-y-6 bg-brand-surface-soft">
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <LayoutGrid size={14} className="text-brand-muted" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Group By Dimension</p>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {(['date', 'doctor', 'category', 'status'] as ReportDimension[]).map(d => (
                    <button 
                      key={d}
                      onClick={() => setDimension(d)}
                      className={`h-9 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest transition-all border ${ dimension === d ? 'bg-brand-primary border-brand-primary text-white shadow-sm' : 'bg-white border-brand-border text-brand-text hover:bg-brand-surface' }`}
                    >
                      {dimensionLabels[d]}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <Activity size={14} className="text-brand-muted" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Primary Metric</p>
               </div>
               <div className="space-y-2">
                  {(['revenue', 'count', 'patientGrowth'] as ReportMetric[]).map(m => (
                    <button 
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`w-full group flex items-center justify-between px-4 py-2.5 rounded-[var(--radius-sm)] border transition-all ${ metric === m ? 'bg-white border-brand-primary shadow-sm' : 'bg-white border-brand-border text-brand-text hover:bg-brand-surface' }`}
                    >
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${metric === m ? 'text-brand-primary' : ''}`}>{metricLabels[m]}</span>
                       {metric === m && <Zap size={14} className="text-brand-primary" />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-brand-muted" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">Visualization</p>
               </div>
               <div className="flex gap-2">
                  {(['area', 'bar', 'line'] as ChartType[]).map(type => (
                    <button 
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`h-9 flex-1 rounded-[var(--radius-sm)] flex items-center justify-center transition-all border ${ chartType === type ? 'bg-brand-text border-brand-text text-white shadow-sm' : 'bg-white border-brand-border text-brand-text hover:bg-brand-surface' }`}
                    >
                       {type === 'area' ? <LayoutGrid size={16} /> : type === 'bar' ? <BarChart3 size={16} /> : <LineChartIcon size={16} />}
                    </button>
                  ))}
               </div>
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center gap-2">
               <button className="btn-primary w-full justify-center h-9 text-xs">
                  Run Query
               </button>
            </div>
         </div>

         {/* Visualization Viewport */}
         <div className="lg:col-span-8 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-brand-surface-soft">
               <div>
                  <h4 className="text-sm font-bold text-brand-text uppercase tracking-widest">Live Preview</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <div className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-amber-500 animate-pulse' : 'bg-teal-500'}`} />
                     <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                        {isFetching ? "Querying database..." : `Displaying ${metricLabels[metric]} by ${dimensionLabels[dimension]}`}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="btn-secondary h-7 px-2.5 text-[10px] gap-1.5 bg-white">
                     <Download size={12} /> Export CSV
                  </button>
               </div>
            </div>

            <div className="flex-1 p-6 relative min-h-[400px]">
               <AnimatePresence mode="wait">
                 {isLoading ? (
                   <motion.div 
                     key="loading"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white z-10"
                   >
                      <RefreshCw className="h-6 w-6 animate-spin text-brand-muted" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Executing Query...</p>
                   </motion.div>
                 ) : error ? (
                   <motion.div 
                     key="error"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-surface-soft z-10"
                   >
                      <AlertCircle size={32} className="text-brand-muted" />
                      <div className="text-center">
                         <p className="text-xs font-bold text-brand-text uppercase tracking-widest">Report preview unavailable</p>
                         <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1">Check filters or try again.</p>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="chart"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="h-full w-full"
                   >
                     <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'area' ? (
                          <AreaChart data={chartData}>
                             <defs>
                                <linearGradient id="builderGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={chartColors[metric]} stopOpacity={0.2} />
                                   <stop offset="95%" stopColor={chartColors[metric]} stopOpacity={0} />
                                </linearGradient>
                             </defs>
                             <CartesianGrid strokeDasharray="4 4" stroke="var(--color-brand-border)" vertical={false} />
                             <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="var(--color-brand-muted)" dy={10} />
                             <YAxis hide />
                             <Tooltip 
                               contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '0.75rem', fontSize: '12px', fontWeight: 'bold' }}
                             />
                             <Area type="monotone" dataKey="value" stroke={chartColors[metric]} strokeWidth={2} fill="url(#builderGrad)" animationDuration={500} />
                          </AreaChart>
                        ) : chartType === 'bar' ? (
                           <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-brand-border)" vertical={false} />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="var(--color-brand-muted)" dy={10} />
                              <YAxis hide />
                              <Tooltip 
                                cursor={{ fill: 'var(--color-brand-surface-soft)' }}
                                contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '0.75rem', fontSize: '12px', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="value" fill={chartColors[metric]} radius={[4, 4, 0, 0]} barSize={32} animationDuration={500} />
                           </BarChart>
                        ) : (
                           <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-brand-border)" vertical={false} />
                              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="var(--color-brand-muted)" dy={10} />
                              <YAxis hide />
                              <Tooltip 
                                contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '0.75rem', fontSize: '12px', fontWeight: 'bold' }}
                              />
                              <Line type="monotone" dataKey="value" stroke={chartColors[metric]} strokeWidth={2} dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: chartColors[metric] }} animationDuration={500} />
                           </LineChart>
                        )}
                     </ResponsiveContainer>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            <div className="px-6 py-4 bg-brand-surface border-t border-brand-border flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-0.5">Aggregate Sum</span>
                     <span className="text-lg font-black text-brand-text tabular-nums">
                        {metric === 'revenue' ? '₱' : ''}{chartData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                     </span>
                  </div>
                  <div className="h-8 w-px bg-brand-border hidden sm:block" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest mb-0.5">Peak Value</span>
                     <span className="text-lg font-black text-brand-text tabular-nums">
                        {metric === 'revenue' ? '₱' : ''}{chartData.reduce((max, d) => Math.max(max, d.value), 0).toLocaleString()}
                     </span>
                  </div>
               </div>
               
               <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary hover:underline">
                  Save as Preset <ChevronRight size={12} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
