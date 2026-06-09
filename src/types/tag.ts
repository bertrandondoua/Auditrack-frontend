/**
 * Auditrack — Tag (workflow edge: from_step → to_step within a procedure,
 * carrying a duration).
 *
 * NOTE: greffe-webui's Tag had `procedure: Control` (wrong type — it's the
 * Procedure UUID) and full Step objects embedded. Corrected here: all FKs
 * are UUID strings.
 */
export interface Tag {
  uuid?: string;
  is_active?: boolean;
  duration: string;
  /** Procedure UUID. */
  procedure: string;
  /** Step UUID. */
  from_step: string;
  /** Step UUID. */
  to_step: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
