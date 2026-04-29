# Master UTM Generator — PRD

> **Version:** 1.0 — V1 Scope Locked | **Last updated:** 2026-02-16

---

## 1. Overview

Single-user client-side web app for generating, managing, and tracking UTM-tagged URLs across organic social, DM, and blog channels. Consolidates all links into a master spreadsheet view with filtering/search/grouping.

**V1 scope:** Organic + DM + Blog UTM generation, localStorage persistence, Google Sheets / Airtable dropdown sync, CSV export.
**Phase 2 (out of scope):** Paid ads APIs, Supabase, authentication.

---

## 2. Key Decisions

| Decision | Choice |
|---|---|
| Users | Single-user, no auth |
| Storage | localStorage — migrate to Supabase later |
| Ads integrations | Phase 2 — stub with mock data |
| Framework | Next.js 15 App Router, TypeScript |
| Rendering | Client-side SPA |
| Theme | Light only, dark sidebar |
| utm_source / utm_medium | Locked — auto-set per platform/channel, not user-editable |
| Managed params | utm_campaign, utm_term, utm_content only |
| Free-text dropdowns | Auto-saved to localStorage on Generate |
| utm_content separator | Hyphen: `{post_format}-{content_hook}` e.g. `reels-5_tips_for_growth` |
| URL param handling | Smart append — `&` if `?` exists, `?` otherwise |
| Editing links | Not supported — delete and regenerate |
| Delete | Hard delete, no undo |
| Google Sheets | Two separate sheets: one for dropdown source, one for export dest |
| Sync | Manual only — "Sync Now" button |
| Dropdown defaults | Empty — no seeded values |

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (combobox, dialog, toast, sheet, data table) |
| Data Table | TanStack Table v8 |
| State | React Context + useReducer |
| Storage | localStorage |
| Deployment | Vercel |

---

## 4. Design Tokens

```css
:root {
  --color-primary:     #248234;
  --color-dark-bg:     #15250E;   /* sidebar */
  --color-light-bg:    #F4F7FA;   /* main area */
  --color-light-green: #F4FFF0;   /* active/selected, success toast bg */
  --color-deep-green:  #004D23;   /* success toast text */
  --color-light-grey:  #EFF0F6;   /* cards */
  --color-muted-text:  #77797D;
  --color-yellow-tint: #F4FFCC;   /* warning toast */
  --color-body-text:   #151515;
  --font-primary:      "DM Serif Display", serif;  /* headings */
  --font-body:         "Inter", system-ui, sans-serif;
  --radius-md:         10px;
}
```

**Sidebar:** slim icon-only, expands on hover, `--color-dark-bg`. **Three nav items:** Organic & DMs, Ads, Settings.

---

## 5. Data Model (localStorage)

```typescript
interface UtmLink {
  id: string;           // crypto.randomUUID()
  fullUrl: string;
  baseUrl: string;
  utmSource: string;    utmMedium: string;    utmCampaign: string;
  utmTerm: string | null;   utmContent: string | null;
  channelType: 'organic' | 'warm_dm' | 'cold_dm';
  platform: string;     dateGenerated: string;  // ISO 8601
}

interface UtmValue {
  id: string;
  parameter: 'utm_campaign' | 'utm_term' | 'utm_content';
  value: string;         // snake_case enforced
  label: string;
  source: 'manual' | 'google_sheets' | 'airtable' | 'auto';
  sourceRef: string | null;
}

interface DataConnection {
  id: string;
  type: 'google_sheets' | 'airtable';
  config: Record<string, unknown>;
  lastSynced: string | null;
  status: 'active' | 'error' | 'disconnected';
}
```

**localStorage keys:** `utm-generator:links`, `utm-generator:values`, `utm-generator:connections`. All writes trigger `storage` event for cross-tab sync.

---

## 6. UTM Framework Reference

### Organic Channels

| Platform | utm_source | utm_medium | utm_content |
|---|---|---|---|
| Facebook | `facebook` | `organic_social` | `{post_format}-{content_hook}` |
| Instagram | `instagram` | `organic_social` | `{post_format}-{content_hook}` |
| LinkedIn | `linkedin` | `organic_social` | `{post_format}-{content_hook}` |
| TikTok | `tiktok` | `organic_social` | `{post_format}-{content_hook}` |
| X/Twitter | `x_twitter` | `organic_social` | `{post_format}-{content_hook}` |
| Reddit | `reddit` | `organic_social` | `{post_format}-{content_hook}` |
| Blog | `google` | `organic_search` | `{blog_content_title}` |

**Post formats by platform:** Facebook/LinkedIn/X: Reels, Image, Carousel, Text | Instagram: Reels, Image, Carousel | TikTok: Video, Image, Carousel | Reddit: Image, Carousel, Text | LinkedIn also: Article

### DM Channels

| Channel | utm_medium |
|---|---|
| Warm DMs | `warm_dms` |
| Cold DMs | `cold_dms` |

utm_source = platform name. utm_campaign/term/content follow same pattern as organic.

### Paid Channels (Phase 2 — mock data in V1)

| Platform | utm_source | utm_medium | Template variables |
|---|---|---|---|
| Google Ads | `google` | `paid_search` | `{_campaignname}`, `{_adgroupname}`, `{keyword}` |
| Meta Ads | `meta` | `paid_social` | `{{campaign.name}}`, `{{adset.name}}`, `{{ad.name}}` |
| LinkedIn Ads | `linkedin` | `paid_social` | `{{CAMPAIGN_NAME}}`, `{{AD_SET_NAME}}`, `{{AD_NAME}}` |

---

## 7. Features (Build Order)

| # | Feature | Key behavior |
|---|---|---|
| 1 | Project Scaffolding | Next.js 15, Tailwind + design tokens, shadcn/ui, sidebar shell |
| 2 | localStorage Layer | Typed CRUD in `lib/storage.ts`; `getLinks`, `addLink`, `deleteLink`, `getValues`, `addValue`, `getConnections` |
| 3 | Snake_case Utility | `toSnakeCase()` in `lib/utils/to-snake-case.ts`; used by all inputs |
| 4 | Toast System | shadcn/ui Toaster; success/error/warning/info types; 4s auto-dismiss; bottom-right stack of 3 |
| 5 | Value Management (Manual) | Settings `/settings/values` — add/edit/delete utm_campaign, utm_term, utm_content values; snake_case enforced |
| 6 | Generator Form | Slide-in drawer (shadcn Sheet); fields: Base URL, Channel Type, Platform, source (read-only), medium (read-only), utm_campaign, utm_term, Post Format, Content Hook; live URL preview |
| 7 | Result Card | Post-generation card with full URL, UTM breakdown, Copy button (2s checkmark), Dismiss; not persisted on refresh |
| 8 | Master Table (Organic & DMs) | TanStack Table; columns: Full URL, source, medium, campaign, term, content, Date; filter/search/group/sort/paginate (25/page); row actions: copy + delete |
| 9 | Google Sheets Source | OAuth → sheet/tab/column mapping → "Sync Now" pulls values → stores as `source: google_sheets` |
| 10 | Airtable Source | PAT → base/table/column mapping → same sync behavior |
| 11 | Field Validation | Inline errors on blur + submit; muted Generate button styling; red `???` in URL preview for missing fields |
| 12 | Ads View (Stubbed) | `/ads` read-only table with ~20 mock rows; platform filter, status, group-by; "Copy UTM Template" per row; 3 connection status badges (all grey); stub files `lib/ads/meta.ts` etc. |
| 13 | Data Export | "Export" dropdown: CSV download (filtered rows) + Google Sheets append (destination picker); success toast |

---

## 8. Page Structure

```
/                     → redirect to /organic
/organic              → Master table + Generator drawer
/ads                  → Ads table (mock data)
/settings             → redirect to /settings/values
/settings/values      → Manual UTM value management
/settings/connections → Google Sheets, Airtable, ad platform stubs
```

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Table render (500 rows) | < 300ms; TanStack Virtual if > 200 rows |
| localStorage read/write | < 50ms |
| Accessibility | WCAG 2.1 AA |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2) |
| Mobile | Responsive to 375px; table horizontal scroll |
| Storage warning | Toast if approaching 5MB (~10,000+ links) |

---

## 10. Phase 2 (Out of Scope for V1)

Supabase migration (same storage function signatures), user auth, live Meta/Google/LinkedIn API connections, scheduled sync, bulk CSV import, Bitly short URLs, analytics dashboard, team collaboration, browser extension.
