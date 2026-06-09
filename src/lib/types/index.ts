import type { LucideProps } from "lucide-react";
import type { FC, SVGProps } from "react";
import type { Role } from "@/redux/features/auth/authSlice";

export type { Role };

export interface Route {
  path: string;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>> & LucideProps & { children?: never };
  roles: Role[];
}

export interface DashboardRoutes {
  main: Route[];
  bottom: Route[];
}

export type Routes = DashboardRoutes;

export interface SelectOption {
  value: string;
  label: string;
}

export interface DialogProps {
  trigger: React.ReactNode;
  footer?: React.ReactNode | ((props: { closeDialog: () => void }) => React.ReactNode);
  className?: string;
  children: React.ReactNode;
  dialogClose: React.ReactNode;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  title: string;
  description?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  placeholder?: string;
  readOnly?: boolean;
  value?: string;
  label?: React.ReactNode;
  className?: string;
  onChange?: (value: string) => void;
}
