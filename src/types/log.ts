/**
 * Auditrack — ModelHistory entry (audit log from /core/history/).
 *
 * The backend's ModelHistory model logs CRUD actions on every tracked
 * model. greffe-webui's slice was untyped — inferred shape based on
 * standard Django ModelHistory implementations. Adjust if the actual
 * serializer differs.
 */
export interface LogEntry {
  id?: string | number;
  uuid?: string;
  /** Target model name (e.g. "Organization", "Control"). */
  model?: string;
  /** UUID/PK of the target object. */
  object_id?: string;
  /** Verb: "created" | "updated" | "deleted" — backend may use other strings. */
  action?: string;
  /** JSON-serialised diff or summary. */
  changes?: string | Record<string, unknown> | null;
  /** Actor UUID. */
  user?: string | null;
  /** Optional display name for the actor (if API embeds). */
  user_display?: string;
  timestamp?: string;
}
