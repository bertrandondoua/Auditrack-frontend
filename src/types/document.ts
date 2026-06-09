/**
 * Auditrack — Document + DocumentType.
 *
 * Document is an uploaded file attached to a control_step (or other parent
 * entity). The file blob is uploaded via multipart/form-data; the API
 * returns a URL in `file`.
 */
export interface AuditDocument {
  uuid?: string;
  is_active?: boolean;
  name: string;
  file: string;
  /** ISO datetime of deposit (when the file was uploaded). */
  deposited_at?: string;
  /** DocumentType UUID. */
  type?: string;
  /** ControlStep UUID. */
  control_step?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface DocumentHistory {
  timestamp: string;
  action: string;
  user: string;
  description: string;
}

export interface DocumentType {
  uuid?: string;
  is_active?: boolean;
  name: string;
  short_name?: string | null;
  is_opening_doc_type?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
