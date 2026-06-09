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
  deposited_at: string;
  deposited_by?: string;
  fiscal_year?: string;
  /** Organization UUID. */
  organization: string;
  /** UUID of the document attached as acknowledgement (nullable). */
  acknowledge_receipt?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
