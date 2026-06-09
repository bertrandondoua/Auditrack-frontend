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
  /** Control UUID. Required on write. */
  control: string;
  /** Step UUID. Required on write. */
  step: string;
  /** ISO datetime when this step was recorded. Backend has no `completed_at`. */
  recorded_at?: string;
  /** UUIDs of documents attached to this control step. */
  documents?: string[];
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
