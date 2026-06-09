import {
  ArrowRightLeft,
  FileText,
  Folders,
  GitBranch,
  Layers,
  LayoutList,
  Link2,
  ListChecks,
  Users,
  UsersRound,
  Workflow,
} from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n-config";
import { getDictionary } from "@/lib/dictionaries";

interface ConfigEntry {
  href: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** Hidden from the grid when true. Used to disable cards whose backend is not yet implemented. */
  disabled?: boolean;
}

export default async function ConfigurationLanding({
  params,
}: Readonly<{
  params: { lang: Locale };
}>) {
  const dict = await getDictionary(params.lang);

  const entries: ConfigEntry[] = [
    {
      href: `/${params.lang}/configuration/programs`,
      title: dict.configuration.landing.programs.title,
      description: dict.configuration.landing.programs.description,
      Icon: LayoutList,
    },
    {
      href: `/${params.lang}/configuration/accountants`,
      title: dict.configuration.landing.accountants.title,
      description: dict.configuration.landing.accountants.description,
      Icon: Users,
    },
    {
      href: `/${params.lang}/configuration/assignations`,
      title: dict.configuration.landing.assignations.title,
      description: dict.configuration.landing.assignations.description,
      Icon: Link2,
    },
    {
      href: `/${params.lang}/configuration/sections`,
      title: dict.configuration.landing.sections.title,
      description: dict.configuration.landing.sections.description,
      Icon: Folders,
    },
    {
      // NOTE: backend exposes no /core/phases/ endpoint as of the Auditrack-api
      // snapshot in BACKEND_MISMATCHES.md §1. Card removed from the grid.
      href: `/${params.lang}/configuration/phases`,
      title: dict.configuration.landing.phases.title,
      description: dict.configuration.landing.phases.description,
      Icon: Layers,
      disabled: true,
    },
    {
      href: `/${params.lang}/configuration/steps`,
      title: dict.configuration.landing.steps.title,
      description: dict.configuration.landing.steps.description,
      Icon: ListChecks,
    },
    {
      href: `/${params.lang}/configuration/document-types`,
      title: dict.configuration.landing.document_types.title,
      description: dict.configuration.landing.document_types.description,
      Icon: FileText,
    },
    {
      href: `/${params.lang}/configuration/procedures`,
      title: dict.configuration.landing.procedures.title,
      description: dict.configuration.landing.procedures.description,
      Icon: Workflow,
    },
    {
      href: `/${params.lang}/configuration/procedure-steps`,
      title: dict.configuration.landing.procedure_steps.title,
      description: dict.configuration.landing.procedure_steps.description,
      Icon: GitBranch,
    },
    {
      href: `/${params.lang}/configuration/tags`,
      title: dict.configuration.landing.tags.title,
      description: dict.configuration.landing.tags.description,
      Icon: ArrowRightLeft,
    },
    {
      href: `/${params.lang}/configuration/teams`,
      title: dict.configuration.landing.teams.title,
      description: dict.configuration.landing.teams.description,
      Icon: UsersRound,
    },
  ];

  const visibleEntries = entries.filter((e) => !e.disabled);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{dict.configuration.landing.title}</h1>
        <p className="text-sm text-[#585757]">{dict.configuration.landing.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleEntries.map(({ href, title, description, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-[#E7F0ED] bg-white p-6 hover:border-primary hover:shadow-sm transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[#E7F0ED] text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
            </div>
            <p className="mt-3 text-sm text-[#585757]">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
