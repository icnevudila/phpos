import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DashboardIcon, ReportBarsIcon } from "../components/layout/icons";

function BulletList({ items }: { items: string[] }): JSX.Element {
  return (
    <ul className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
      {items.map((text) => (
        <li key={text} className="flex gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
          <span className="min-w-0 leading-snug">{text}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReportsPage(): JSX.Element {
  const { t } = useTranslation();

  const arBullets = [t("pages.reports.cardArBullet1"), t("pages.reports.cardArBullet2"), t("pages.reports.cardArBullet3")];
  const dashBullets = [
    t("pages.reports.cardDashBullet1"),
    t("pages.reports.cardDashBullet2"),
    t("pages.reports.cardDashBullet3"),
  ];
  const pipelineItems = [
    t("pages.reports.pipelineLi1"),
    t("pages.reports.pipelineLi2"),
    t("pages.reports.pipelineLi3"),
    t("pages.reports.pipelineLi4"),
  ];

  const statCards = [
    { title: t("pages.reports.statScopeTitle"), body: t("pages.reports.statScopeBody") },
    { title: t("pages.reports.statTzTitle"), body: t("pages.reports.statTzBody") },
    { title: t("pages.reports.statAccessTitle"), body: t("pages.reports.statAccessBody") },
  ];

  const cardLinkClass =
    "group relative flex min-h-[100%] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-transparent transition motion-reduce:transition-none sm:p-6 md:min-h-[280px] " +
    "hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg hover:ring-sky-100/80 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 " +
    "md:rounded-3xl";

  const kickerClass =
    "inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:text-[11px]";

  return (
    <div className="mx-auto max-w-6xl pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 sm:pt-0">
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-sky-50/40 to-white p-5 shadow-sm sm:p-7 md:rounded-3xl md:p-8 lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl md:-right-10 md:-top-16"
        />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700 sm:text-xs">
          {t("pages.reports.eyebrow")}
        </p>
        <h1 className="relative mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[2.35rem] lg:leading-tight">
          {t("pages.reports.title")}
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {t("pages.reports.subtitle")}
        </p>

        <dl className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {statCards.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm sm:min-h-[112px]"
            >
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{s.title}</dt>
              <dd className="mt-2 text-sm leading-snug text-slate-700">{s.body}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-10 sm:mt-12 md:mt-14" aria-labelledby="reports-financial-heading">
        <div className="border-b border-slate-200 pb-4">
          <h2 id="reports-financial-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
            {t("pages.reports.sectionFinancial")}
          </h2>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-2 xl:gap-8">
          <li className="min-w-0">
            <Link to="/reports/aged-receivables" className={cardLinkClass}>
              <div className="flex shrink-0 flex-col items-start gap-4 md:flex-row md:items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25 sm:h-16 sm:w-16">
                  <ReportBarsIcon size={30} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={kickerClass}>{t("pages.reports.cardArKicker")}</span>
                  <span className="mt-3 block text-lg font-bold text-slate-900 sm:text-xl">
                    {t("pages.reports.cardArTitle")}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("pages.reports.cardArDesc")}</p>
                </div>
              </div>
              <BulletList items={arBullets} />
              <span className="mt-auto flex min-h-12 items-center pt-5 text-sm font-bold text-sky-700 transition group-hover:gap-1">
                {t("pages.reports.cardArCta")}
                <span className="ml-1 inline-block transition group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </Link>
          </li>
          <li className="min-w-0">
            <Link
              to="/dashboard"
              className={`${cardLinkClass} hover:border-emerald-200 hover:ring-emerald-100/80`}
            >
              <div className="flex shrink-0 flex-col items-start gap-4 md:flex-row md:items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 sm:h-16 sm:w-16">
                  <DashboardIcon size={30} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={`${kickerClass} bg-emerald-50 text-emerald-800`}>
                    {t("pages.reports.cardDashKicker")}
                  </span>
                  <span className="mt-3 block text-lg font-bold text-slate-900 sm:text-xl">
                    {t("pages.reports.cardDashTitle")}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("pages.reports.cardDashDesc")}</p>
                </div>
              </div>
              <BulletList items={dashBullets} />
              <span className="mt-auto flex min-h-12 items-center pt-5 text-sm font-bold text-emerald-700 transition group-hover:gap-1">
                {t("pages.reports.cardDashCta")}
                <span className="ml-1 inline-block transition group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section className="mt-10 sm:mt-12 md:mt-14" aria-labelledby="reports-pipeline-heading">
        <h2 id="reports-pipeline-heading" className="text-lg font-bold text-slate-900 sm:text-xl">
          {t("pages.reports.pipelineTitle")}
        </h2>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-5 sm:p-6 md:rounded-3xl md:p-8">
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{t("pages.reports.pipelineBody")}</p>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
            {pipelineItems.map((item) => (
              <li
                key={item}
                className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden />
                <span className="min-w-0 leading-snug">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700">CSV</span>
            <span className="rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700">PDF</span>
            <span className="rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700">XLSX</span>
            <span className="rounded-lg bg-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700">Manila TZ</span>
          </div>
        </div>
      </section>

      <footer className="mt-10 space-y-3 border-t border-slate-200 pt-8 text-xs leading-relaxed text-slate-500 sm:mt-12 sm:flex sm:justify-between sm:gap-8 sm:text-sm md:mt-14">
        <p className="max-w-xl min-w-0">{t("pages.reports.footerLead")}</p>
        <p className="max-w-xl min-w-0 sm:text-right">{t("pages.reports.footerTrail")}</p>
      </footer>
    </div>
  );
}
