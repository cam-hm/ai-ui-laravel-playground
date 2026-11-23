# ai-ui-laravel-playground

Demo app for the aiui harness: Laravel 13 + Inertia 3 + React 19 (TypeScript, Tailwind CSS v4, shadcn/ui)
with Fortify authentication and SQLite. Built from the Laravel React starter kit.

## Conventions
- Routes: `routes/web.php`. Pages for signed-in users go inside the `auth` + `verified` middleware group.
  Use controllers in `app/Http/Controllers` and Form Requests for validation; authorize access to records
  that belong to a user (a user must never see or change another user's data).
- Data: migration + Eloquent model + factory for every new table. When a new page would be empty for the
  seeded account, add demo data for it in `database/seeders/DatabaseSeeder.php`. The seeded account
  `test@example.com` / `password` must keep working.
- Pages: Inertia pages in `resources/js/pages`. Signed-in pages get the app layout automatically and set
  `Page.layout = { breadcrumbs: [...] }` (see `pages/dashboard.tsx`). Add main navigation entries to
  `mainNavItems` in `resources/js/components/app-sidebar.tsx`.
- UI: reuse the components in `resources/js/components/ui` (shadcn/ui) and icons from `lucide-react`.
  Support the dark theme the app already has (use the theme's color tokens, not fixed colors).
- URLs: use the Wayfinder helpers generated from routes (`@/routes`, `@/actions`) instead of hard-coded paths.
- Tests: PHPUnit feature tests in `tests/Feature` (see `DashboardTest.php`). Every new route gets tests for
  guests being redirected, validation, the happy path, and access to other users' records.

## Commands
- First setup: `composer setup`
- Build: `npm run build` · Types: `npm run types:check` · Tests: `php artisan test`
- PHP formatting: `vendor/bin/pint`
