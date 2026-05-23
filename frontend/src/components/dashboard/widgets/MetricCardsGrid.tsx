import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MetricCard } from "../DashboardMetrics";
import type { DashboardResponse } from "../../../services/reports";
import { 
  Calendar, 
  Users, 
  ShieldCheck, 
  Package, 
  ArrowUpRight,
  Activity
} from "lucide-react";

interface MetricCardsGridProps {
  dashboard: DashboardResponse;
  canSeeManagementCards: boolean;
}

export function MetricCardsGrid({ dashboard, canSeeManagementCards }: MetricCardsGridProps): JSX.Element {
  const { t } = useTranslation();

  const cards = [
    {
      to: "/appointments",
      label: t("pages.dashboard.metricTodayAppts", { defaultValue: "Metric Today Appts" }),
      value: dashboard.today.appointments,
      sub: t("pages.dashboard.metricTodayQueue", { count: dashboard.queue.total }),
      accent: "teal",
      icon: <Calendar size={18} />,
      delay: 0
    },
    ...(canSeeManagementCards ? [
      {
        label: t("pages.dashboard.metricNewPatients", { defaultValue: "Metric New Patients" }),
        value: dashboard.thisMonth.newPatients,
        sub: t("pages.dashboard.metricMonthlyAppts", { count: dashboard.thisMonth.appointments }),
        accent: "emerald",
        icon: <Users size={18} />,
        delay: 0.1
      },
      {
        to: "/hmo-claims",
        label: t("pages.dashboard.metricHmo", { defaultValue: "Metric Hmo" }),
        value: dashboard.operational.pendingHmoClaims,
        sub: t("pages.dashboard.metricHmoSubWithClaims", { defaultValue: "Metric Hmo Sub With Claims" }),
        accent: "amber",
        icon: <ShieldCheck size={18} />,
        delay: 0.2
      },
      {
        to: "/inventory",
        label: t("pages.dashboard.metricInventory", { defaultValue: "Metric Inventory" }),
        value: dashboard.operational.inventoryAlerts,
        sub: t("pages.dashboard.metricInventorySubWithOpen", { defaultValue: "Metric Inventory Sub With Open" }),
        accent: "indigo",
        icon: <Package size={18} />,
        delay: 0.3
      }
    ] : [
      {
        label: t("pages.dashboard.metricInventory", { defaultValue: "Metric Inventory" }),
        value: dashboard.operational.inventoryAlerts,
        sub: t("pages.dashboard.metricInventorySub", { defaultValue: "Metric Inventory Sub" }),
        accent: "slate",
        icon: <Package size={18} />,
        delay: 0.1
      }
    ])
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const content = (
          <MetricCard
            label={card.label}
            value={card.value}
            sub={card.sub}
            accent={card.accent as "emerald" | "teal" | "amber" | "slate" | "indigo" | "rose"}
            icon={card.icon}
          />
        );

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay, duration: 0.2 }}
          >
            {card.to ? (
              <Link to={card.to} className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                {content}
              </Link>
            ) : (
              content
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
