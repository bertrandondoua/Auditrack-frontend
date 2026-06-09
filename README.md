# Auditrack Frontend

Web frontend for **Auditrack**, the audit & fraud-detection workflow platform used by the Chambre des Comptes du Cameroun. Operator UI for clerks, chief clerks, section presidents, magistrates, and the attorney general.

Pairs with [`Auditrack-api`](https://github.com/bertrandondoua/Auditrack-api) (Django REST). Successor to AITECAF's `greffe-webui`.

## Stack

- Next.js 14 (App Router) + TypeScript (strict)
- Tailwind CSS 3.4 + shadcn/ui (Radix primitives, "new-york" style)
- Redux Toolkit + RTK Query (the only API client)
- React Hook Form + Zod
- TanStack Table
- i18n via custom middleware (`fr` default, `en` available)

## Dev

```bash
cp .env.local.example .env.local   # then edit NEXT_PUBLIC_API_URL + client creds
npm install                        # installs husky pre-commit hook
npm run dev                        # http://localhost:3000
npm run typecheck                  # strict — build does NOT skip type errors
npm run lint                       # next lint + tightened rules
npm run lint:fix                   # autofix what can be autofixed
npm run format                     # prettier --write
npm run format:check               # used in CI
npm run build                      # production bundle
```

Pre-commit hook runs `lint-staged` (eslint --fix + prettier --write on staged
files). A CI workflow is shipped as `.github/ci.yml.template` — move it to
`.github/workflows/ci.yml` (via the GitHub web UI, or a `workflow`-scoped push)
to activate typecheck + lint + format-check + build on every PR.

## Backend mismatches

See [`BACKEND_MISMATCHES.md`](./BACKEND_MISMATCHES.md) for the current
Auditrack-api punch list — endpoints we hit that 404, workflow actions
the backend lacks, opportunities to use backend resources we don't yet.

## Conventions

- **Every route lives under `src/app/[lang]/`.** The middleware enforces locale + auth on every request.
- **API access goes through RTK Query** in `src/redux/features/<domain>/`. Don't `fetch` directly. The shared base in `src/redux/services/api.ts` attaches the OAuth2 bearer token from `localStorage["tokens"]` and force-logs out on 401.
- **Sidebar / nav config** lives in `src/configs/constants.ts` (`DashboardRoutes`). New routes that should appear in the sidebar must be registered here with their `roles` array.
- **Roles** (mirror `accounts.User.role` in the API): `clerk`, `chief_clerk`, `section_president`, `magistrate`, `attorney_general`, `it_manager`.
- **Forms:** React Hook Form + `zodResolver`. Infer the TS type from `z.infer<typeof schema>`. Use the shared `<FormField>` wrapper for label + input + a11y error wiring.
- **Path alias:** `@/*` → `src/*`. No deep relative imports.
- **Backend pagination:** 50 items per page (DRF default). Backend has `APPEND_SLASH = False` — match URLs exactly, don't blindly add trailing `/`.

## What changed vs. `greffe-webui`

- `next.config.mjs` no longer sets `typescript.ignoreBuildErrors` or `eslint.ignoreDuringBuilds`. Type errors now fail the build.
- Single Tailwind config (`tailwind.config.ts`). The stale `tailwind.config2.ts` is gone.
- `features/permission/` only — the `permision/` typo directory is gone.
- One canonical organisation route tree under `app/[lang]/(root)/organisations/`. The duplicate `organisme/` tree is gone.
- No `simple-datatables`. All tables use TanStack Table.
- No `"greffe-webui": "file:"` self-referential dep.
- Renamed package to `auditrack-frontend`.

## Layout

```
src/
  middleware.ts          locale + auth gate (runs on every request)
  i18n-config.ts         locales: ["en", "fr"], defaultLocale: "fr"
  app/
    [lang]/
      (auth)/            signin, forgot-password, verification
      (root)/            dashboard, control, configuration, organisations,
                         report, sanction, permissions, settings, support,
                         logs, account
      @breadcrumbs/      parallel route slot
      layout.tsx
      page.tsx
    globals.css
  components/
    ui/                  shadcn primitives + FormField
    shared/              layout, header, sidebar, dialogs, FileDropzone
    tables/              DataTable, ListPagination, RowActionsMenu
  features/<domain>/     composed feature components (columns, list, dialogs)
  redux/
    store.ts
    hooks.ts
    services/api.ts      RTK Query base — reads NEXT_PUBLIC_API_URL
    features/<domain>/   slices + endpoint definitions per domain
  configs/constants.ts   DashboardRoutes — single source of truth for sidebar
  hooks/                 useListPage, use-toast
  lib/                   utils, types, dictionaries, phone, api/params
  providers/             Redux provider
  types/                 domain types (User, Program, Control, …)
```
