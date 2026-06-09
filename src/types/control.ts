/**
 * Auditrack — Control (audit / fraud-detection workflow instance).
 *
 * NOTE: greffe-webui's Control type embeds full Procedure / Section /
 * Organization / Step[] objects. Trimmed here to UUID strings; embedded
 * objects come back when those domains are wired up the workflow side.
 *
 * Some API endpoints (e.g. list with stats) embed organization/section
 * names. For list-rendering we resolve via parallel queries — see the
 * Controls list view.
 */
export type ControlStatus = "created" | "opened" | "completed";

export interface Control {
  uuid?: string;
  is_active?: boolean;
  name?: string | null;
  description?: string | null;
  status?: ControlStatus;
  loc?: string;
  exercise_year?: number;
  /** Procedure UUID. */
  procedure?: string;
  /** Section UUID. */
  section?: string;
  /** Organization UUID. */
  organization?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface ControlHistory {
  uuid: string;
  status: ControlStatus;
  timestamp: string;
}
