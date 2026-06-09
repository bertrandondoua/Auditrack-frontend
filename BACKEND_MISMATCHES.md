# Backend ↔ Frontend mismatches

Snapshot taken against `Auditrack-api` running on `http://localhost:8000` (OpenAPI v2 fetched from `/swagger/?format=openapi`).

Backend exposes **50 paths** and **20 model definitions**. This document lists every
gap discovered when running the frontend against this backend.

---

## 1. Frontend hits these endpoints — backend returns 404

The frontend slices send requests to these URLs, but they don't exist on the API.
The corresponding UI surfaces are gracefully degraded (see `src/app/[lang]/(root)/`)
but the underlying domain needs a backend before it can ship.

| Frontend slice / page | Endpoint hit | Backend status |
|---|---|---|
| `phases/phasesApiSlice.ts` (all hooks) | `/core/phases/` | **No such resource.** No `Phase` definition. |
| `questionnaire/questionnaireApiSlice.ts` (all) | `/core/sent-questionnaire/` | **No such resource.** No `SentQuestionnaire` definition. |
| `logs/logsApiSlice.ts` (`getLogs`) | `/core/history/` | **No such resource.** No `ModelHistory` definition. |

**Action:** decide whether to (a) build these models on the backend, or (b) remove
the corresponding frontend domains. The frontend currently hides these from the
sidebar via patches in `configs/constants.ts` and replaces the routes with
"deferred" cards.

---

## 2. Frontend calls these workflow actions — backend doesn't expose them

| Frontend mutation | URL it POSTs | Backend |
|---|---|---|
| `useCompleteControlMutation` | `/core/controls/{uuid}/complete_control/` | Only `open/` and `close/` exist. **No complete.** |
| `useReopenControlStepMutation` | `/core/control-steps/{uuid}/reopen_step/` | Only `complete_step/` exists. **No reopen.** |
| `useValidateAccountingReportMutation` | `/core/accounting-reports/{uuid}/validate/` | Only `deposite/` exists. **No validate.** |

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

| Endpoint | Use case |
|---|---|
| `/core/organizations/stats/` | Real metrics for the dashboard (currently we count via paginated list `count` field) |
| `/core/accounting-reports/summary/` | Reports overview / fiscal-year rollup |
| `/core/controls/{uuid}/summary/` | Control detail header — could replace the parallel `get*` queries we do to resolve names |
| `/core/programs/{uuid}/sections/` | Embedded sections in Program detail (instead of `?program=` filter) |
| `/core/programs/{uuid}/restore/` | Soft-delete restore — no restore action in the UI yet |
| `/core/sections/{uuid}/controls/` | Section detail — controls tab |
| `/core/sections/{uuid}/reports/` | Section detail — accounting reports tab |
| `/core/sections/{uuid}/teams/` | Section detail — teams tab |
| `/core/steps/{uuid}/procedures/` | Step detail (no detail page yet) — reverse lookup |

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
  `client_id`, `client_secret`, `otp`.

---

## 6. Unresolved: file uploads

Backend defines `Document` with a `file` field. The frontend's `<FileDropzone />`
component uploads `multipart/form-data` to `/core/documents/`. **Verified path
exists** (returns 401 unauth). The actual content-type and field shape need to
be verified with a real authenticated POST.

Programs (`media_file`) and AccountingReports (`acknowledge_receipt`) also have
file-attached fields per swagger. Frontend currently sends JSON-only create
payloads for both. If the backend serializer requires a file at creation time,
those create endpoints will reject — patch needed.

---

## 7. No permissions endpoint

Backend has **no `/accounts/permissions/`** route. The frontend
`/permissions` page is a deferred-state card. Decide whether to model
permissions backend-side or rely entirely on Django's built-in
`User.user_permissions` + groups.

---

## Maintenance

Re-run this audit whenever the backend changes:

```bash
curl -s 'http://localhost:8000/swagger/?format=openapi' > openapi.json
node -e "const s=require('./openapi.json'); console.log(Object.keys(s.paths).sort().join('\\n'))"
```

Then diff against the URL strings in `src/redux/features/*/`.
