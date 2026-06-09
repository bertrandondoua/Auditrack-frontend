/**
 * Auditrack — Assignation (assigns a comptable to an organisme for a given
 * exercise year). The natural key is (organization, accountant, exercise_year).
 *
 * `exercise_year` is stored as an ISO date string (`YYYY-MM-DD`) on the
 * backend, even though semantically it represents a year. The frontend
 * conventionally serialises it as `${year}-01-01`. See create-dialog.tsx.
 */
export interface Assignation {
  uuid?: string;
  is_active?: boolean;
  exercise_year: string;
  organization: string;
  accountant: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
