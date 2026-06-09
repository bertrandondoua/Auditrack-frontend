/**
 * Auditrack — ControlStep (an instance of a Step inside a running Control's
 * workflow execution).
 *
 * NOTE: greffe-webui embeds the full `Step` + `documents` array. Trimmed
 * here to UUID strings. Use the joined Step name by looking it up against
 * the procedure's steps map (or against the steps slice) in the consumer.
 */
export interface ControlStep {
  uuid?: string;
  is_active?: boolean;
  /** Control UUID. */
  control: string;
  /** Step UUID. */
  step: string;
  /** Phase UUID. */
  phase?: string;
  /** ISO datetime when this step was recorded as started. */
  recorded_at?: string;
  /** ISO datetime when the step was completed (server-set on completion). */
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
