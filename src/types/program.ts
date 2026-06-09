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
  media_file?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}
