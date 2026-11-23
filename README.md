# ai-ui-laravel-playground

Test target for the [aiui harness](https://github.com/cam-hm/ai-ui-developer): a full-stack Laravel 13 +
Inertia 3 + React 19 app (Fortify sign-in, registration, password reset, email verification; SQLite),
generated from the Laravel React starter kit.

- `.aiui.json` tells the harness how to set up, build, test and serve the app in its sandbox.
- `CLAUDE.md` holds the conventions the agent follows.
- Issues labeled `aiui` are implemented by the agent as draft pull requests (nothing is merged automatically).

Local setup: `composer setup`, then `composer dev`. Seeded account: `test@example.com` / `password`.
