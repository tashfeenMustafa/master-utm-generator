## Part 2: Technical Stack

### 2.1 Frontend (No Changes from V1)
- **Framework:** Next.js 15 (App Router)
- **React:** 18.2.3
- **Styling:** Tailwind CSS v4 + shadcn/ui (Indigo palette)
- **Table:** TanStack Table v8 (for master spreadsheet)
- **State:** React Context + custom hooks
- **Testing:** Vitest + React Testing Library
- **Hosting:** Vercel (same)

### 2.2 Backend (New)
- **API:** Next.js API routes (same framework, new routes in `/app/api/v1/`)
- **Database:** PostgreSQL 14+ (Supabase managed, or self-hosted)
- **Auth:** Supabase Auth (magic links + OAuth)
- **File Storage:** Supabase Storage (for imports/exports)
- **Sessions:** Supabase Auth tokens (JWT)

### 2.3 External Integrations (Data Flow)

**Incoming (Import):**
- Google Ads API → Campaign/AdSet/Ad structures → UTM parameter values
- Meta Ads API → Campaign/AdSet/Ad structures → UTM parameter values
- LinkedIn Ads API → Campaign/Creative structures → UTM parameter values
- TikTok Ads API → Campaign/AdGroup/Creative → UTM parameter values
- Google Sheets API (existing) → Sync UTM values
- Airtable API (existing) → Sync UTM values
- n8n webhooks (new) → Receive external UTM generation requests

**Outgoing (Export):**
- HubSpot API → Store UTM metadata, enable durable attribution
- Slack API → Notifications (new links, team changes)
- Google Analytics 4 API (Phase 3) → Query performance by UTM

### 2.4 Infrastructure

**MVP Setup (Supabase):**
```
┌─────────────────────────────────────┐
│  Vercel Frontend (Next.js 15)       │
│  - Pages (Dashboard, Organic, etc.) │
│  - API routes (/api/v1/*)           │
└────────────────┬────────────────────┘
                 │
      HTTPS + JWT Auth
                 │
        ┌────────▼─────────┐
        │   Supabase       │
        ├──────────────────┤
        │ PostgreSQL (DB)  │ ← 500MB free, unlimited team access
        │ Auth (Sessions)  │ ← Magic links + Google OAuth
        │ Storage (Files)  │ ← Exports, imports
        └──────────────────┘
```

**Why Supabase for MVP:**
- Free tier: 500MB PostgreSQL, unlimited auth, 5GB storage
- Built-in RLS (row-level security) for team isolation
- No separate auth server needed
- Easy to migrate to self-hosted later
- Realtime subscriptions available (future use for link analytics)

---

