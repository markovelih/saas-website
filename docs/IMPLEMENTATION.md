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


## Founder management and Resend billing — 11 October 2026

PR #18 merged at 7d91e64e06a81b20f8e463ab006ead6231f7b863. Production deployment E5hiGMUaQk1gN6Vyy1PLAvexgBdM is Ready on koryx.ca. All 32 published files, including Unicode fonts, match the validated source byte-for-byte. Production build, TypeScript, billing/planner tests and mobile form QA passed. Temporary QA page removed.

The immutable owner account lands in a dedicated Founder workspace with client accounts, all projects, and Billing & email. Assign existing/new work to registered client accounts, edit service quantities/prices, attach a private homepage preview and live URL, and manually set website/domain status, renewal dates and prices. Client views remain isolated to their own data. One founder account and two existing projects were preserved; no real payment was recorded during verification.

Applied supabase/20261012-manager-billing.sql to the active target. Payment recording is atomic and idempotent per project; saved CAD snapshots and paid quote/ownership are locked. Clients cannot execute settlement or forge attachment fields. Homepage previews are in a private bucket and served only to the authorized client/founder. Transaction-only integration fixtures rolled back; final audit confirmed 1 account, 2 projects and 0 payment records.

Owner-authorized Resend sending-only key Koryx billing is restricted to koryx.ca and stored only as server Secret RESEND_API_KEY in Vercel Production/Preview. Sender/reply email is support@koryx.ca. The single authorized TEST email (01a12ed0-af8c-7113-9f20-5ded3fe09391) was accepted and marked Delivered by Resend, with Invoice and Receipt PDF attachments. It created no project/payment. The actual delivered invoice was downloaded and rendered for inspection. Local PDF fixtures additionally verified Unicode, deterministic retry bytes and multipage receipts.

Documents use black Koryx branding on white, no taxes or postal addresses. Services calculate quantity times unit price, supporting pages and any custom service. Manual received-payment methods include USDT TRC20 and BTC. Email retry uses the same frozen document snapshot and Resend idempotency key with a safe retry window; ambiguous outcomes are reported rather than recorded as delivered. The UI email status indicates provider acceptance; delivery evidence is in Resend. Website/domain status remains owner-reported; renewal entries do not create automatic charges. Stripe is not connected.

## On-site payments and policy update — 2026-10-12

PR #28 is merged at 0274c90fbc2679c4b0c7e10ccc83d12750070794. All 26 changed files match main byte-for-byte. Vercel Production Afuz1Rp9uC743dUvCiEQXm6E6F6g is Ready and assigned to koryx.ca.

Checkout now uses the Endive embedded_page API and createEmbeddedCheckoutPage on Koryx. Billing addresses are required; verified billing details flow into saved receipt snapshots. Old hosted sessions are safely expired before replacement. Owner authorization, explicit consent, final-work approval, fixed invoice amount and signed webhook settlement remain enforced. Server actions reject checkout when publishable-key configuration is missing. Existing STRIPE_PUBLISHABLE_KEY is configured for Production, koryx.ca is registered as an enabled payment-method domain, and Stripe address autocomplete is enabled. Apple Pay is enabled in the dashboard. Cards currently show Ineligible during Stripe account review (dashboard estimate 2–3 days); no live payment or subscription was created or tested.

Added privacy, terms, cancellation/refund, and cookie preferences pages plus footer links and registration disclosures. Optional analytics are off by default and guarded by consent, including after withdrawal. Seller home address was not written to source, published, or added to PDFs. Current BC sections 18.2/18.3 and the Consumer Contracts Regulation were reviewed; old sections 19/46 have been repealed. Project-specific scope, supply/completion dates and delivery terms still need separate written agreement before payment. Policy pages do not establish comprehensive legal compliance across all jurisdictions. Tax is explicitly disabled pending the merchant’s applicable tax registrations and ledger configuration; lack of GST registration alone does not determine every PST or foreign tax obligation.

Automatic domain and hosting reminders now cover exact 30/3/1-day warnings with renewal price/date and cancellation instructions; subscribed domains do not receive a second manual-payment prompt. Cancellation/refund policies preserve mandatory rights rather than applying a blanket no-refund rule to consumer subscriptions.

Validation passed: final Webpack production build and TypeScript, targeted ESLint, payment/billing checks, mocked embedded checkout reuse/access tests and renewal notice tests. Local and live legal routes checked; actual 390 px mobile policy pages have no horizontal overflow. Live anonymous invoice navigation preserves /pay/<id> through the login redirect. Existing production tests did not create a charge or send mail. Temporary viewport overrides reset and local verification server stopped. Local Turbopack build failed because Google Fonts networking was restricted; the network-enabled Webpack build and Vercel build passed.

## Project chat and domain picker — local change, 2026-10-14

The project planner now opens domain search in a bottom sheet. Search uses the existing authenticated registrar endpoint and signed quote tokens. New domain prices use 1.65 times the CAD purchase cost, within the requested 1.5–1.8 range; issued invoices and existing managed-domain records are not automatically recalculated.

Project conversations are implemented at `/dashboard/chats`. The founder assigns a developer from the project details dialog. A confirmed development deposit or legacy project payment unlocks messaging; hosting-only charges do not. The assigned admin and immutable founder account can read the conversation, and unrelated clients/admins cannot. Public chat payloads contain first names, not account names/emails. Sending, own-message edits, soft deletion, staff message pins, private thread pins, replies, pagination, unread counts, read receipts and photo attachments have authenticated server routes and database authorization. Postgres Changes refreshes the UI, with a visible 15-second polling fallback. Photo uploads accept up to four JPG/PNG/WebP files at 4 MB each and re-encode them as WebP without EXIF metadata.

Apply `supabase/20261014-project-chat.sql` after the existing billing/payment migrations when connecting this feature to Supabase. It creates private chat tables and a private `project-chat` storage bucket. A restrictive Storage policy prevents a pre-existing permissive policy from exposing these files. Only the application’s authenticated attachment route streams photo bytes. The migration does not automatically assign any project to a developer or create/send messages for existing customers.

Local Supabase credentials are not configured in this checkout. `/workspace-review` is an explicitly labelled development-only UI test with synthetic data; production builds return 404 for it. Real account, live storage and cross-session Realtime verification still require a configured Supabase environment and applying the migration. No production deployment or database migration was performed for this batch.

Run `npm run test:workspace` for the isolated PostgreSQL authorization tests and domain/photo tests; they never connect to a customer database. `npm run build` and TypeScript validation also pass. `.env.local` contains only `KORYX_DEV_HOST` for the requested Wi-Fi preview. This opt-in dev origin has no effect on production or authentication.

### Project chat experience — local update, 14 October 2026

Chat rendering is memoized independently of the composer. Repeated thread opens use an in-memory cache, pointer hover prefetches first pages, network changes are coalesced, and duplicate read acknowledgements / concurrent page requests are suppressed. Text is optimistic, typing remains enabled during sends, drafts survive thread changes, photos upload in parallel, and failed photo sends retain their files for retry. Native scrolling follows the end only when the reader is already there; history prepends preserve position. These changes target responsiveness, not a guaranteed frame rate on every device. No private conversation is put in localStorage or a service-worker cache.

Names now come from profile first names in their original spelling, including the founder. The chat interface follows the workspace language (English by default). `koryx-workspace-language` persists the selection; the older founder cookie is still recognized for that account. kAI, the workspace AI assistant and the brief helper use the exact two-path Koryx favicon mark with theme-aware color, not sparkle icons.

Apply `supabase/20261014-project-chat-experience.sql` **after** `20261014-project-chat.sql`. The update adds client-only order-status events (RLS and RPC both exclude moderators), corrects historical first-name labels, provides read-receipt updates, and creates service-only push subscriptions plus a transactional outbox. Do not apply either migration to a production database as part of local UI review.

`/api/project-chats/[id]/assistant` checks membership before and after generation, limits requests per account, bounds recent text to 22,000 characters and omits photos, profile IDs, project briefs, billing and internal notes. kAI treats the transcript as untrusted content and follows the client's language for both analysis and drafts. Draft insertion never sends a message. Configure the existing `AI_GATEWAY_API_KEY` and optional `KORYX_CHAT_MODEL`; the provider still needs end-to-end validation with a configured non-production account. The local review's AI response is explicitly synthetic.

PWA manifest: Koryx, `/dashboard/chats` start URL, standalone display, 192/512 icons generated from `public/icon.svg`. Installed mobile workspaces have Chats / Projects / Account navigation (assigned staff have Chats / Account), safe-area spacing, and keyboard-aware layout. The compact chat menu explains browser installation and manages notifications. The first client visit recommends notifications using Enable / Later; native permission is requested only from a click. Dismissal is saved per account; blocked permissions are not repeatedly prompted.

Push configuration (not populated by this local change): `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (a matching persistent Web Push VAPID pair), plus the existing Supabase service key and `CRON_SECRET`. Never expose the private key. Developer message inserts enqueue a unique job; delivery runs after the send response, with leased retries at `/api/cron/chat-push`. The Vercel cron configuration retries each minute and requires hosting support for that cadence. Subscription endpoints are limited to established HTTPS push services to prevent arbitrary server-side requests. Gone subscriptions are removed, recipient ownership / current payment / assignment / message deletion are checked before sending, successful device receipts survive retries, and lock-screen payloads contain no conversation text or project name. Web Push is at-least-once; stable notification tags collapse duplicates if a worker is interrupted after a successful delivery.

The service worker handles only push and notification clicks, and never caches authenticated pages or APIs. [WebKit requires an installed Home Screen app on iOS and a user gesture for permission](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/). Local Wi-Fi HTTP can preview the interface but cannot exercise installation/push; verify actual delivery on HTTPS with an installed iPhone/Android app before release. Chat message IDs use `getRandomValues` as a Wi-Fi-preview fallback when `randomUUID` is unavailable ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)).

Validation: `npm run test:workspace` includes 46 database authorization/status/outbox checks, image/pricing checks, Web Push destination restrictions, AI transcript minimization, Wi-Fi ID generation, and service-worker navigation tests. Browser review covers English/Ukrainian, dark/light, 390px mobile layout, a compact installation sheet, no autofocus keyboard on menu open, cache/draft preservation, sending with simulated 800ms latency, and draft insertion without automatic send. Real accounts, generated AI output, native iOS keyboard behavior and actual remote push delivery remain unverified because this checkout has no Supabase/AI/VAPID credentials. The development-only `/workspace-review` is a confirmed 404 in production.
