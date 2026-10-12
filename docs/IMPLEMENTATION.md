# Koryx implementation

The screenshot and koryx.ca belong to `tyomka0123-design/saas-website`, Vercel project `saas-website`. The initial local ZIP and `koryx-web` repository are a different older website serving www.koryx.ca.

The local source now uses the exact saas-website components, logo, styles, and animations from commit 0a7d08c. Text changes explain Koryx custom website, SaaS, and software services. Unverified client endorsements are replaced with service information and FAQs in the same layouts.

Original source backup: /private/tmp/koryx-source-before-2026-10-11.tar.gz. Database export is stored in .private-backups, excluded from version control. Database migration completed on 2026-10-11. Existing source account and profile preserved (1 auth user, 1 profile, 0 orders). Eleven scanner tables and their data were moved to the access-restricted scanner_archive_20261011 schema. The source project is paused and its data preserved; the target project is active.

Supabase source: Artem's projects / koryx (dvvcvexrfivggfxybsxp). Target: Bot Telegram / pump-ai-scanner (aroutopmhmeaqqnrhcaf). Preserve existing accounts and recoverable target data. The project's supplied schema.sql is a reference, not a migration: do not execute its placeholder JWT-secret statement or recursive profile policies.

Production publication explicitly approved by the owner on 2026-10-11.

## Verification and publication

GitHub PR: https://github.com/tyomka0123-design/saas-website/pull/13
Preview: https://saas-website-git-koryx-services-065206-artems-projects-fbeb048a.vercel.app

All 22 changed GitHub files were byte-compared with the local checked source. TypeScript and the production build passed. Vercel deployment 4a98376 is Ready. Existing ESLint errors remain in the reference dashboard/UI components (18 errors, 25 warnings); no lint suppression was added. The browser viewport override did not change the Chrome viewport, so mobile browser QA is not claimed. The original responsive classes were preserved.

Branch-specific Vercel Preview variables and local .env.local use the target Supabase URL and existing project keys. The service role key is server-only and stored as a Vercel Secret. Production uses KORYX_SUPABASE_URL and KORYX_SUPABASE_ANON_KEY (Config), mapped into the corresponding public Next.js variables at build time. SUPABASE_SERVICE_ROLE_KEY is updated to the target project and remains a Vercel Secret. Legacy public variables are retained for recovery but are overridden by the production mapping. Official SDK checks passed for target authentication/profile/order counts; anonymous orders access is denied. Transactional RLS checks passed for own-data access, cross-client isolation, role escalation, forged payment insertion, client payment changes, and anonymous access. Test users and orders were rolled back.

This work preserves the original website design and changes service messaging, links, and branding, with database migration and connection. The earlier full proposal/payment/dashboard transformation is not implemented. The reference login password-reset link is still a placeholder; Stripe, email notifications, complete proposals/milestones and live payments need separate implementation/configuration. Do not advertise these as enabled.

## Production publication

PR #13 merged into main at b8fcd9d. Vercel production deployment 4wvjsbYMiPxKwVvVPYUsRPKqn1ek is Ready and serves https://koryx.ca. Local Webpack production build with the target aliases and TypeScript passed. The local Turbopack CSS worker was blocked from binding its port by the execution environment; Vercel Turbopack builds passed.

Production homepage, login, and registration returned HTTP 200. Unauthenticated dashboard requests redirect to login. The login form returns the expected incorrect-credentials error for a synthetic invalid account. The corresponding 17:21:16 Supabase log shows the server POST to aroutopmhmeaqqnrhcaf /auth/v1/token (400 for intentionally invalid credentials), confirming production targets the migrated database. No browser console errors were captured, and the service role key was absent from the 18 fetched public bundles. No real account sign-in was attempted because the owner's password was not provided. Supabase Site URL is now https://koryx.ca.

www.koryx.ca was moved from koryx-web to saas-website and configured as a 308 redirect to koryx.ca. Verified /login redirects to https://koryx.ca/login, preserving the path. The previous repository and deployment were retained.

## Service website update — 11 October 2026

Published the expanded Koryx service website in PR #14:
https://github.com/tyomka0123-design/saas-website/pull/14
Merged main commit: cda2963faed41038ad9e483fb932fba6dfcac359.
Production deployment: Hq8gURkTTwhfC1QfE2Zc8KztqkTU (Ready, main).
A production rebuild of the preview was also published while GitHub's mergeability computation was pending; main was merged and deployed afterward with the same source contents.

The homepage now explains commissioned websites, applications, software, integrations, and individual features. Removed the old analytics/log and collaboration placeholders from the homepage. Added original labeled browser design concepts, eight service destinations, animated network/security/integration/browser-stack illustrations, process, scope-based project pricing, and expandable FAQ. Kept the existing monochrome brand, logo, grid hero, and Geist fonts.

Navigation now uses service pages, /work, /process, /pricing, and /faq. Services share the same header and footer. All legacy Apex Studio strings were replaced across application source. Dashboard branding uses the existing Koryx logo. Metadata uses a rounded black Koryx SVG icon at /icon.svg?v=2.

Project CTAs use /dashboard/new-order. Anonymous users are redirected to login with the destination. Login accepts only an explicit allowlist of dashboard destinations; new registrations continue to login then the project form. The form now includes SaaS, custom software, and integration/feature categories. Removed the nonfunctional reset-password link from login; a password recovery workflow is not implemented by this update.

Validation: production Webpack build and TypeScript passed; targeted ESLint for changed marketing/auth/order components passed. Vercel preview and production builds passed. All 26 changed files were byte-compared against the remote branch, and the main source tree matches that branch after merge. Checked all public navigation/service routes and favicon on production (200), and anonymous project redirect. Checked actual 390px mobile homepage, menu, service navigation, and concept page using the in-app browser; no horizontal overflow. Chrome viewport override did not apply and was reset; the in-app browser override was also reset. Existing signed-in owner session opened the production project form with the updated Koryx logo. No real project submission or credential change was performed. Database credentials, schema, and data remain the prior migrated target.

Security claims describe provider-backed DDoS mitigation and scoped protections, not an attack-proof guarantee. Source: https://vercel.com/docs/vercel-firewall/ddos-mitigation.
Design concepts are illustrative original examples, not claimed client work.

Screenshots: koryx-studio-production.png, koryx-studio-mobile.png, koryx-studio-work.png.


## Budget planner and workspaces — 11 October 2026

Published the complete workspace change in PR #15 and AI-provider refinement in PR #16:
https://github.com/tyomka0123-design/saas-website/pull/15
https://github.com/tyomka0123-design/saas-website/pull/16
The first verified production AI release is main e0d1c3d5e4b4f4c79037c20c8df469d20b0a7059, deployment ALXYVFF7BZw4AtQ7FoxwrZsv3TR9 (Ready). All 43 initial files were byte-compared with the published branch.

The owner confirmed CAD budgets of $500 / $1,500 / $3,000 / $5,000+. Public pricing and the five-step planner share the rate catalogue. Budget fitting suggests optional scope, does not reduce the calculated price artificially, and avoids adding payment features explicitly excluded in the brief. Applications include core accounts/dashboard; stores include hosted checkout. Extra pages, dependencies and complex workflow allowances are itemised. Every estimate is indicative; taxes, hosting, domains and API subscriptions are separate.

AI uses the existing AI_GATEWAY_API_KEY, without revealing or rotating it. The default scope model is openai/gpt-4o-mini; KORYX_ESTIMATE_MODEL can override it. A real signed-in production request succeeded, returning a scope review and CAD $2,700 for a five-page site with booking and signature animation under a $3,000 budget. The request contained a fictional brief, no contact details. The verification brief was not submitted as an order. A prior Gemini request returned a provider 403; GPT-4o mini succeeded with the same existing key and permissions. Provider logs contain only error class/status and coarse flags. No credentials, brief, response body or contact data are logged.

AI reviews complexity and scope; catalogue code calculates prices. Authenticated estimates are bound to the user, normalised scope and one-hour expiry with an HMAC signature. Order submission verifies the signature or recomputes a calculator estimate, derives ownership from authentication, and cannot insert client-supplied payment/quote/internal-note flags. Zod validates scope and contact input. The 15-second per-user throttle is per server instance, not a distributed quota. No automatic AI credit purchases or replenishment were enabled.

Client pages now show actual projects, six-stage journeys, saved scope/estimates, agreed quotes, invoice/payment records and editable account names. Founder control has a pipeline, filtered list, clients, search, CSV export, project review drawer, quote/status updates and private notes. Founder access checks the immutable owner ID before using a server-only service client. Existing legacy projects remain readable. Invoice and payment flags record manual actions; the application does not charge cards or send invoices automatically. Password recovery remains outside this update.

Applied supabase/20261011-workspace-privacy.sql to the active target after deployment. Result: client_can_read_internal_notes=false, client_can_read_legacy_password=false, client_can_read_own_brief=true. Existing RLS remains active; no rows were changed or deleted by this migration. Both KORYX public aliases are now scoped to Production and Preview. The service key remains server-only. Real owner overview, client detail and founder project drawer loaded after the grant change; the existing owner-created legacy project was preserved without edits.

Replaced the static homepage work previews with original interactive NEXUS operations/security, ORBIT commerce and STUDIO booking concepts inspired by the two supplied recordings. Charts, traffic simulation, product finishes, demo basket and demo reservation controls work. All operational data and interactions are clearly labelled as demonstrations, not real client evidence or real bookings/payments. Retained the monochrome Koryx identity, logo, grid hero and rounded favicon.

Validation: production Webpack build, TypeScript, targeted ESLint and planner/security/submission tests passed. Desktop and actual 390px mobile QA covered planner steps, budget fitting, demo controls, synthetic founder review UI and overflow. The temporary development QA route was removed before the final build and publication. Public homepage/pricing return 200; anonymous AI requests return 401; login redirection preserves budget/type. No real credentials were changed or real orders submitted during verification. The pre-existing development server was left running; temporary viewport overrides were reset.

AI SDK structured output: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
Model reference: https://vercel.com/ai-gateway/models/gpt-4o-mini
