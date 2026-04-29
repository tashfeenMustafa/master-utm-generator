# Master UTM Generator - Agent Guidelines

## Strategic Context

**Brand Tagline:** "Stop Guessing Why Your Numbers Don't Match"
**Positioning:** UTM naming consistency tool for teams that care about attribution
**Dual ICP:** Build for ICP B (marketing ops, $15-39/mo), market to ICP A (small business owners)

See `.claude/STRATEGY.md` for full strategic vision and `.claude/COPY_STYLE_GUIDE.md` for tone/voice.
See `.claude/CONTEXT.md` for current version status (V1 vs V2).

## Commands
*   **Dev server:** `npm run dev`
*   **Build:** `npm run build`
*   **Lint:** `npm run lint`
*   **Test:** `npm run test`

## Architecture Reference

### Current Version (V1)
- **Status:** Single-user, `localStorage`-based
- **See:** `.claude/ORGANIC_PAGE_REDESIGN.md`, `.claude/PHASE_2_FEATURES.md`
- **Data:** `src/lib/storage.ts`, `src/lib/types.ts`

### Planned Version (V2 - Multi-Tenant)
- **Status:** Architecture complete, implementation roadmap ready
- **See:** `.claude/ARCHITECTURE_V3.md` (complete specification: 13+ tables, REST API with 30+ endpoints, 5 implementation phases)
- **Database:** PostgreSQL (Supabase), team-based with Row-Level Security (RLS)
- **Auth:** Magic links + OAuth 2.0
- **API:** 30+ endpoints for programmatic access
- **When starting V2 implementation:** Follow the phase roadmap in ARCHITECTURE_V3.md

## Coding Standards (V1 & V2 Compatible)
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 + shadcn/ui (Indigo palette)
*   **V1 Storage:** `localStorage` via custom wrapper (`lib/storage.ts`)
*   **V2 Storage:** PostgreSQL via Supabase client (use REST API layer)
*   **Colors:** Primary = Indigo (#4F46E5). See `DESIGN_SYSTEM.md`

## Coding Standards
*   **Strict Typing:** Always type components, props, and states explicitly.
*   **Components:** Prefer `"use client"` directive for interactive components. Standardize on function components.
*   **File Structure:** Follow Next.js App Router conventions (`page.tsx`, `layout.tsx`). Use the `@/` alias for root imports.
*   **Styling:** Use `cn()` utility for conditional Tailwind classes. Use indigo palette only (no hardcoded colors).
*   **Testing:** Write unit tests for all new features using Vitest and React Testing Library (`*.test.tsx`).
*   **Copy:** Use plain English, avoid jargon. Refer to `.claude/COPY_STYLE_GUIDE.md` for exact wording.

## Design & Branding
*   **Color Palette:** Indigo primary (#4F46E5), green success (#10B981), red destructive (#EF4444)
*   **Typography:** Inter (headings + body), Geist Mono (code/URLs)
*   **Component themes:** Indigo-based. See `DESIGN_SYSTEM.md`
*   **Sidebar:** Dark (#0F172A), indigo accent on active/hover
*   **No hardcoded colors:** All colors via Tailwind classes

## Copy Standards
*   **For ICP B:** Professional, efficiency-focused, data-driven language
*   **For ICP A:** Helpful, non-judgmental, plain English (no UTM jargon)
*   **Field labels:** "Campaign" not "utm_campaign", "Post Type" not "utm_content"
*   **Button text:** "Create a Tracking Link" not "Generate UTM Link"
*   **Help text:** Always include concrete examples
*   **Tone:** Human-first, helpful, action-oriented
*   **V1 forms:** Use `UtmGeneratorForm` from `src/components/organic/`
*   **V2 forms:** When building V2, follow naming conventions from ARCHITECTURE_V3.md Part 6

## API & Database Patterns (V2)
When implementing V2:
*   **Database:** Use Supabase client for queries (type-safe via generated types)
*   **Row-Level Security (RLS):** All queries must filter by `team_id` to prevent data leakage
*   **API routes:** Use JWT token from `Authorization: Bearer <token>` header
*   **API keys:** Validate `x-api-key` header for API-only clients
*   **Team context:** Always pass `team_id` from authenticated session
*   **Soft deletes:** Use `deleted_at IS NULL` filters instead of hard deletes

## Safety
*   **Brand:** Standalone as **Master UTM Generator** - never "UTM Gen", never Get Levrg references
*   **Credentials:** Do not hardcode or commit API keys, OAuth secrets, or Supabase keys
*   **Messaging:** All copy must align with brand positioning - see `COPY_STYLE_GUIDE.md`
*   **Data isolation:** V2 uses RLS; verify all queries include team_id filter
*   **Auth tokens:** Store JWT in httpOnly cookie (V2); never in localStorage
