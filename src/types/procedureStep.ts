/**
 * Auditrack — ProcedureStep (ordered join between a Procedure and a Step).
 *
 * greffe-webui used `[key: string]: any` for this entity. Inferred fields
 * from DRF naming conventions + the createProcedureStep call sites:
 * (procedure, step, order). Adjust if the backend serializer differs.
 */
export interface ProcedureStep {
  uuid?: string;
  is_active?: boolean;
  /** Procedure UUID. */
  procedure: string;
  /** Step UUID. */
  step: string;
  order: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
