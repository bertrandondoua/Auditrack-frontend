/**
 * Auditrack — SentQuestionnaire (a questionnaire sent to a target as part
 * of a control). The full response editor depends on a Question/Answer
 * resource not yet in scope; this MVP exposes the list + status + delete.
 */
export type SentQuestionnaireStatus = "SENT" | "RECEIVED" | "OVERDUE";

export interface SentQuestionnaire {
  uuid?: string;
  is_active?: boolean;
  name: string;
  send_date: string;
  return_date?: string | null;
  status: SentQuestionnaireStatus;
  /** URL to attached file(s). */
  files?: string | null;
  follow_up_needed?: boolean;
  /** Response payload — opaque blob until the editor lands. */
  responses?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string | null;
  deleted_at?: string | null;
  /** Reminder UUIDs. */
  reminders?: string[];
}
