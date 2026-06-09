/**
 * Auditrack — Organization (organisme contrôlé).
 *
 * NOTE: greffe-webui's Organization type also embeds `controls: Control[]`,
 * `reports: AccountingReport[]`, and `accountants: Accountant[]`. Those
 * relations are deliberately omitted here until the controls / accounting-
 * reports / accountants domains land in Auditrack-frontend. When they do,
 * extend this interface — don't recreate the type.
 */
export type OrganizationType = "public" | "para-public";

export interface Organization {
  uuid?: string;
  is_active?: boolean;
  folder_number: string;
  name: string;
  type: OrganizationType;
  address?: string | null;
  phone_number?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface OrganizationHistory {
  id: string;
  action: string;
  changed_at: string;
  changes: string;
}
