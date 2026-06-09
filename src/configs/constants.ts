import {
  Clipboard,
  Command,
  GitPullRequest,
  Layers,
  LayoutDashboard,
  ScrollText,
  Settings,
} from "lucide-react";
import Logout from "@/components/shared/Layout/icons/Logout";
import type { Routes, SelectOption } from "@/lib/types";

// Backend roles (openapi.json): clerk | chief_clerk | president | it_manager.
const ALL_ROLES = ["clerk", "chief_clerk", "president"] as const;

const ALL_ROLES_WITH_IT = [...ALL_ROLES, "it_manager"] as const;

export const DashboardRoutes: Routes = {
  main: [
    {
      path: "/dashboard",
      label: "home",
      icon: LayoutDashboard,
      roles: [...ALL_ROLES],
    },
    {
      path: "/control",
      label: "control_audit",
      icon: ScrollText,
      roles: [...ALL_ROLES],
    },
    {
      path: "/organisations",
      label: "org",
      icon: Layers,
      roles: [...ALL_ROLES_WITH_IT],
    },
    {
      path: "/account",
      label: "account",
      icon: Clipboard,
      roles: [...ALL_ROLES],
    },
    {
      path: "/configuration",
      label: "config",
      icon: Command,
      roles: ["it_manager", "chief_clerk"],
    },
    {
      path: "/permissions",
      label: "perm",
      icon: GitPullRequest,
      roles: ["it_manager"],
    },
  ],
  bottom: [
    {
      path: "/settings",
      label: "settings",
      icon: Settings,
      roles: [...ALL_ROLES_WITH_IT],
    },
    {
      path: "/logout",
      label: "logout",
      icon: Logout,
      roles: [...ALL_ROLES_WITH_IT],
    },
  ],
};

export const routeNames: Record<string, string> = {
  "": "Home",
  dashboard: "home",
  control: "control_audit",
  organisations: "org",
  sanction: "sanction",
  account: "account",
  report: "report",
  settings: "settings",
  support: "help",
  configuration: "config",
  permissions: "perm",
  logs: "logs",
};

export const ControlSection: SelectOption[] = [
  { value: "1", label: "Première section" },
  { value: "2", label: "Deuxième section" },
  { value: "3", label: "Troisième section" },
  { value: "4", label: "Quatrième section" },
  { value: "5", label: "Sections réunies" },
];

export const ControlType: SelectOption[] = [
  { value: "1", label: "Audit de Gestion" },
  { value: "2", label: "Contrôles juridictionnels des comptables publics" },
  { value: "3", label: "Sanction de faute de gestion" },
];

export const fromYear = 1900;
export const toYear = 2035;
