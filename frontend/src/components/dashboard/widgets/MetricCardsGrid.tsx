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
      label: t("pages.dashboard.metricTodayAppts"),
      value: dashboard.today.appointments,
      sub: t("pages.dashboard.metricTodayQueue", { count: dashboard.queue.total }),
      accent: "teal",
      icon: <Calendar size={18} />,
      delay: 0
    },
    ...(canSeeManagementCards ? [
      {
        label: t("pages.dashboard.metricNewPatients"),
        value: dashboard.thisMonth.newPatients,
        sub: t("pages.dashboard.metricMonthlyAppts", { count: dashboard.thisMonth.appointments }),
        accent: "emerald",
        icon: <Users size={18} />,
        delay: 0.1
      },
      {
        to: "/hmo-claims",
        label: t("pages.dashboard.metricHmo"),
        value: dashboard.operational.pendingHmoClaims,
        sub: t("pages.dashboard.metricHmoSubWithClaims"),
        accent: "amber",
        icon: <ShieldCheck size={18} />,
        delay: 0.2
      },
      {
        to: "/inventory",
        label: t("pages.dashboard.metricInventory"),
        value: dashboard.operational.inventoryAlerts,
        sub: t("pages.dashboard.metricInventorySubWithOpen"),
        accent: "indigo",
        icon: <Package size={18} />,
        delay: 0.3
      }
    ] : [
      {
        label: t("pages.dashboard.metricInventory"),
        value: dashboard.operational.inventoryAlerts,
        sub: t("pages.dashboard.metricInventorySub"),
        accent: "slate",
        icon: <Package size={18} />,
        delay: 0.1
      }
    ])
  ];

  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Content = (
          <MetricCard
            label={card.label}
            value={card.value}
            sub={card.sub}
            accent={card.accent as any}
            icon={card.icon}
          />
        );

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: card.delay }}
          >
            {card.to ? (
              <Link to={card.to} className="block group focus:outline-none">
                <div className="transition-all duration-300 group-hover:-translate-y-2 group-hover:scale-[1.02]">
                  {Content}
                </div>
              </Link>
            ) : (
              <div className="hover:-translate-y-1 transition-transform">
                {Content}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
