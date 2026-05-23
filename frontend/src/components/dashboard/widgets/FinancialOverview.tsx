import { useTranslation } from "react-i18next";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from "recharts";
import { ChartCard, ViewportLazy } from "../DashboardLayout";
import { RevenueTrendChart } from "../RevenueTrendChart";
import { PremiumTooltip } from "../DashboardTooltips";
import type { DashboardResponse, MonthlyReport } from "../../../services/reports";

interface FinancialOverviewProps {
  dashboard: DashboardResponse;
  monthly: MonthlyReport;
  revenueSeries: any[];
  revenueHasData: boolean;
  paymentPie: any[];
  topProc: any[];
  statusRows: any[];
  statusTotal: number;
  year: number;
  month: number;
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
  openMonthlyReportPdf: (y: number, m: number) => Promise<void>;
  phpFormatter: Intl.NumberFormat;
  phpFullFormatter: Intl.NumberFormat;
  methodColors: Record<string, string>;
  dashboardChartEmpty: (props: { message: string }) => JSX.Element;
}

export function FinancialOverview({
  dashboard,
  monthly,
  revenueSeries,
  revenueHasData,
  paymentPie,
  topProc,
  statusRows,
  statusTotal,
  year,
  month,
  setYear,
  setMonth,
  openMonthlyReportPdf,
  phpFormatter,
  phpFullFormatter,
  methodColors,
  dashboardChartEmpty: DashboardChartEmpty,
}: FinancialOverviewProps): JSX.Element {
  const { t } = useTranslation();

  const fieldFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2    ";

  return (
    <>
      {/* Month switcher */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("pages.dashboard.monthlyReportPeriod", { defaultValue: "Monthly Report Period" })}
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {new Intl.DateTimeFormat("en-PH", {
              month: "long",
              year: "numeric",
            }).format(new Date(`${year}-${String(month).padStart(2, "0")}-15`))}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto ${fieldFocus}`}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Intl.DateTimeFormat("en-PH", { month: "long" }).format(new Date(2024, i, 1))}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={2024}
            max={2100}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-24 ${fieldFocus}`}
          />
          <button
            type="button"
            onClick={() => openMonthlyReportPdf(year, month)}
            className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto ${fieldFocus}`}
          >
            {t("pages.dashboard.monthlyPdf", { defaultValue: "Monthly Pdf" })}
          </button>
        </div>
      </div>

      {/* Charts row 1: revenue trend + payment pie */}
      <ViewportLazy minHeight={360}>
        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <ChartCard
            title={t("pages.dashboard.chartRevenueTitle", { defaultValue: "Chart Revenue Title" })}
            subtitle={t("pages.dashboard.chartRevenueSubtitle", {
              amount: phpFullFormatter.format(revenueSeries.reduce((s, r) => s + r.amount, 0)),
            })}
          >
            {!revenueHasData ? (
              <DashboardChartEmpty message={t("pages.dashboard.chartRevenueEmpty", { defaultValue: "Chart Revenue Empty" })} />
            ) : (
              <RevenueTrendChart
                data={revenueSeries}
                hasData={revenueHasData}
                phpFormatter={phpFormatter}
                phpFullFormatter={phpFullFormatter}
                tooltipComponent={PremiumTooltip}
                emptyComponent={DashboardChartEmpty}
              />
            )}
          </ChartCard>

          <ChartCard
            title={t("pages.dashboard.chartPaymentTitle", { defaultValue: "Chart Payment Title" })}
            subtitle={t("pages.dashboard.chartPaymentSubtitle", {
              amount: phpFullFormatter.format(Number(monthly.totalRevenue)),
            })}
          >
            {paymentPie.length === 0 ? (
              <DashboardChartEmpty message={t("pages.dashboard.noPaymentsYet", { defaultValue: "No Payments Yet" })} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentPie}
                      dataKey="value"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={8}
                      stroke="none"
                      cornerRadius={8}
                    >
                      {paymentPie.map((entry) => (
                        <Cell key={entry.key} fill={methodColors[entry.key] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                      formatter={(value) => phpFullFormatter.format(Number(value))}
                    />
                    <Legend
                      iconType="circle"
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(v: string) => (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{v}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      </ViewportLazy>

      {/* Row 2: top procedures + status */}
      <ViewportLazy minHeight={360}>
        <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <ChartCard
            title={t("pages.dashboard.chartTopProcTitle", { defaultValue: "Chart Top Proc Title" })}
            subtitle={t("pages.dashboard.chartTopProcSubtitle", { defaultValue: "Chart Top Proc Subtitle" })}
          >
            {topProc.length === 0 ? (
              <DashboardChartEmpty message={t("pages.dashboard.noTreatmentsYet", { defaultValue: "No Treatments Yet" })} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProc} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 10 }} barSize={12}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={10}
                      stroke="#94a3b8"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontWeight: 700 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                      formatter={(value, _name, ctx) => {
                        const payload = (ctx as any)?.payload;
                        const count = payload?.count ?? 0;
                        return [
                          phpFullFormatter.format(Number(value)),
                          t("pages.dashboard.tooltipRevenueQty", { amount: '', count })
                        ];
                      }}
                    />
                    <Bar dataKey="revenueNum" fill="#0ea5e9" radius={[0, 10, 10, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title={t("pages.dashboard.chartApptStatusTitle", { defaultValue: "Chart Appt Status Title" })}
            subtitle={t("pages.dashboard.chartApptStatusSubtitle", { count: statusTotal })}
          >
            {statusTotal === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                {t("pages.dashboard.chartApptStatusEmpty", { defaultValue: "Chart Appt Status Empty" })}
              </p>
            ) : (
              <div className="space-y-2">
                {statusRows.map((r) => (
                  <div key={r.key}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${r.color}`}
                        style={{
                          width: `${statusTotal ? (r.value / statusTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </ViewportLazy>
    </>
  );
}
