/**
 * Auditrack — Section (audit section within a program; led by a président,
 * staffed by a chief_clerk + clerks).
 *
 * NOTE: greffe-webui's Section type embeds full `User`, `Team`, `Control`,
 * and `Program` objects. We keep only the FK UUID strings for now — the
 * embedded relations land when those domains are ported. When they do,
 * extend this interface rather than replacing it.
 */
export interface Section {
  uuid?: string;
  is_active?: boolean;
  name: string;
  description?: string | null;
  /** Program UUID. Required on write. */
  program?: string;
  /** Président (User) UUID. Required on write. */
  president?: string;
  /** Greffier en chef (User) UUID. Required on write. */
  chief_clerk?: string;
  /** Greffier (User) UUID. Required on write. */
  clerk?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface SectionHistory {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  version: string;
}
