import React from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueTrendChartProps {
  data: any[];
  hasData: boolean;
  phpFormatter: any;
  phpFullFormatter: any;
  tooltipComponent: React.ComponentType<any>;
  emptyComponent: React.ComponentType<{ message: string }>;
}

export function RevenueTrendChart({
  data,
  hasData,
  phpFormatter,
  phpFullFormatter,
  tooltipComponent: PremiumTooltip,
  emptyComponent: DashboardChartEmpty,
}: RevenueTrendChartProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="h-64">
      {!hasData ? (
        <DashboardChartEmpty message={t("pages.dashboard.chartRevenueEmpty", { defaultValue: "Chart Revenue Empty" })} />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="label" 
              fontSize={10} 
              stroke="#94a3b8" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 600 }}
            />
            <YAxis
              fontSize={10}
              stroke="#94a3b8"
              tickFormatter={(v: number) => phpFormatter.format(v)}
              width={60}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontWeight: 600 }}
            />
            <Tooltip content={<PremiumTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#revGrad)"
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
