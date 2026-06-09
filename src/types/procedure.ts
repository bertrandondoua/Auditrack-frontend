/**
 * Auditrack — Procedure (canonical audit procedure template, e.g.
 * "Contrôle juridictionnel des comptables publics"). Carries a default
 * duration and an optional alert threshold.
 *
 * NOTE: greffe-webui's Procedure embeds `steps: Step[]`. Procedure ↔ Step
 * ordering lives in the procedureSteps domain (separate slice) — we keep
 * Procedure as a flat type and let procedureSteps own the join.
 */
export interface Procedure {
  uuid?: string;
  is_active?: boolean;
  name: string;
  duration?: string;
  alert?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}
