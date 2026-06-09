/**
 * Auditrack — Program (annual audit programme).
 *
 * NOTE: greffe-webui's Program type also embeds `sections: Section[]` and
 * `documents: Document[]`. Those relations are deliberately omitted here
 * until the sections / documents domains land in Auditrack-frontend. When
 * they do, extend this interface rather than recreating it.
 */
export interface Program {
  uuid?: string;
  program_year: number;
  is_active?: boolean;
  /**
   * Read-only document URL the backend attaches to a program. There is no
   * writable upload field on this serializer — uploads are not supported.
   */
  document?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
