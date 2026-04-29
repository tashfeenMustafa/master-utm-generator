# Master UTM Generator — .claude Documentation Index

This folder contains strategic, design, and implementation guidance for the Master UTM Generator project.

## Quick Navigation

### 📋 Strategic Documents (Read These First)
- **[STRATEGY.md](STRATEGY.md)** — Dual ICP positioning, GTM approach, feature priorities, success metrics
- **[COPY_STYLE_GUIDE.md](COPY_STYLE_GUIDE.md)** — Brand voice, tone, key messages, field labels, specific copy examples
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** — Indigo color palette (v2), typography, components, accessibility specs

### 🎨 UX & Product Documents
- **[ORGANIC_PAGE_REDESIGN.md](ORGANIC_PAGE_REDESIGN.md)** — Onboarding flow, empty state, field copy, component specs
- **[DASHBOARD_DESIGN.md](DASHBOARD_DESIGN.md)** — Home page mockup, stat cards, quick access, integration status
- **[PHASE_2_FEATURES.md](PHASE_2_FEATURES.md)** — Detailed specs for QR codes, health checker, value library, custom params, branding refresh

### 🛠️ Technical & Agent Guidelines
- **[CLAUDE.md](CLAUDE.md)** — Commands, architecture, coding standards, brand guidelines (agent instructions)
- **[CONTEXT.md](CONTEXT.md)** — Project overview, milestones, file locations, technical stack
- **[REFERENCES.md](REFERENCES.md)** — Data models, TypeScript interfaces, API routes

---

## Key Strategic Insights

### The Core Insight
**Build for marketing ops people (ICP B). Market to non-technical users (ICP A) via content.**

- **ICP B (Primary Revenue):** Marketing ops, agencies, $15-39/mo, need UTM consistency
- **ICP A (Content Audience):** Small business owners, free → freemium, attracted via education

### Brand Positioning
**Tagline:** "Stop Guessing Why Your Numbers Don't Match"
**Sub:** "Build, store, and enforce UTM naming conventions across your whole team — without the spreadsheet chaos."

### Phase 2 Priorities (Next 3 Weeks)
1. QR Codes (2h) — Every link gets scannable QR for social sharing
2. Organic Page Redesign (6h) — Onboarding flow, plain English, examples
3. Dashboard (3h) — Home page with stats and quick access
4. UTM Health Checker (3h) — Free tool, SEO lead magnet
5. Shareable Value Library (4h) — Export/import + read-only share links
6. Custom UTM Parameters (4h) — Define custom params with types
7. Branding Refresh (4h) — Green → Indigo, modern design

### Color Palette (v2)
- **Primary:** Indigo (#4F46E5) - modern, trustworthy
- **Success:** Green (#10B981) - checkmarks, confirmations
- **Destructive:** Red (#EF4444) - delete, errors
- **Typography:** Inter (headings + body), Geist Mono (code)

---

## How to Use These Documents

### If You're...

**Implementing a feature:**
1. Read the feature spec in `PHASE_2_FEATURES.md`
2. Check `DESIGN_SYSTEM.md` for color/component guidance
3. Reference `COPY_STYLE_GUIDE.md` for field labels and help text
4. Follow code standards in `CLAUDE.md`

**Writing copy (UI text, marketing):**
1. Start with `COPY_STYLE_GUIDE.md` for tone and key messages
2. Check examples for your context (ICP A vs ICP B)
3. Use field label mapping table for consistency
4. Avoid jargon - use plain English

**Designing UI:**
1. Start with `DESIGN_SYSTEM.md` for colors, typography, spacing
2. Reference component specs (buttons, cards, inputs, etc.)
3. Check `ORGANIC_PAGE_REDESIGN.md` for page layouts
4. Check `DASHBOARD_DESIGN.md` for dashboard components

**Planning next sprint:**
1. Read `STRATEGY.md` for context and success metrics
2. Reference `PHASE_2_FEATURES.md` for feature specs and timelines
3. Check `PHASE_2_FEATURES.md` for "Not in Phase 2" (what to defer)

---

## Document Hierarchy

```
STRATEGY.md (Why + What)
    ↓
COPY_STYLE_GUIDE.md (How to talk about it)
    ↓
DESIGN_SYSTEM.md (How to design it)
    ↓
PHASE_2_FEATURES.md (What to build)
    ↓
ORGANIC_PAGE_REDESIGN.md + DASHBOARD_DESIGN.md (Specific page specs)
    ↓
CLAUDE.md (Code standards to implement)
    ↓
PRD.md (Authoritative product requirements - keeps overall alignment)
```

---

## File Locations

### Pages
- `src/app/dashboard/page.tsx` — New dashboard home
- `src/app/organic/page.tsx` — Master spreadsheet
- `src/app/settings/values/page.tsx` — Value management
- `src/app/settings/connections/page.tsx` — Integrations

### Components (Phase 2 to Create)
- `src/components/dashboard/` — Stat cards, chart, recent links, quick actions
- `src/components/organic/intro-section.tsx` — Onboarding guidance
- `src/components/organic/qr-preview.tsx` — QR code display
- `src/components/settings/custom-parameters.tsx` — Custom UTM params UI
- `src/app/health-checker/page.tsx` — Free tool page

### Libraries
- `src/lib/utm/` — UTM validation, health check, custom params
- `src/lib/qr/` — QR code generation
- `src/lib/storage.ts` — localStorage wrapper
- `src/lib/google/` — Google Sheets OAuth and API
- `src/lib/airtable/` — Airtable API helpers

---

## Success Metrics (Phase 2)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Signups** | 50+ | Analytics |
| **Free-to-Pro conversion** | 5-10% | Database |
| **Paying customers** | 5-10 | Stripe/Paddle |
| **Educational content views** | 1K+ | Blog/Twitter analytics |
| **Dashboard bounce rate** | <50% | Analytics |
| **First link creation time** | <2 min | User testing |

---

## Important Rules

### Branding
✅ **"Master UTM Generator"** — Correct
❌ **"UTM Gen"** — Avoid
❌ **"Get Levrg"** — Absolutely not (separate project)

### Copy
✅ **"Create a Tracking Link"** — Friendly, clear
❌ **"Generate UTM Link"** — Too technical
✅ **"Campaign"** — Plain English
❌ **"utm_campaign"** — Jargon
✅ **"Plain English help text with examples** — Good
❌ **"Technical API documentation style"** — Not for UI

### Colors
✅ **Indigo (#4F46E5) for primary actions** — V2 standard
❌ **Green (#248234) for primary** — Old, replace everywhere
✅ **Green (#10B981) for success** — Keep this
❌ **Hardcoded hex in components** — Use Tailwind classes only

---

## Getting Started (New Developer)

1. **Read STRATEGY.md** (10 min) — Understand the "why"
2. **Read DESIGN_SYSTEM.md** (10 min) — Learn the visual language
3. **Read COPY_STYLE_GUIDE.md** (10 min) — Learn the voice
4. **Read CLAUDE.md** (5 min) — Understand code standards
5. **Pick a feature from PHASE_2_FEATURES.md** — Start building

---

## When to Update This Documentation

- **After shipping a feature:** Update `progress.txt` with what was built
- **After strategy changes:** Update `STRATEGY.md` immediately
- **Design system tweaks:** Update `DESIGN_SYSTEM.md`
- **New feature added to roadmap:** Add to `PHASE_2_FEATURES.md`
- **Copy guidelines changing:** Update `COPY_STYLE_GUIDE.md`

---

## Questions?

- **"How should I name this component?"** → See CLAUDE.md
- **"What should this button say?"** → See COPY_STYLE_GUIDE.md
- **"What color should this be?"** → See DESIGN_SYSTEM.md
- **"Should I build this now?"** → See PHASE_2_FEATURES.md
- **"Who's our customer?"** → See STRATEGY.md
