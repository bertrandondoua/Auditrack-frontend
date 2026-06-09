/**
 * Auditrack — Team (a team of clerks staffing a Section to run controls).
 *
 * NOTE: greffe-webui inlined the Team type in the slice. Moved here.
 */
export interface Team {
  uuid?: string;
  is_active?: boolean;
  name: string;
  team_lead_name: string;
  team_lead_email: string;
  team_lead_phone_number: string;
  number_of_members?: number | null;
  /** Section UUID. Required on write (openapi.json). */
  section: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
