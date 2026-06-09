/**
 * Auditrack — ProcedureStep (join between a Procedure and a Step).
 *
 * Backend contract (openapi.json): only `step` + `procedure` are writable.
 * There is no `order` field — the backend does not model step ordering here.
 */
export interface ProcedureStep {
  uuid?: string;
  is_active?: boolean;
  /** Procedure UUID. Required on write. */
  procedure: string;
  /** Step UUID. Required on write. */
  step: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
