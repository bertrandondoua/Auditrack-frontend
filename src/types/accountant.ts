/**
 * Auditrack — Accountant (comptable public/para-public assigned to an
 * Organization).
 *
 * Consolidates greffe-webui's two duplicate definitions (src/types/accountant.ts
 * and the inlined interface in src/redux/features/accountant/accountantApiSlice.ts)
 * into one canonical shape. Superset: keeps `title` and `accountant_id` from
 * the inlined version; keeps the `last_name | null` nullability from the
 * types/ version.
 */
export interface Accountant {
  uuid?: string;
  is_active?: boolean;
  title?: string | null;
  first_name: string;
  last_name: string | null;
  accountant_id?: string | null;
  phone_number: string;
  email: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
