import type { Role } from "@/redux/features/auth/authSlice";

export type { Role };

export interface User {
  uuid: string;
  last_login?: string | null;
  is_superuser: boolean;
  image?: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  password?: string;
  otp?: string;
  role?: Role;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  gender?: "M" | "F" | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  groups: number[];
  user_permissions: number[];
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface SendOtpRequest {
  email: string;
}

export interface AuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export type Params = Record<string, string | number | undefined>;
