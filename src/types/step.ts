/**
 * Auditrack — Step (a discrete action within a phase, e.g. "Notification
 * de l'arrêt", "Audience et délibéré").
 *
 * NOTE: greffe-webui's Step embeds a full `Phase` object and a `documents`
 * array. Trimmed for now — `phase` is a UUID string, `documents` is dropped
 * until the documents domain lands. The backend createStep accepts only
 * `{ name }` so phase association lands later via procedureSteps.
 */
export interface Step {
  uuid?: string;
  is_active?: boolean;
  name: string;
  phase?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
