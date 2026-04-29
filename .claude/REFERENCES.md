# References & Data Models

## V1 Data Models (localStorage - Current)

All data is stored as JSON in `localStorage` under namespaced keys.

### Generated UTM Links (`utm-generator:links`)
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

### Dropdown Options (`utm-generator:values`)
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

### External Data Connections (`utm-generator:connections`)
```typescript
interface DataConnection {
  id: string;
  type: 'google_sheets' | 'airtable';
  config: Record<string, unknown>; // Credentials, sheet/table IDs, column mappings
  lastSynced: string | null;       // ISO 8601
  status: 'active' | 'error' | 'disconnected';
}
```

## V2 Data Models (PostgreSQL - Planned)

For the complete V2 schema with 13+ tables, see `.claude/ARCHITECTURE_V3.md` Part 3: Database Schema.

**Key V2 tables (summary):**
- `users` — Authentication (email, profile)
- `teams` — Team/workspace grouping
- `team_members` — User→Team membership with roles
- `permissions` — RBAC matrix (Admin, Editor, Creator, Viewer)
- `utm_parameters` — Configurable parameters per team
- `utm_parameter_values` — Dropdown options per parameter
- `naming_conventions` — Team-specific validation rules
- `utm_links` — Generated links (with team_id isolation via RLS)
- `link_clicks` — Analytics tracking per link
- `integrations` — OAuth config (Google Ads, Meta, etc.)
- `api_keys` — API access credentials per team
- `audit_log` — Team activity tracking

**Key V2 differences from V1:**
- Multi-tenancy: All tables include `team_id` for Row-Level Security
- Soft deletes: `deleted_at` column on links + integration records
- Analytics: `link_clicks` table tracks click data + user agent/referrer
- Team RBAC: `permissions` table controls who can do what
- API access: `api_keys` + `api_key_usage_logs` for rate limiting

## UTM Framework Logic
*   **utm_source:** Auto-set from the Platform selection (e.g., `facebook`, `google`).
*   **utm_medium:** Auto-set from the Channel Type (e.g., `organic_social`, `organic_search`).
*   **utm_content:** Automatically generated based on `{post_format}-{content_hook}` (e.g., `reels-5_tips_for_growth`), or just `{blog_content_title}` for blogs. Separator is intentionally a hyphen.

---

**For V2 implementation details:** See `.claude/ARCHITECTURE_V3.md` Part 3 for complete SQL schema with indices, constraints, and RLS policies.
