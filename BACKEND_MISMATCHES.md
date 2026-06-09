# Backend ↔ Frontend mismatches

Snapshot taken against `Auditrack-api` (`openapi.json`, Swagger 2.0). Last
field-level audit: see §8.

Backend exposes **53 paths** and **20 model definitions**. This document lists every
gap discovered when running the frontend against this backend.

---

## 1. Frontend hits these endpoints — backend returns 404

The frontend slices send requests to these URLs, but they don't exist on the API.
The corresponding UI surfaces are gracefully degraded (see `src/app/[lang]/(root)/`)
but the underlying domain needs a backend before it can ship.

| Frontend slice / page                          | Endpoint hit                | Backend status                                           |
| ---------------------------------------------- | --------------------------- | -------------------------------------------------------- |
| `phases/phasesApiSlice.ts` (all hooks)         | `/core/phases/`             | **No such resource.** No `Phase` definition.             |
| `questionnaire/questionnaireApiSlice.ts` (all) | `/core/sent-questionnaire/` | **No such resource.** No `SentQuestionnaire` definition. |
| `logs/logsApiSlice.ts` (`getLogs`)             | `/core/history/`            | **No such resource.** No `ModelHistory` definition.      |

**Action:** decide whether to (a) build these models on the backend, or (b) remove
the corresponding frontend domains. The frontend currently hides these from the
sidebar via patches in `configs/constants.ts` and replaces the routes with
"deferred" cards.

---

## 2. Frontend calls these workflow actions — backend doesn't expose them

| Frontend mutation                     | URL it POSTs                                | Backend                                           |
| ------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| `useCompleteControlMutation`          | `/core/controls/{uuid}/complete_control/`   | Only `open/` and `close/` exist. **No complete.** |
| `useReopenControlStepMutation`        | `/core/control-steps/{uuid}/reopen_step/`   | Only `complete_step/` exists. **No reopen.**      |
| `useValidateAccountingReportMutation` | `/core/accounting-reports/{uuid}/validate/` | Only `deposite/` exists. **No validate.**         |

**Action:** the corresponding UI controls (Complete-control button, Reopen-step
toggle, Validate-report row action) are hidden in the frontend until these
endpoints land.

---

## 3. Frontend never wires `*/history/` — backend confirms none exist

The frontend slices declared `getOrganizationHistory`, `getSectionHistory`,
`getProcedureHistory`, `getControlHistory`, `getControlStepHistory`,
`getAccountingReportHistory`, `getPhaseHistory`, `getSentQuestionnaireHistory`,
but **the backend exposes no `*/history/` actions on any model**.

No UI surfaces call these hooks yet, so this is dormant — but the hooks would
404 if used. Either build per-model history actions (`drf-history` or similar)
or delete the hooks.

---

## 4. Backend exposes — frontend doesn't use (yet)

These endpoints are available and the frontend would benefit from wiring them up.

| Endpoint                            | Use case                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `/core/organizations/stats/`        | Real metrics for the dashboard (currently we count via paginated list `count` field)     |
| `/core/accounting-reports/summary/` | Reports overview / fiscal-year rollup                                                    |
| `/core/controls/{uuid}/summary/`    | Control detail header — could replace the parallel `get*` queries we do to resolve names |
| `/core/programs/{uuid}/sections/`   | Embedded sections in Program detail (instead of `?program=` filter)                      |
| `/core/programs/{uuid}/restore/`    | Soft-delete restore — no restore action in the UI yet                                    |
| `/core/sections/{uuid}/controls/`   | Section detail — controls tab                                                            |
| `/core/sections/{uuid}/reports/`    | Section detail — accounting reports tab                                                  |
| `/core/sections/{uuid}/teams/`      | Section detail — teams tab                                                               |
| `/core/steps/{uuid}/procedures/`    | Step detail (no detail page yet) — reverse lookup                                        |

---

## 5. Wire-format quirks the frontend assumes (confirmed)

These are not bugs, just sharp edges the frontend explicitly handles:

- **Trailing slashes mandatory.** Backend has `APPEND_SLASH = False`. The
  frontend slices match exactly.
- **`/core/accounting-reports/{uuid}/deposite/`** — backend's typo (should be
  `deposit/`). Frontend matches the typo. If/when the backend fixes it, update
  `accountingReportsApiSlice.ts`.
- **Pagination is DRF page-number style** — backend returns `{count, next,
previous, results}`. Confirmed via `PaginatedResponse<T>`.
- **OAuth2 password grant at `/auth/token/`** — not listed in swagger (it's
  a `django-oauth-toolkit` URL) but works. The frontend posts
  `x-www-form-urlencoded` with `grant_type=password`, `username`, `password`,
  `client_id`, and `otp` **only when** `/accounts/auth/config/` reports
  `login_require_otp = true` (`otp` is documented as "Required when
  LOGIN_REQUIRE_OTP enabled"). `client_secret` is optional.

---

## 6. Unresolved: file uploads

Backend defines `Document` with a `file` field. The frontend's `<FileDropzone />`
component uploads `multipart/form-data` to `/core/documents/`. **Verified path
exists** (returns 401 unauth). The actual content-type and field shape need to
be verified with a real authenticated POST.

`Program.document` is **read-only** (see §8) — there is no writable upload field
on the Program serializer. The frontend no longer offers a program file upload;
it only renders `document` as a download link when present.

---

## 7. No permissions endpoint

Backend has **no `/accounts/permissions/`** route. The frontend
`/permissions` page is a deferred-state card. Decide whether to model
permissions backend-side or rely entirely on Django's built-in
`User.user_permissions` + groups.

---

## 8. Field-level contract mismatches (resolved this pass)

A field-by-field diff of the frontend types/forms against `openapi.json` turned
up the following. All are **fixed** in the frontend now; listed here for the
backend team's awareness and for regression tracking.

| Model                | Frontend had                              | Backend contract                                                                                  | Fix applied                                                                                                   |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Section**          | `program_year` on create                  | Not a field. Writable: `name*`, `program*`, `clerk*`, `chief_clerk*`, `president*` (all required) | Dropped `program_year`; made the 3 user FKs + program required.                                               |
| **AccountingReport** | `fiscal_year` (string)                    | Field is `exercise_year` (**integer**); `organization*` + `section*` required                     | Renamed → `exercise_year` (number); added required `section` picker.                                          |
| **Control**          | `name`, `description`, `loc`              | None of these exist. Writable: `procedure*`, `section*`, `organization*`, `exercise_year`         | Removed all three from type + create form + columns + detail.                                                 |
| **ProcedureStep**    | `order` (int)                             | No `order`. Only `step*` + `procedure*` writable                                                  | Removed `order` from type, schema, form, columns, list `ordering`.                                            |
| **ControlStep**      | `completed_at`, `phase`                   | Neither exists. Has `recorded_at`, `documents[]`                                                  | Removed; the `complete_step/` action stays but its result is **not** reflected by any field (see note below). |
| **Program**          | `media_file` (writable upload)            | `document` is **readOnly**; no writable upload field                                              | Removed upload mutation + dropzone; render `document` as a link.                                              |
| **Team**             | `section` optional                        | `section` is **required** (along with `name`, `team_lead_*`)                                      | Made `section` required in schema + type.                                                                     |
| **Tag**              | posts `procedure`, `from_step`, `to_step` | All four edge fields (+ `steps`) are **readOnly**; only `duration*` writable                      | Flagged as ambiguity (see §9) — kept the form but documented the risk.                                        |

**`complete_step` one-way note:** `POST /core/control-steps/{uuid}/complete_step/`
exists, but the `ControlStep` serializer exposes no completion field
(`completed_at`/`status`). So the UI can fire the action but cannot show
"completed" state from the persisted row. Backend should add a completion
field (or return it on the action response) for the timeline to reflect it.

**Tag write-contract ambiguity:** the readOnly flags on `procedure`/`from_step`/
`to_step`/`steps` look like a drf-yasg artefact (nested serializers render as
readOnly even when writable via `_id` source fields). The model almost certainly
stores these edges, but the spec as written says only `duration` is writable.
Until the backend confirms writable source fields (e.g. `from_step_id`), tag
creation may silently persist only the duration. See the header comment in
`src/features/tags/create-dialog.tsx`.

---

## 9. New backend capabilities since last audit

Endpoints now present that the frontend uses or could use:

| Endpoint                            | Status in frontend                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/accounts/auth/config/`            | **Wired.** Public endpoint returning `{login_require_otp, otp:{…}}`. Signin/forgot-password read it to branch OTP vs. direct login adaptively. |
| `/auth/revoke_token/`               | Not wired. Could be called on logout to revoke the OAuth token server-side (currently we just clear `localStorage`).                           |
| `/core/accounting-reports/summary/` | Not wired (see §4).                                                                                                                            |
| `/core/controls/{uuid}/summary/`    | Not wired (see §4).                                                                                                                            |
| `/core/programs/{uuid}/restore/`    | Not wired — soft-delete restore (see §4).                                                                                                      |

---

## Maintenance

Re-run this audit whenever the backend changes:

```bash
curl -s 'http://localhost:8000/swagger/?format=openapi' > openapi.json
node -e "const s=require('./openapi.json'); console.log(Object.keys(s.paths).sort().join('\\n'))"
```

Then diff against the URL strings in `src/redux/features/*/`.
