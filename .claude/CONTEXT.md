# Project Context: Master UTM Generator

## Strategic Overview

**Brand Tagline:** "Stop Guessing Why Your Numbers Don't Match"

**Core Insight:** Build a team tool (for marketing ops) but market it via educational content for non-technical users. Dual-motion GTM.

**ICP B (Primary Revenue):** Marketing ops managers, agencies managing 3-8 clients. $15-39/mo price point. Problem: UTM naming inconsistency across team.

**ICP A (Content Audience):** Non-technical small business owners. Free tier + freemium upsells. Attracted via UTM education, QR codes, health checker tool.

See `.claude/STRATEGY.md` for full strategic vision.

## Product Status

### V1: Single-User localStorage Edition (Complete ✅)
**Status:** Production, actively used. Storage: `localStorage`.

- Core UTM generator (organic, warm/cold DM, blog channels)
- Value library management (campaign, term, content from Sheets/Airtable)
- Google Sheets & Airtable sync for dropdown values
- Master spreadsheet view with filtering, search, grouping
- CSV export
- Result card with copy-to-clipboard

**V1 Phase 2 In Progress (🚀):**
- QR codes — Generate scannable QR per link
- Organic page redesign — Onboarding flow, plain English copy, empty state guidance
- Dashboard — Home page with stats, quick access, recent links, integration status
- UTM health checker — Free tool (SEO lead magnet)
- Shareable value library — JSON export/import + read-only share links
- Custom UTM parameters — Define custom params with type validation
- Branding refresh — Indigo palette, modern typography

### V2: Multi-Tenant Team Platform (🏗️ Planned - See ARCHITECTURE_V3.md)
**Status:** Architecture designed, implementation roadmap ready. Storage: PostgreSQL (Supabase).

**V2 Overview:**
- Team-based architecture with multi-user support and RBAC (4 roles: Admin, Editor, Creator, Viewer)
- Magic link authentication (no passwords) + OAuth 2.0 integration
- PostgreSQL database with Row-Level Security for data isolation
- REST API (30+ endpoints) for programmatic access
- OAuth 2.0 integrations: Google Ads, Meta, LinkedIn, TikTok, Google Sheets, Airtable, HubSpot, GA4, Slack
- Naming conventions feature with validation rules + auto-formatting
- Advanced analytics: link click tracking, campaign performance, team activity logs
- Complexity modes: Simple (default UI), Team Standard, Advanced, Programmatic (API-only)
- QR codes + vanity URL support
- Soft delete pattern for data recovery

**V2 Implementation:** 5 phases, 10 weeks (see `ARCHITECTURE_V3.md`):
- **Phase 1 (Week 1-2):** Auth + Teams foundation
- **Phase 2 (Week 3-4):** Links, UTM parameters, naming conventions
- **Phase 3 (Week 5-6):** Google Ads, Meta, LinkedIn, TikTok integrations
- **Phase 4 (Week 7-8):** API endpoints + advanced UI
- **Phase 5 (Week 9-10):** QR codes, analytics, notifications, launch prep

## Technical Context

### V1 Stack (Current Production)
*   **Framework:** Next.js 15 (App Router)
*   **Rendering:** Client-side SPA (no SEO, highly interactive)
*   **Styling:** Tailwind CSS v4 + shadcn/ui (Indigo palette)
*   **Storage:** `localStorage` with typed wrapper (`lib/storage.ts`) + cross-tab sync
*   **Table:** TanStack Table v8 for master spreadsheet
*   **Integrations:** Google Sheets OAuth, Airtable PAT (read-only value lists)
*   **Tests:** Vitest + React Testing Library (comprehensive coverage)

### V2 Stack (Planned - See ARCHITECTURE_V3.md)
*   **Frontend:** Next.js 15 (App Router) + React Query (data fetching)
*   **Backend:** Next.js API routes
*   **Database:** PostgreSQL via Supabase (managed free tier for MVP)
*   **Auth:** Supabase Auth (magic links + OAuth 2.0)
*   **API:** REST API with JWT tokens + API keys for programmatic access
*   **Integrations:** OAuth 2.0 for Google Ads, Meta, LinkedIn, TikTok, etc.
*   **Styling:** Same Tailwind + shadcn/ui (no changes)
*   **Tests:** Same Vitest + RTL (plus integration tests for API)

## Key File Locations

### V1 Documentation (Current)
- `.claude/STRATEGY.md` — Strategic vision and GTM approach (applies to both V1 and V2)
- `.claude/DESIGN_SYSTEM.md` — Color palette, typography, components (Indigo, shared across versions)
- `.claude/COPY_STYLE_GUIDE.md` — Voice, tone, messaging for ICP A/B (applies to both versions)
- `.claude/ORGANIC_PAGE_REDESIGN.md` — V1 UX overhaul specs (QR codes, dashboard, etc.)
- `.claude/PHASE_2_FEATURES.md` — V1 Phase 2 feature specs with timelines
- `.claude/DASHBOARD_DESIGN.md` — V1 dashboard mockup and components
- `.claude/CLAUDE.md` — Agent guidelines (references ARCHITECTURE_V3.md for V2 context)
- `.claude/REFERENCES.md` — Data models for V1 (localStorage) and V2 (PostgreSQL schema)

### V2 Documentation (Planned)
- `.claude/ARCHITECTURE_V3.md` — Complete V2 architecture: database schema, API design, auth flows, 5-phase implementation roadmap (10 weeks)
- `.claude/CONTEXT.md` — This file; clarifies V1 vs V2 positioning

### Source Code (V1)
- `src/app/` — Pages (organic, ads, settings, dashboard, health-checker)
- `src/components/` — UI components (organized by feature: organic, settings, layout, dashboard)
- `src/lib/` — Utilities (storage, UTM config, Google/Airtable APIs, validation)

## Recent Milestones (Phase 1 Complete)
1. ✅ Project scaffolding & design system (green theme v1)
2. ✅ `localStorage` data layer with TypeScript
3. ✅ UTM generation form (organic, DM, blog)
4. ✅ Result card with copy-to-clipboard
5. ✅ Master spreadsheet with TanStack Table
6. ✅ Google Sheets connection (OAuth)
7. ✅ Airtable connection (PAT)
8. ✅ CSV export
9. ✅ Full test suite (Vitest + RTL)

## Next Steps

### Immediate (V1 Phase 2 — Current Focus)
1. Update color palette (green → indigo) ✅
2. Redesign organic page (onboarding + better copy)
3. Add dashboard (home page with stats)
4. Generate QR codes (per link)
5. Build health checker (free tool)
6. Implement shareable value library
7. Custom UTM parameters support

See `.claude/PHASE_2_FEATURES.md` for detailed feature specs and timelines.

### After V1 Phase 2 Complete (V2 Migration — ARCHITECTURE_V3.md)
Once V1 Phase 2 is shipped and stable:
1. **Set up Supabase project** (free tier: 500MB + Auth + Storage)
2. **Phase 1 (Week 1-2):** Authentication + Teams foundation (magic links, OAuth, RBAC)
3. **Phase 2 (Week 3-4):** Links, UTM parameters, naming conventions (migrate from localStorage)
4. **Phase 3 (Week 5-6):** OAuth integrations (Google Ads, Meta, LinkedIn, TikTok)
5. **Phase 4 (Week 7-8):** API endpoints + advanced UI
6. **Phase 5 (Week 9-10):** QR codes, analytics, notifications, launch

See `.claude/ARCHITECTURE_V3.md` for complete 10-week roadmap with weekly breakdowns.
