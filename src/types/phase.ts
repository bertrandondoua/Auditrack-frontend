/**
 * Auditrack — Phase (a stage of the audit workflow, e.g. instruction,
 * delibéré). Carries a duration so the workflow engine can deadline-warn.
 *
 * The `duration` string is a Django DurationField in the canonical
 * "DD HH:MM:SS" format (or just "N days"). Frontend currently round-trips
 * it as a string — parse server-side.
 */
export interface Phase {
  uuid?: string;
  is_active?: boolean;
  name: string;
  duration: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
