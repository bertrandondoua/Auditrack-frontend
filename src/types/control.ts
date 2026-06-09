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
  status?: ControlStatus;
  exercise_year?: number;
  /** Procedure UUID. Required on write. */
  procedure?: string;
  /** Section UUID. Required on write. */
  section?: string;
  /** Organization UUID. Required on write. */
  organization?: string;
  opened_at?: string | null;
  /** Document UUID attached when the control is opened (read/write, nullable). */
  opening_document?: string | null;
  opened_by?: string | null;
  /** Read-only list of ControlStep UUIDs. */
  steps?: string[];
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
