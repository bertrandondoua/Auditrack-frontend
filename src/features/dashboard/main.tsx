"use client";

import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileBarChart2,
  Layers,
  ScrollText,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useGetAccountantsQuery } from "@/redux/features/accountant/accountantApiSlice";
import { useGetAccountingReportsQuery } from "@/redux/features/accountingReports/accountingReportsApiSlice";
import { useGetControlsQuery } from "@/redux/features/controls/controlsApiSlice";
import { useGetOrganizationsQuery } from "@/redux/features/organizations/organizationApiSlice";
import { useGetProgramsQuery } from "@/redux/features/programs/programsApiSlice";
import { useGetAuthenticatedUserQuery } from "@/redux/features/users/usersApiSlice";
import type { Locale } from "@/i18n-config";
import type { Dict } from "@/lib/dictionaries";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  href?: string;
}

function StatCard({ icon: Icon, label, value, href }: StatCardProps) {
  const Wrapper = href ? Link : "div";
  return (
    <Wrapper
      href={href ?? "#"}
      className="rounded-xl border border-[#E7F0ED] bg-white p-5 flex items-center gap-4 transition-colors hover:border-primary"
    >
      <div className="h-12 w-12 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-[#585757]">{label}</div>
      </div>
    </Wrapper>
  );
}

export default function DashboardMain({ dict }: { dict: Dict }) {
  const { lang } = useParams<{ lang: Locale }>();

  const { data: me } = useGetAuthenticatedUserQuery();
  const { data: orgsData } = useGetOrganizationsQuery({ page: 1 });
  const { data: accountantsData } = useGetAccountantsQuery({ page: 1 });
  const { data: programsData } = useGetProgramsQuery({ page: 1 });
  const { data: createdControls } = useGetControlsQuery({ page: 1, status: "created" });
  const { data: openedControls } = useGetControlsQuery({ page: 1, status: "opened" });
  const { data: completedControls } = useGetControlsQuery({ page: 1, status: "completed" });
  const { data: reportsData } = useGetAccountingReportsQuery({
    page: 1,
    ordering: "-deposited_at",
  });

  const totalControls =
    (createdControls?.count ?? 0) + (openedControls?.count ?? 0) + (completedControls?.count ?? 0);
  const inProgressControls = openedControls?.count ?? 0;
  const completedCount = completedControls?.count ?? 0;
  const orgCount = orgsData?.count ?? 0;
  const accountantCount = accountantsData?.count ?? 0;
  const programCount = programsData?.count ?? 0;

  const recentReports = (reportsData?.results ?? []).slice(0, 5);
  const orgByUuid = new Map(
    (orgsData?.results ?? []).filter((o) => o.uuid).map((o) => [o.uuid!, o]),
  );

  const greetingName = me?.first_name ? `, ${me.first_name}` : "";

  return (
    <section className="mt-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {dict.dashboard.hello.title}
          {greetingName}
        </h1>
        <p className="text-sm text-[#585757]">{dict.dashboard.hello.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ScrollText}
          label={dict.dashboard.stats.total_controls}
          value={totalControls}
          href={`/${lang}/control`}
        />
        <StatCard
          icon={ClipboardCheck}
          label={dict.dashboard.stats.in_progress}
          value={inProgressControls}
          href={`/${lang}/control`}
        />
        <StatCard
          icon={ClipboardCheck}
          label={dict.dashboard.stats.completed}
          value={completedCount}
          href={`/${lang}/control`}
        />
        <StatCard
          icon={Building2}
          label={dict.dashboard.stats.organisations}
          value={orgCount}
          href={`/${lang}/organisations`}
        />
        <StatCard
          icon={Users}
          label={dict.dashboard.stats.accountants}
          value={accountantCount}
          href={`/${lang}/configuration/accountants`}
        />
        <StatCard
          icon={Layers}
          label={dict.dashboard.stats.programs}
          value={programCount}
          href={`/${lang}/configuration/programs`}
        />
        <StatCard
          icon={FileBarChart2}
          label={dict.dashboard.stats.reports}
          value={reportsData?.count ?? 0}
          href={`/${lang}/report`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#E7F0ED] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {dict.dashboard.recent_reports_title}
            </h2>
            <Link
              href={`/${lang}/report`}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {dict.dashboard.see_all} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-sm text-[#585757]">{dict.dashboard.no_recent_reports}</p>
          ) : (
            <ul className="space-y-2">
              {recentReports.map((r) => (
                <li
                  key={r.uuid}
                  className="flex items-center justify-between border-b border-[#E7F0ED] last:border-0 pb-2 last:pb-0"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {orgByUuid.get(r.organization)?.name ?? "—"}
                    </div>
                    <div className="text-xs text-[#585757]">
                      {r.fiscal_year ?? "—"} · {new Date(r.deposited_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border ${
                      r.acknowledge_receipt
                        ? "border-[#0CCE6B] text-[#0CCE6B]"
                        : "border-[#86783F] text-[#86783F]"
                    }`}
                  >
                    {r.acknowledge_receipt
                      ? dict.accounting_reports.status.validated
                      : dict.accounting_reports.status.pending}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#E7F0ED] bg-white p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {dict.dashboard.quick_actions_title}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="ghost" asChild>
              <Link href={`/${lang}/control`}>{dict.dashboard.actions.view_controls}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/${lang}/organisations`}>{dict.dashboard.actions.view_orgs}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/${lang}/configuration`}>{dict.dashboard.actions.view_config}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href={`/${lang}/report`}>{dict.dashboard.actions.view_reports}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
