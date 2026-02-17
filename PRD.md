# Master UTM Generator — Product Requirements Document

> **Version:** 1.0 — V1 Scope Locked
> **Last updated:** 2026-02-16

---

## 1. Overview

A single-user, client-side web application for generating, managing, and tracking UTM-tagged URLs across organic social, DM outreach, and blog channels. The app consolidates all UTM links into a master spreadsheet view with filtering, searching, and grouping.

**V1 scope:** Organic + DM + Blog UTM generation, localStorage persistence, manual value management, Google Sheets / Airtable connections for dropdown values, CSV export.

**Phase 2 (out of scope for V1):** Paid ads integrations (Meta, Google, LinkedIn Ads APIs), Supabase migration, authentication.

---

## 2. Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Users | Single-user, no auth | Personal tool — no login, no RLS needed |
| Storage | **localStorage** | Zero external dependencies; migrate to Supabase later if needed |
| Ads integrations | **Phase 2** — stub with mock data | No developer accounts yet; build UI now, connect APIs later |
| Framework version | **Next.js 15** (latest) | Latest stable, no reason to pin to 14 |
| Rendering | **Client-side SPA** | No SEO, no public pages — all interactive components |
| Theme | **Light only** with dark sidebar | No dark mode toggle |
| utm_source / utm_medium | **Locked** — auto-set per platform/channel | Not user-editable; prevents broken conventions |
| Value management | **utm_campaign, utm_term, utm_content only** | Source and medium are derived, not managed |
| Free-text in dropdowns | **Auto-saved** to localStorage for reuse | New values typed in the generator form are persisted automatically |
| utm_content separator | **Hyphen** between post_format and content_hook | e.g., `reels-5_tips_for_growth` — intentional per framework |
| URL param handling | **Smart append** — `&` if `?` exists, `?` otherwise | Preserves existing query params on base URLs |
| Editing links | **Not supported** — generate-only | Delete and regenerate if mistake |
| Delete behavior | **Hard delete** | No trash, no undo |
| Google Sheets | **Two separate sheets** | One for dropdown value source, one for export destination |
| Sync | **Manual only** — "Sync Now" button | No scheduled sync in V1 |
| Dropdown initial state | **Empty** — no seeded defaults | User adds values manually or connects a data source |

---

## 3. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js 15 (App Router)** | File-based routing, SPA-friendly with `"use client"` |
| Language | **TypeScript** | Type safety across UTM schemas, form state |
| Styling | **Tailwind CSS v4** | Utility-first, design token mapping, zero runtime |
| UI Components | **shadcn/ui** | Accessible primitives: combobox, dialog, toast, sheet (drawer), data table |
| Data Table | **TanStack Table v8** | Headless — filtering, sorting, grouping, column visibility |
| State Management | **React Context + useReducer** | Form state + app-wide localStorage sync |
| Storage | **localStorage** | JSON-serialized, wrapper with typed read/write helpers |
| Deployment | **Vercel** | Zero-config Next.js hosting |

### Phase 2 Additions (not installed in V1)
- Supabase (PostgreSQL) — database migration from localStorage
- Supabase Auth — user accounts
- Meta Marketing API, Google Ads API, LinkedIn Ads API — ad platform data

---

## 4. Design Tokens

```css
:root {
  /* Colors */
  --color-primary:        #248234;
  --color-dark-bg:        #15250E;
  --color-light-bg:       #F4F7FA;
  --color-black:          #000000;
  --color-white:          #FFFFFF;
  --color-light-grey:     #EFF0F6;
  --color-light-green:    #F4FFF0;
  --color-muted-text:     #77797D;
  --color-yellow-tint:    #F4FFCC;
  --color-deep-green:     #004D23;
  --color-body-text:      #151515;

  /* Typography */
  --font-primary:         "DM Serif Display", serif;  /* Headings only */
  --font-body:            "Inter", system-ui, sans-serif;  /* Body & UI text */

  /* Radii */
  --radius-sm:            6px;
  --radius-md:            10px;
  --radius-lg:            16px;
}
```

### UI Conventions

- **Primary actions** (Generate, Connect, Save): solid `--color-primary` bg, white text
- **Secondary actions** (Cancel, Reset): outlined with `--color-primary` border
- **Destructive actions**: red variant, confirmation dialog required
- **Cards/panels**: `--color-white` bg, 1px `--color-light-grey` border, `--radius-md`
- **Active/selected states**: `--color-light-green` background tint
- **Toasts**: success = `--color-light-green` bg + `--color-deep-green` text; warning = `--color-yellow-tint` bg
- **Headings**: `--font-primary` (DM Serif Display)
- **Body/UI text**: `--font-body` (Inter)
- **Muted/helper text**: `--color-muted-text`, 13px
- **Sidebar**: `--color-dark-bg` background, white text, slim icon-only by default, expands on hover
- **Theme**: Light only — no dark mode toggle

---

## 5. Data Model (localStorage)

All data stored as JSON in localStorage under namespaced keys.

### 5.1 `utm-generator:links` — Generated UTM Links

```typescript
interface UtmLink {
  id: string;                  // crypto.randomUUID()
  fullUrl: string;             // Complete URL with UTM params
  baseUrl: string;             // URL before params
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string | null;
  utmContent: string | null;
  channelType: 'organic' | 'warm_dm' | 'cold_dm';
  platform: string;            // e.g., 'facebook', 'instagram', 'google'
  dateGenerated: string;       // ISO 8601 timestamp
}
```

### 5.2 `utm-generator:values` — Dropdown Options

```typescript
interface UtmValue {
  id: string;
  parameter: 'utm_campaign' | 'utm_term' | 'utm_content';
  value: string;               // snake_case enforced
  label: string;               // Original display label before conversion
  source: 'manual' | 'google_sheets' | 'airtable' | 'auto';
  sourceRef: string | null;    // Sheet ID, table ID, or null
}
```

`source: 'auto'` — values auto-saved when user types free-text in the generator form.

### 5.3 `utm-generator:connections` — External Data Source Config

```typescript
interface DataConnection {
  id: string;
  type: 'google_sheets' | 'airtable';
  config: Record<string, unknown>; // Credentials, sheet/table IDs, column mappings
  lastSynced: string | null;       // ISO 8601
  status: 'active' | 'error' | 'disconnected';
}
```

### 5.4 localStorage Wrapper

A typed `storage.ts` module providing:
- `getLinks(filters?)` — read + filter/sort/paginate in-memory
- `addLink(data)` — append to array, return new link
- `deleteLink(id)` — hard delete by ID
- `getValues(parameter)` — get dropdown values for a UTM param
- `addValue(data)` — add with dedup check
- `deleteValue(id)` — remove value
- `getConnections()` / `saveConnection(data)` — manage data source configs

All writes trigger a `storage` event so other tabs stay in sync.

---

## 6. UTM Framework Reference

### 6.1 Organic Channels

| Platform | utm_source | utm_medium | utm_campaign | utm_term | utm_content | Post Formats |
|----------|-----------|------------|-------------|----------|-------------|-------------|
| Facebook | `facebook` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Reels, Image, Carousel, Text |
| Instagram | `instagram` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Reels, Image, Carousel |
| LinkedIn | `linkedin` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Reels, Image, Carousel, Text, Article |
| TikTok | `tiktok` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Video, Image, Carousel |
| X/Twitter | `x_twitter` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Reels, Image, Carousel, Text |
| Reddit | `reddit` | `organic_social` | Content_Pillar | Content_Theme | Post_Format**-**Content_Hook | Image, Carousel, Text |
| Blog | `google` | `organic_search` | Content_Pillar | Content_Theme | Blog_Content_Title | N/A |

**utm_content composition:**
- Organic/DM: `{post_format}-{content_hook}` — hyphen separator is intentional (e.g., `reels-5_tips_for_growth`)
- Blog: `{blog_content_title}` — snake_cased only (e.g., `how_to_build_a_brand`)

### 6.2 DM Channels

| Channel | utm_source | utm_medium | Platforms |
|---------|-----------|------------|-----------|
| Warm DMs | `{platform}` | `warm_dms` | instagram, linkedin, tiktok, x_twitter, facebook, reddit |
| Cold DMs | `{platform}` | `cold_dms` | instagram, linkedin, tiktok, x_twitter, facebook, reddit |

DM utm_campaign, utm_term, utm_content follow the same pattern as organic.

### 6.3 Paid Channels (Phase 2 — Mock Data in V1)

#### Google Ads
| Param | Value |
|-------|-------|
| utm_source | `google` |
| utm_medium | `paid_search` or `display_ads` |
| utm_campaign | `{_campaignname}` |
| utm_term | `{_adgroupname}` |
| utm_content | `{keyword}` |
| Template | `{lpurl}?utm_id={campaignid}&adgroup_id={adgroupid}&ad_id={creative}&utm_source=google&utm_medium=paid_search&utm_campaign={_campaignname}&utm_term={_adgroupname}&utm_content={keyword}` |

#### Meta Ads
| Param | Value |
|-------|-------|
| utm_source | `meta` |
| utm_medium | `paid_social` |
| utm_campaign | `{{campaign.name}}` |
| utm_term | `{{adset.name}}` |
| utm_content | `{{ad.name}}` |
| Template | `{{url}}?utm_id={{campaign.id}}&adgroup_id={{adset.id}}&ad_id={{ad.id}}&utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}` |

#### LinkedIn Ads
| Param | Value |
|-------|-------|
| utm_source | `linkedin` |
| utm_medium | `paid_social` |
| utm_campaign | `{{CAMPAIGN_NAME}}` |
| utm_term | `{{AD_SET_NAME}}` |
| utm_content | `{{AD_NAME}}` |
| Template | `?utm_term={{AD_SET_NAME}}&utm_id={{CAMPAIGN_ID}}&adgroup_id={{AD_SET_ID}}&ad_id={{AD_ID}}&account_id={{ACCOUNT_ID}}&utm_campaign={{CAMPAIGN_NAME}}&utm_content={{AD_NAME}}&utm_source=linkedin&utm_medium=paid_social` |

---

## 7. Features (Numbered Build Order)

Each feature is independently buildable and testable. Ordered by dependency.

---

### Feature 1: Project Scaffolding & Design System

**Goal:** Set up the repo, install dependencies, configure Tailwind with design tokens, and build the app shell.

**Acceptance Criteria:**
- [ ] Next.js 15 App Router project initialized with TypeScript
- [ ] Tailwind CSS configured with all design tokens from Section 4
- [ ] `DM Serif Display` loaded via `next/font/google` for headings
- [ ] `Inter` loaded via `next/font/google` for body text
- [ ] shadcn/ui installed and themed (primary = `#248234`, radius = 10px, etc.)
- [ ] Layout shell with:
  - **Slim icon sidebar** (`--color-dark-bg`): icons for Organic & DMs, Ads, Settings — expands with labels on hover
  - **Main content area** (`--color-light-bg`): takes remaining width
  - Mobile: sidebar collapses to bottom tab bar
- [ ] Three nav items: **Organic & DMs** (link icon), **Ads** (megaphone icon), **Settings** (gear icon)
- [ ] Reusable components: Button (primary/secondary/destructive), Card, Input, Label

---

### Feature 2: localStorage Storage Layer

**Goal:** Build the typed localStorage wrapper that all features depend on.

**Acceptance Criteria:**
- [ ] `lib/storage.ts` module with typed CRUD functions per Section 5.4
- [ ] All keys namespaced under `utm-generator:` prefix
- [ ] JSON serialization/deserialization with error handling (corrupted data returns empty defaults)
- [ ] `window.addEventListener('storage', ...)` for cross-tab sync
- [ ] TypeScript interfaces for `UtmLink`, `UtmValue`, `DataConnection` per Section 5
- [ ] Helper: `generateId()` using `crypto.randomUUID()`
- [ ] Unit-testable: functions accept an optional storage adapter (for testing without real localStorage)

---

### Feature 3: Snake_case Auto-Conversion Utility

**Goal:** Centralized utility for converting user input to snake_case.

**Acceptance Criteria:**
- [ ] `lib/utils/to-snake-case.ts` exporting `toSnakeCase(input: string): string`
  - Lowercases all characters
  - Replaces spaces, hyphens, periods, and consecutive special characters with single underscores
  - Strips leading/trailing underscores
  - Handles: empty string, already snake_case, camelCase, PascalCase, ALL CAPS, special chars
- [ ] Unit tests covering all edge cases
- [ ] Used by: generator form, value management, data source sync

---

### Feature 4: Toast Notification System

**Goal:** Global toast system reused across all features.

**Acceptance Criteria:**
- [ ] Uses shadcn/ui `<Toaster>` + `toast()` API, themed with design tokens
- [ ] Toast types with correct colors:
  - Success: `--color-light-green` bg, `--color-deep-green` text
  - Error: red bg
  - Warning: `--color-yellow-tint` bg
  - Info: `--color-light-grey` bg
- [ ] Auto-dismiss after 4 seconds
- [ ] Manual dismiss via X button
- [ ] Stacks up to 3, positioned bottom-right
- [ ] Accessible: `role="alert"`, `aria-live="polite"`

---

### Feature 5: UTM Value Management — Manual Entry

**Goal:** Let users manage dropdown values for utm_campaign, utm_term, and utm_content.

**Acceptance Criteria:**
- [ ] Settings page (`/settings/values`) with a section for each manageable parameter:
  - `utm_campaign`
  - `utm_term`
  - `utm_content`
- [ ] **utm_source and utm_medium are NOT shown** — they are locked/auto-derived
- [ ] Each section:
  - Displays existing values as a list (label + snake_case value shown)
  - "Add Value" input + button
  - All values auto-converted to snake_case on save via Feature 3
  - Delete button per value (hard delete, no confirmation needed for values)
  - Edit inline: click value to edit label, re-derives snake_case
- [ ] Validation: no duplicate values within same parameter, no empty strings
- [ ] Empty state: "No values yet. Add your first value or connect a data source."
- [ ] Values persisted via Feature 2 (localStorage)
- [ ] Toast on add/delete (Feature 4)

---

### Feature 6: UTM Link Generator Form

**Goal:** The core form for generating UTM-tagged URLs, presented as a slide-in drawer.

**UI Layout:**
- [ ] **Trigger:** "Generate UTM Link" primary button at top of the Organic & DMs page
- [ ] **Drawer:** slides in from the right (shadcn/ui `<Sheet>`), overlays the table
- [ ] **Form layout inside drawer:** single column (drawer is narrow), fields stacked vertically
- [ ] When on desktop full-page (non-drawer context), use 2-column layout: URL full-width top, then fields paired side-by-side

**Fields in order:**

1. **Base URL** — text input
   - Placeholder: `https://example.com/page`
   - Validates as URL with protocol
   - Smart param handling: appends `&` if `?` already exists, `?` otherwise

2. **Channel Type** — radio group: `Organic Social`, `Blog`, `Warm DMs`, `Cold DMs`

3. **Platform** — searchable dropdown, filtered by Channel Type:
   - Organic Social: Facebook, Instagram, LinkedIn, TikTok, X/Twitter, Reddit
   - Blog: Google (auto-selected, locked/disabled)
   - Warm DMs / Cold DMs: Instagram, LinkedIn, TikTok, X/Twitter, Facebook, Reddit

4. **utm_source** — read-only chip/badge, auto-set from Platform
   - Shows: `facebook`, `instagram`, `linkedin`, `tiktok`, `x_twitter`, `reddit`, `google`

5. **utm_medium** — read-only chip/badge, auto-set from Channel Type:
   - Organic Social → `organic_social`
   - Blog → `organic_search`
   - Warm DMs → `warm_dms`
   - Cold DMs → `cold_dms`

6. **utm_campaign** — searchable combobox
   - Options from `utm_values` where parameter = `utm_campaign`
   - Allows free-text entry
   - **New free-text values auto-saved** to values store (source = `auto`) on Generate
   - Auto-snake_cased, preview shown below input

7. **utm_term** — searchable combobox (optional)
   - Same behavior as utm_campaign but optional
   - Options from `utm_values` where parameter = `utm_term`

8. **Post Format** — dropdown, **hidden when Blog is selected**
   - Options filtered by platform:
     - Facebook: Reels, Image, Carousel, Text
     - Instagram: Reels, Image, Carousel
     - LinkedIn: Reels, Image, Carousel, Text, Article
     - TikTok: Video, Image, Carousel
     - X/Twitter: Reels, Image, Carousel, Text
     - Reddit: Image, Carousel, Text

9. **Content Hook / Blog Title** — text input
   - Label dynamically changes: "Content Hook" (organic/DM) or "Blog Content Title" (blog)
   - Auto-snake_cased

10. **utm_content** — read-only computed display:
    - Organic/DM: `{post_format}-{content_hook}` (e.g., `reels-5_tips_for_growth`)
    - Blog: `{blog_content_title}` (e.g., `how_to_build_a_brand`)

**Preview Section:**
- [ ] Live URL preview updating as fields change
- [ ] Each UTM param displayed on its own line with label
- [ ] Missing required fields shown as red placeholder text in preview

**Actions:**
- [ ] **Cancel** — resets all fields, closes drawer
- [ ] **Generate** — validates → builds URL → saves to localStorage → shows result card (Feature 7) → shows success toast → closes drawer → new row appears at top of table

**Validation Rules:**
- Base URL: required, valid URL with protocol
- Channel Type: required
- Platform: required
- utm_campaign: required, min 2 chars
- utm_term: optional, min 2 chars if provided
- Post Format: required when channel is organic or DM (not blog)
- Content Hook / Blog Title: required, min 2 chars

**Tooltip/helper text on every field:**
- Base URL: "The destination page URL. Must include https://"
- Channel Type: "How this content is being distributed"
- Platform: "The social platform or channel"
- utm_campaign: "Your content pillar or campaign name. e.g., brand_awareness"
- utm_term: "Your content theme. e.g., customer_stories"
- Post Format: "The format of your post on this platform"
- Content Hook: "A short descriptor of the content. e.g., 5_tips_for_growth"
- Blog Title: "The title of your blog post. e.g., how_to_build_a_brand"

---

### Feature 7: Result Card & Copy Functionality

**Goal:** After generating a link, show a result card with copy-to-clipboard.

**Acceptance Criteria:**
- [ ] Card appears at the top of the Organic & DMs page after drawer closes post-generation
- [ ] Card background: `--color-light-green`
- [ ] Card contents:
  - Full URL in monospace, word-break enabled
  - UTM param breakdown (each on its own line: `utm_source: facebook`, etc.)
  - Platform badge (colored pill)
  - Timestamp (human-readable: "Feb 16, 2026 at 3:45 PM")
- [ ] **Copy URL** button — copies full URL to clipboard
  - Shows checkmark + "Copied!" for 2 seconds
  - Success toast: "URL copied to clipboard"
- [ ] **Dismiss** (X) button closes card
- [ ] Generating another link replaces the previous card
- [ ] Card is not persisted — disappears on page refresh

---

### Feature 8: Master Spreadsheet View — Organic & DMs

**Goal:** Display all generated UTM links in a filterable, searchable, groupable data table.

**Acceptance Criteria:**
- [ ] **Primary view** on the "Organic & DMs" page — table is the default content, not the form
- [ ] Columns: Full URL, utm_source, utm_medium, utm_campaign, utm_term, utm_content, Date Generated
- [ ] Data from localStorage (`utm-generator:links`) where channelType IN ('organic', 'warm_dm', 'cold_dm')

**Toolbar above table:**
- [ ] "Generate UTM Link" primary button (opens drawer — Feature 6)
- [ ] Search input (debounced 300ms) — searches across Full URL and all UTM columns
- [ ] Filter dropdowns: Platform, utm_medium, utm_campaign
- [ ] Date range picker for Date Generated
- [ ] Group-by dropdown: None, utm_source, utm_medium, utm_campaign, utm_term, utm_content
- [ ] "Export" button (Feature 13)
- [ ] Active filters shown as removable chips below toolbar

**Table behavior:**
- [ ] Click column headers to sort asc/desc (toggle)
- [ ] Multiple filters combine with AND logic
- [ ] Grouped rows: collapsible sections with row count badges
- [ ] Full URL column: gets most width, truncated with tooltip on hover
- [ ] **Row actions** (right-most column):
  - Copy URL button (icon)
  - Delete button (icon) — confirmation dialog before hard delete
- [ ] Pagination: 25 rows per page, page controls at bottom
- [ ] New rows appear at top immediately after generation

**Mobile:**
- [ ] Horizontal scroll — table stays intact, scrollable container
- [ ] Touch-friendly row actions

**Empty state:** centered message with icon — "No UTM links generated yet. Click 'Generate UTM Link' to create your first one."

---

### Feature 9: UTM Value Management — Google Sheets Connection

**Goal:** Connect a Google Sheet to pull values for utm_campaign, utm_term, utm_content dropdowns.

**Note:** This is a **data source sheet** for populating dropdowns — separate from the export destination sheet (Feature 13).

**Acceptance Criteria:**
- [ ] Settings page section (`/settings/connections`): "Connect Google Sheets"
- [ ] OAuth 2.0 flow via Next.js API route → Google Sheets API
- [ ] After auth: paste Sheet URL or pick from recent sheets
- [ ] Tab (worksheet) selector dropdown
- [ ] Column mapping UI: for each of the 3 manageable UTM params (utm_campaign, utm_term, utm_content), select which column contains values
- [ ] **"Sync Now"** button:
  - Pulls all unique values from mapped columns
  - Converts to snake_case
  - Stores in localStorage values (source = `google_sheets`, sourceRef = sheet ID)
  - Shows success toast with count: "Synced 24 values from Google Sheets"
- [ ] Last synced timestamp displayed
- [ ] Re-sync: replaces all values with `source = google_sheets` for that sheet, without affecting `manual` or `auto` values
- [ ] Disconnect button: removes connection config and all `google_sheets`-sourced values
- [ ] Error handling: expired token (re-auth prompt), missing sheet (warning toast), invalid column

---

### Feature 10: UTM Value Management — Airtable Connection

**Goal:** Same as Feature 9 but for Airtable.

**Acceptance Criteria:**
- [ ] Settings page section: "Connect Airtable"
- [ ] Personal access token input (Airtable uses PATs, not OAuth for simple integrations)
- [ ] Base selector dropdown → Table selector dropdown
- [ ] Column mapping UI: identical to Feature 9 (3 UTM params)
- [ ] "Sync Now" — same behavior, stores with source = `airtable`
- [ ] Same sync/timestamp/disconnect/error behavior as Feature 9

---

### Feature 11: Field Validation & Guidance System

**Goal:** Comprehensive inline validation and contextual help on all form inputs.

**Acceptance Criteria:**
- [ ] Every input in the generator form (Feature 6) has:
  - Placeholder text showing expected format
  - Info icon (tooltip) explaining the field and its UTM mapping
  - Inline error message (red, below field) on blur and on submit attempt
- [ ] Validation triggers:
  - On blur: validate individual field
  - On Generate click: validate all fields, scroll to first error
- [ ] Generate button: visually muted when form is incomplete, but still clickable (shows all errors on click)
- [ ] URL preview: missing segments shown as red placeholder text (e.g., `&utm_campaign=???`)
- [ ] Helper text examples contextual to channel type:
  - utm_campaign: "e.g., brand_awareness, product_launch_q1"
  - utm_term: "e.g., social_proof, customer_stories"
  - Content Hook: "e.g., 5_tips_for_growth, behind_the_scenes"
  - Blog Title: "e.g., how_to_build_a_brand, ultimate_guide_seo"

---

### Feature 12: Ads UTM View — Stubbed with Mock Data

**Goal:** Build the full Ads page UI using mock data so it's ready to connect when API accounts are approved.

**Acceptance Criteria:**
- [ ] "Ads" page (`/ads`) with a unified read-only data table
- [ ] Mock data: ~15-20 rows representing campaigns from Meta, Google, and LinkedIn
- [ ] Columns: Full UTM URL (constructed from template), utm_source, utm_medium, utm_campaign, utm_term, utm_content, Platform, Campaign Status, Last Updated
- [ ] Platform column: icon + name (Meta, Google, LinkedIn)
- [ ] Campaign Status values: Active, Paused, Completed
- [ ] Same table capabilities as Feature 8: filtering, search, sorting, grouping, pagination
- [ ] Filter by platform (multi-select), campaign status, date range
- [ ] Group by: Platform, utm_campaign, utm_medium
- [ ] **"Copy UTM Template"** button per row — copies the template string with dynamic placeholders for use in ad platform URL params
- [ ] Read-only: no edit, no delete
- [ ] Connection status bar at top:
  - Meta Ads: grey dot + "Not Connected"
  - Google Ads: grey dot + "Not Connected"
  - LinkedIn Ads: grey dot + "Not Connected"
  - Each with a "Connect" link → navigates to `/settings/connections`
- [ ] Banner below status bar: "Showing mock data. Connect your ad accounts in Settings to see live campaign UTMs."
- [ ] Mock data stored in a `lib/mock/ads-data.ts` file — easy to swap for real API calls later

**Phase 2 hook points (documented in code comments):**
- [ ] `lib/ads/meta.ts` — stub: `fetchMetaCampaigns()` returns mock data, comment marking where API call goes
- [ ] `lib/ads/google.ts` — stub: `fetchGoogleCampaigns()` returns mock data
- [ ] `lib/ads/linkedin.ts` — stub: `fetchLinkedInCampaigns()` returns mock data
- [ ] Settings connection UI for each platform: OAuth button that shows "Coming Soon" toast

---

### Feature 13: Data Export

**Goal:** Export the master spreadsheet data as CSV or to Google Sheets.

**Acceptance Criteria:**
- [ ] "Export" dropdown button in the table toolbar (Feature 8)
- [ ] Options:
  - **Export as CSV** — always available
  - **Export to Google Sheets** — only if a Google Sheets connection exists (Feature 9)
- [ ] Export respects current filters — only exports visible/filtered rows
- [ ] CSV: triggers browser download, filename `utm_links_YYYY-MM-DD.csv`
- [ ] Google Sheets export:
  - Opens sheet picker to select **destination sheet** (separate from the data source sheet)
  - Appends rows to selected sheet (does not overwrite existing data)
  - Success toast: "Exported 42 links to Google Sheets"
- [ ] Empty state: if no rows match current filters, show toast "No data to export"

---

## 8. Page Structure

```
/                         → Redirect to /organic
/organic                  → Master Spreadsheet (primary) + Generator Drawer (slide-in)
/ads                      → Ads UTM Spreadsheet (read-only, mock data in V1)
/settings                 → Redirect to /settings/values
/settings/values          → Manual UTM value management
/settings/connections     → Google Sheets, Airtable connections (+ stub ad platform connections)
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| First Contentful Paint | < 1.5s |
| Table render (500 rows) | < 300ms (virtualize with TanStack Virtual if > 200 rows) |
| Copy to clipboard | < 100ms feedback |
| localStorage read/write | < 50ms for typical datasets |
| Accessibility | WCAG 2.1 AA — keyboard nav, screen reader labels, contrast ratios |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Mobile | Responsive down to 375px; table uses horizontal scroll |
| localStorage budget | Warn user if approaching 5MB limit (~10,000+ links) |

---

## 10. Phase 2 — Future Scope

These are **not built in V1** but the architecture should not block them:

- **Supabase migration** — swap localStorage wrapper for Supabase client; same function signatures
- **User authentication** — Supabase Auth, row-level security
- **Live ad platform APIs** — replace mock data stubs with real OAuth flows and API calls:
  - Meta Marketing API (campaigns, ad sets, ads)
  - Google Ads API (campaigns, ad groups, keywords)
  - LinkedIn Marketing API (campaign groups, campaigns, creatives)
- **Scheduled sync** for Google Sheets / Airtable (cron via Vercel)
- **Bulk link generation** via CSV upload
- **Short URL generation** (Bitly API integration)
- **Analytics dashboard** — click data per UTM link
- **Team collaboration** — shared link libraries, multi-tenant
- **Browser extension** — quick UTM generation on any page
