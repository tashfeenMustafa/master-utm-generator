# V1 Phase 2 Features — Detailed Specs

**Version:** V1 Phase 2 (Single-user localStorage). For V2 (Multi-tenant), see `.claude/ARCHITECTURE_V3/` (modular docs).

## Overview

These are the highest-ROI features to build for V1 Phase 2 (current focus). Each is independently shippable.

**Timeline:** ~4-5 weeks (moved branding refresh to priority)
**Included Features:**
1. Branding Refresh (3 hours) ⭐ **DO THIS FIRST**
2. Organic Form UX + Naming Conventions (8 hours)
3. Source Type Management + utm_medium (4 hours)
4. Free Version Paywall UI (3 hours)
5. QR Codes (2 hours)
6. UTM Health Checker (3 hours)
7. Shareable Value Library (3 hours)

**Features Deferred (Phase 3):**
- ~~Dashboard~~ ✅ Shipped in Phase 2
- Bulk link generation
- Analytics tracking
- Browser extension
- Ad platform integrations
- **UTM Parameter Values Manager** — Full admin screen covering all five UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) for both Organic and Ads channels. Includes per-channel value lists, snake_case enforcement, duplicate detection, and JSON import/export. See `PRD.md §11` for full spec.

---

## Feature 1: Branding Refresh (3 hours) ⭐ PRIORITY

### Why
- **First impression matters:** Current green theme doesn't convey trustworthiness
- **Brand consistency:** Indigo palette aligns with Master UTM Generator positioning
- **Unblocks other work:** Later features inherit the new design system

### What to Build

1. **Tailwind color update** (30 min)
   - Update `tailwind.config.ts` with indigo palette from DESIGN_SYSTEM.md
   - Primary: Indigo (#4F46E5)
   - Ensure all contrast ratios meet WCAG AA

2. **Component refresh** (1.5 hours)
   - Button variants (primary → indigo, secondary unchanged, destructive → red)
   - Card borders (indigo-100 instead of green)
   - Badge colors (indigo-100 bg, indigo-700 text)
   - Input focus states (indigo border on focus)
   - Links (indigo-600 hover)
   - Success states (green-500 for checkmarks, unchanged)

3. **Page-level styling** (1 hour)
   - Sidebar (dark #0F172A, indigo accent on active)
   - Headings (ensure bold, readable hierarchy)
   - Text colors (muted → consistent gray scale)
   - Tooltips/popovers (indigo background)

### Files to Modify
- `tailwind.config.ts` — New color palette
- `src/app/globals.css` — CSS variables (if using any)
- `src/components/ui/button.tsx` — Primary variant color
- `src/components/ui/input.tsx` — Focus state color
- `src/components/ui/badge.tsx` — Background + text colors
- `src/components/ui/card.tsx` — Border color
- `src/components/ui/sonner.tsx` — Toast/notification colors
- `src/components/layout/sidebar.tsx` — Dark bg + indigo accent
- All page `.tsx` files — Remove any hardcoded green colors
- `src/components/organic/*.tsx` — Button/badge color refresh

### Acceptance Criteria
- [ ] Tailwind config updated with indigo primary
- [ ] All buttons display indigo primary color
- [ ] Input focus states are indigo
- [ ] All cards have indigo borders (or none if using fill)
- [ ] Links are indigo-600 with darker hover
- [ ] Sidebar dark with indigo highlight on active
- [ ] No hardcoded color values (all via Tailwind)
- [ ] All contrast ratios pass WCAG AA
- [ ] Mobile view looks consistent
- [ ] All existing tests pass (no functional changes)

### Timeline
- Implementation: 2.5 hours
- Testing & verification: 0.5 hours

---

## Feature 2: Organic Form UX + Naming Conventions (8 hours)

### Why
- **Current form is confusing:** Users need to read docs to use it
- **Naming conventions are powerful:** ICP B feature to enforce team standards
- **First-link success rate:** Clearer form = more users create first link

### What to Build

**See `.claude/ORGANIC_FORM_UX_IMPROVEMENT.md` for detailed UX flow.**

1. **Reorganize form into clear sections** (3 hours)
   - Section 1: "Where are you promoting?" (Source Type + Platform → derives utm_source + utm_medium)
   - Section 2: "What are you promoting?" (Campaign Name + Content Topic)
   - Section 3: "How is it being shared?" (Post Format + Content Hook → computed utm_content)
   - Section 4: "Where does it go?" (Base URL)
   - Section 5: "Your tracking link" (Result preview)
   - Create `FormSection` wrapper component for consistent styling

2. **Make utm_source/utm_medium editable** (1.5 hours)
   - Currently shown as read-only badges
   - Now show as fields users can edit
   - Derive from Source Type + Platform by default
   - Show inline: "Comes from your settings, but you can override"
   - Tooltip: "Manage defaults in Settings → Naming Conventions"

3. **Add naming rule displays** (2 hours)
   - Under each field, show the naming rule: "Must be snake_case", "Format: format-hook", etc.
   - Show live-formatted value as user types
   - Rules come from Settings → Naming Conventions
   - Validation uses these rules

4. **Link to Settings for convention management** (1.5 hours)
   - Add "Manage naming conventions" link in form
   - Navigates to new Settings → Naming Conventions page
   - (See Feature 3 below for convention settings UI)

### New Component Files
- `src/components/organic/form-section.tsx` — Wrapper with heading + description
- `src/components/organic/naming-rule-badge.tsx` — Shows rule + live value
- Update `src/components/organic/utm-generator-form.tsx` — Reorganize into sections

### Files to Modify
- `src/app/organic/page.tsx` — Update layout if needed
- `src/components/organic/utm-generator-form.tsx` — Major reorganization
- `src/components/organic/result-card.tsx` — Ensure QR integration works with new form
- `src/lib/types.ts` — May need to add naming convention types

### Acceptance Criteria
- [ ] Form organized into 5 clear sections
- [ ] Each section has descriptive heading + brief explanation
- [ ] utm_source + utm_medium are editable (not badges)
- [ ] Naming rule displays under each field
- [ ] Live formatted value shows as user types
- [ ] "Manage conventions" link navigates to Settings
- [ ] Form is understandable without reading docs
- [ ] Validation uses naming convention rules
- [ ] All existing tests pass (update snapshot tests for layout changes)

### Timeline
- Implementation: 6.5 hours
- Testing & refinement: 1.5 hours

---

## Feature 3: Source Type + utm_medium Management (4 hours)

### Why
- **ICP B needs flexibility:** Teams have different naming conventions
- **Custom sources:** Not everyone uses the 5 standard UTM values
- **utm_medium management:** Paired with utm_source, enables better control

### What to Build

**New Settings page: Settings → Source Types & Formats**

1. **Source Type management** (1.5 hours)
   - List all pre-made source types (Organic, Paid Ads, Social, Email, etc.)
   - Pre-made source types show: utm_source value + utm_medium value
   - "Add custom source type" button
   - Edit/delete custom source types
   - Each source type has:
     - Name: "LinkedIn Ads"
     - utm_source: "linkedin"
     - utm_medium: "paid_social" (or custom)
     - Associated platforms: Facebook, Instagram, LinkedIn, etc.

2. **utm_medium management** (1.5 hours)
   - List all utm_medium options (organic, paid_social, email, referral, etc.)
   - Pre-made options provided
   - "Add custom medium" button
   - Edit/delete custom medium values
   - Each medium is just a string value (e.g., "paid_social", "affiliate")

3. **Link source types to platforms** (1 hour)
   - Source type "Social" has platforms: Facebook, Instagram, LinkedIn, TikTok
   - Source type "Paid Ads" has platforms: Google Ads, Meta Ads, LinkedIn Ads
   - When user selects a source type in the form, platform dropdown updates

### Files to Create
- `src/app/settings/source-types/page.tsx` — UI for managing source types
- `src/components/settings/source-type-form.tsx` — Create/edit source type
- `src/components/settings/utm-medium-form.tsx` — Create/edit utm_medium values
- `src/lib/types.ts` — Add `SourceType`, `UtmMedium` types

### Files to Modify
- `src/lib/storage.ts` — Add source type + utm_medium storage
- `src/lib/utm-config.ts` — Update CHANNEL_TYPES to use source types from storage
- `src/app/settings/page.tsx` — Route to source types page
- `src/app/settings/layout.tsx` — Update sidebar/nav

### Acceptance Criteria
- [ ] Pre-made source types display correctly
- [ ] Can create custom source type
- [ ] Can edit/delete custom source types
- [ ] Pre-made utm_medium values display
- [ ] Can create custom utm_medium
- [ ] Can edit/delete custom utm_medium
- [ ] Custom sources appear in organic form dropdown
- [ ] Custom medium values available in form
- [ ] Platform list updates when source type changes
- [ ] All new values persist in localStorage
- [ ] All tests passing

### Timeline
- Implementation: 3 hours
- Testing: 1 hour

---

## Feature 4: Free Version Paywall UI (3 hours)

### Why
- **ICP A conversion:** Show what's locked so users know what to upgrade for
- **Feature announcement:** Paywall explains features they can't access yet
- **V2 readiness:** Prepares for multi-tier pricing model

### What to Build

1. **Paywall UI component** (1.5 hours)
   - Lock icon + semi-transparent overlay
   - Feature name + description
   - "Upgrade to unlock" button (navigates to upgrade page)
   - Example: Dashboard, Analytics, Team features

2. **Mark features as free vs. premium** (1 hour)
   - Create feature flag: `isPremium` in app config
   - Premium features in v1:
     - Dashboard (deferred to Phase 3, but marked as premium)
     - Analytics/tracking
     - Team features (Phase 3)
     - API access (Phase 3)
     - Custom themes (defer)

3. **Add localStorage + export reminder** (0.5 hours)
   - On organic page: "💾 Your data is saved locally. Upgrade to sync across devices."
   - Export button visible: "Export as CSV / Excel / Google Sheet"
   - Keep prominent and friendly (not scary)

### Files to Create
- `src/components/ui/paywall-overlay.tsx` — Reusable paywall UI
- `src/lib/feature-flags.ts` — Feature flag config
- `src/components/layout/premium-feature-banner.tsx` — Upgrade reminder

### Files to Modify
- `src/app/globals.css` — Add overlay styling
- Dashboard page → wrap with paywall-overlay
- Analytics page → wrap with paywall-overlay
- `src/components/organic/page.tsx` → add localStorage reminder

### Acceptance Criteria
- [ ] Paywall displays on premium pages
- [ ] Lock icon + description is clear
- [ ] "Upgrade" button is visible and clickable
- [ ] Free pages have localStorage reminder + export button visible
- [ ] Feature flags are centralized in config
- [ ] No hardcoded "premium" checks (all use feature-flags.ts)
- [ ] Export button works (CSV for now)
- [ ] All tests passing

### Timeline
- Implementation: 2.5 hours
- Testing: 0.5 hours

---

## Feature 5: QR Codes (2 hours)

### Why
- **ICP A loves this:** Non-technical users can't copy URLs. QR codes = share via WhatsApp, email, text
- **Viral content angle:** "Share your link via QR code" is a social media post in itself
- **Differentiation:** Competitors don't have this, it's a quick win

### What to Build
1. **Generate QR code per link** (on result card and table row)
   - Use `qrcode` npm package (2KB, fast)
   - Size: 200x200px for result card
   - Size: 100x100px for table cell (downloadable on click)

2. **Download / Copy QR code button**
   - "Download QR Code" → PNG image
   - Filename: `tracking_link_qr_2026-04-11.png`

3. **QR preview in result card**
   - Display QR code next to URL
   - "Scan or copy this link"
   - Two buttons: Copy URL | Download QR

### Files to Create
- `src/lib/qr/generate.ts` — QR generation helper
- `src/components/organic/qr-preview.tsx` — QR display component
- `src/lib/qr/generate.test.ts` — Tests (3-4 tests)
- `src/components/organic/qr-preview.test.tsx` — Tests (3-4 tests)

### Files to Modify
- `src/components/organic/result-card.tsx` — Add QR code section
- `src/components/organic/links-table.tsx` — Add QR code column (optional, toggleable)
- Update UtmLink type if needed (no changes required)

### Acceptance Criteria
- [ ] QR code generated for every link
- [ ] Download QR code as PNG
- [ ] Copy QR code to clipboard (canvas → blob → clipboard)
- [ ] Result card shows QR next to URL
- [ ] Table rows have optional QR code column
- [ ] QR code works when scanned (tested manually)
- [ ] All tests pass

### Timeline
- Implementation: 1.5 hours
- Testing: 0.5 hours

---

## Feature 2: Organic Page Redesign (6 hours)

### Why
- **Fixes the biggest UX problem:** Empty page is confusing
- **Increases first link creation rate** by 40%+ (guided onboarding)
- **Reduces support questions** with better copy and examples

### What to Build
1. **IntroSection component** (2 hours)
   - Collapsible header with example link
   - "Here's how it works" flow (3-step numbered list)
   - Dismissible (stays dismissed via localStorage)
   - ExampleLink sub-component showing truncated URL

2. **Updated form copy** (1 hour)
   - Replace all technical labels with plain English
   - Update tooltips with concrete examples
   - Change "Generate UTM Link" to "Create a Tracking Link" throughout

3. **Empty state improvement** (1 hour)
   - Add illustration (Undraw.co custom)
   - Better messaging ("Create Your First Tracking Link")
   - Expandable example section

4. **Result card enhancements** (1 hour)
   - Add QR code preview (integrate Feature 1)
   - Add "Share this link" message pre-fill
   - Improve visual hierarchy

5. **Mobile optimization** (1 hour)
   - Sticky action button (floating + top button)
   - Responsive table
   - QR code larger on mobile for scanning

### Files to Create
- `src/components/organic/intro-section.tsx`
- `src/components/organic/example-link.tsx`
- `src/components/organic/onboarding-tooltip.tsx` (reusable)
- `src/components/organic/empty-state.tsx`

### Files to Modify
- `src/app/organic/page.tsx` — Add IntroSection, update layout
- `src/components/organic/utm-generator-form.tsx` — Update all field copy
- `src/components/organic/result-card.tsx` — Enhance with QR + share
- Tailwind globals — Add illustration styles

### Acceptance Criteria
- [ ] Intro section displays on first visit
- [ ] Intro section is dismissible
- [ ] Empty state shows illustration + guidance
- [ ] All field labels updated to plain English
- [ ] Form tooltips include concrete examples
- [ ] Result card includes QR code
- [ ] Result card includes "Share" message pre-fill
- [ ] Mobile experience is smooth (sticky button, readable QR)
- [ ] All tests updated and passing

### Timeline
- Implementation: 5 hours
- Testing & refinement: 1 hour

---

## Feature 6: UTM Health Checker (3 hours)

### Why
- **SEO lead magnet:** Blog post "Check if Your UTM Links Are Broken"
- **Drives ICP A traffic:** Non-technical users will share this
- **Converts to users:** "Your links are broken, here's how to fix it [link to tool]"
- **Quick build:** 3 hours, high impact

### What to Build
1. **New page: `/health-checker`**
   - Paste any URL (input field)
   - Click "Check Link"
   - Returns analysis:
     - ✅ or ❌ for each UTM parameter
     - Human-readable feedback
     - "Here's how to fix it" guide
     - Link to tool to regenerate

2. **Health checker logic** (`src/lib/utm/health-check.ts`)
   - Parse UTM parameters from URL
   - Check against naming conventions:
     - `utm_source` should be one of: facebook, instagram, linkedin, etc.
     - `utm_campaign` should be snake_case
     - `utm_term` optional but if present, snake_case
     - `utm_content` should match Post_Format-Content_Hook pattern
   - Return pass/fail + suggestions

3. **Results display**
   - Each parameter gets a card with status
   - Green checkmark for pass
   - Red X for fail
   - Suggestion for fix
   - Example of correct format

4. **No login required** (public tool)
   - Free, shareable, lead magnet

### Files to Create
- `src/app/health-checker/page.tsx`
- `src/app/health-checker/layout.tsx` (optional, simpler layout)
- `src/lib/utm/health-check.ts` — Logic
- `src/lib/utm/health-check.test.ts` — Tests (8-10 tests)
- `src/components/health-checker/results-card.tsx`
- `src/components/health-checker/input-section.tsx`

### Files to Modify
- `src/components/layout/sidebar.tsx` — Add link (or hide until launched)
- `src/components/layout/mobile-nav.tsx` — Same

### Acceptance Criteria
- [ ] Page accessible at `/health-checker`
- [ ] Can paste any URL and it parses
- [ ] All UTM parameters checked against conventions
- [ ] Results show pass/fail with suggestions
- [ ] Examples provided for each failure
- [ ] Link to create new link with tool
- [ ] Works with invalid/malformed URLs gracefully
- [ ] No login required
- [ ] Mobile responsive

### Timeline
- Implementation: 2 hours
- Testing: 1 hour

---

## Feature 7: Shareable Value Library (4 hours)

### Why
- **ICP B feature:** Teams want to share naming conventions
- **No Supabase needed:** Use JSON export/import + read-only share link
- **Differentiator:** Competitors don't have this

### What to Build
1. **Export Value Library** (1 hour)
   - All values (campaign, term, content) → JSON file
   - Filename: `utm_values_2026-04-11.json`
   - Include source, labels, everything
   - Button in Settings > Connections

2. **Import Value Library** (1 hour)
   - Upload JSON file
   - Merge with existing values (don't delete, avoid duplicates)
   - Toast: "Imported 42 values"
   - Button in Settings > Connections

3. **Share Value Library (Read-Only)** (2 hours)
   - Generate share token (base64 encoded, stored in URL)
   - Public read-only page: `/shared/values/[token]`
   - Shows all values in list format
   - No login required
   - Copy values from shared library (adds to your own)
   - URL shareable in email / Slack

4. **Copy from Shared Library**
   - "Add all" button → imports all from shared
   - Individual checkboxes → pick and choose
   - Toast: "Added 15 values to your library"

### Files to Create
- `src/lib/utm/export-values.ts` — Export logic
- `src/lib/utm/import-values.ts` — Import + merge logic
- `src/app/shared/values/[token]/page.tsx` — Read-only share page
- `src/components/settings/export-import-values.tsx` — UI component
- `src/components/settings/shared-library-view.tsx` — Share view
- `src/lib/utm/share-tokens.ts` — Token generation/decoding

### Files to Modify
- `src/app/settings/connections/page.tsx` — Add export/import UI
- `src/lib/storage.ts` — Add import helper function

### Acceptance Criteria
- [ ] Export values as JSON (all fields)
- [ ] Import JSON file (merge, no duplicates)
- [ ] Generate shareable token from value library
- [ ] Share page accessible at `/shared/values/[token]`
- [ ] Read-only display of values on share page
- [ ] Copy individual values
- [ ] "Add all" button to import all from shared
- [ ] Tokens don't expire (stored in URL)
- [ ] Share link is copyable
- [ ] All tests passing

### Timeline
- Implementation: 3 hours
- Testing: 1 hour


---

## Phase 2 Timeline (Updated)

```
Week 1 (Apr 11-17):
  Mon-Wed: Branding Refresh (Feature 1)
  Thu-Fri: Testing + refinement

Week 2 (Apr 18-24):
  Mon-Wed: Organic Form UX + Naming Conventions (Feature 2) — 3 days
  Thu-Fri: Source Type + utm_medium Management (Feature 3) — 2 days

Week 3 (Apr 25-May 1):
  Mon:     Free Version Paywall UI (Feature 4)
  Tue-Wed: QR Codes (Feature 5)
  Thu:     UTM Health Checker (Feature 6)
  Fri:     Testing + refinement

Week 4 (May 2-8):
  Mon-Tue: Shareable Value Library (Feature 7)
  Wed-Fri: Polish, bug fixes, full test pass, launch prep
```

---

## Known Issues to Fix

### Current Integrations (Settings → Connections) Don't Work
- [ ] Google Sheets sync is broken
- [ ] Airtable sync is broken
- **Status:** Mark as "Coming soon" or remove from UI until fixed
- **Impact:** Blocks Phase 2 from shipping if users expect these to work
- **Resolution:** Either fix before launch OR hide from UI with coming-soon badge

---

## Not in Phase 2 (Defer to Phase 3)

- [ ] Dashboard (analytics, stats, recent links)
- [ ] Analytics/tracking (link clicks, campaign performance)
- [ ] Bulk link generation
- [ ] Ad platform integrations (Google Ads, Meta, LinkedIn)
- [ ] Team authentication + RBAC
- [ ] Custom UTM parameters beyond standard 5
- [ ] Browser extension
- [ ] Vanity URLs
- [ ] Custom themes
