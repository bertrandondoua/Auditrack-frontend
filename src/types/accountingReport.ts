/**
 * Auditrack — AccountingReport (quarterly account submission from an
 * organisme).
 *
 * Has workflow actions: deposite (mark deposited) + validate. File upload
 * (acknowledge_receipt) lands when the documents domain is wired up.
 */
export interface AccountingReport {
  uuid?: string;
  is_active?: boolean;
  deposited_at?: string;
  deposited_by?: string;
  /** Backend field is `exercise_year` (integer), NOT `fiscal_year`. */
  exercise_year?: number;
  /** Organization UUID. Required on write. */
  organization: string;
  /** Section UUID. Required on write. */
  section: string;
  /** UUID of the document attached as acknowledgement (nullable). */
  acknowledge_receipt?: string | null;
  /**
   * Read-only embed for the linked org. drf-yasg types it as `string`, but at
   * runtime it can be a nested object (e.g. `{ name, email }`). Pass through
   * `embedLabel()` before rendering. See lib/utils.ts.
   */
  organization_details?: string | Record<string, unknown> | null;
  /** Read-only embed for the linked section (string or nested object). */
  section_details?: string | Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
