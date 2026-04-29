# ⚠️ DEPRECATED: See Modular Architecture Documentation

**This file has been broken into modular documents for easier navigation and scrolling.**

👉 **[Go to ARCHITECTURE_V3 folder](./ARCHITECTURE_V3/INDEX.md)** for the new modular structure.

---

## Quick Links
- **Start here:** [ARCHITECTURE_V3/INDEX.md](./ARCHITECTURE_V3/INDEX.md)
- **Implementation roadmap:** [ARCHITECTURE_V3/08_IMPLEMENTATION.md](./ARCHITECTURE_V3/08_IMPLEMENTATION.md)
- **Database schema:** [ARCHITECTURE_V3/03_DATABASE.md](./ARCHITECTURE_V3/03_DATABASE.md)
- **REST API:** [ARCHITECTURE_V3/05_API.md](./ARCHITECTURE_V3/05_API.md)

---

# Master UTM Generator — Architecture V3 (Complete Redesign)

**Status:** 🚀 Full redesign from localStorage to PostgreSQL + Auth + Teams + API  
**Date:** 2026-04-12  
**Scope:** Database migration, authentication, teams, RBAC, API, integrations, complexity modes  
**Current State:** V1 complete (localStorage, no auth, no teams, V2 partial features)

**📁 Note:** This content is now in the [ARCHITECTURE_V3/](./ARCHITECTURE_V3/) folder. This file is kept for reference only.

---

## Executive Summary

**Vision:** Transform Master UTM Generator from a single-user localStorage app (V1) into a multi-tenant, team-based platform with API access, advanced permissions, and integrations.

**Key Insight:** Simplicity first (default UI), power always (advanced features available). Every user starts in "Simple" mode and can opt into "Advanced", "Team Standard", or "Programmatic" as they grow.

**Timeline:** 10 weeks (50 work days)  
**Team size:** 1 developer + design/product (guidance)  
**Cost:** ~$500-1000/month (Supabase free tier for MVP)

---

## Part 1: Architecture Overview

### 1.1 Core Insight: Simplicity First, Power Always

**Default Path (Simple Mode):**
- New user arrives → sees one clean form → generates UTM link in 30 seconds
- No account needed initially (free tier, localStorage)
- Form: URL, Platform, Campaign, Theme, Post Type
- Result: Link + QR + Copy button

**Advanced Path (Advanced Mode):**
- Same user, logged in, can access:
  - Custom UTM parameters
  - Naming conventions (validation rules)
  - Team member management
  - Integrations (Google Ads, Meta, LinkedIn, TikTok)
  - API key generation
  - Advanced analytics

**Architecture Principle:** 
Every advanced feature has a simple path + a programmatic path.
- Simple: Click-based UI
- Programmatic: REST API call
- Both paths validate the same rules (naming conventions, permissions)

---

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

## Part 3: Database Schema (PostgreSQL)

### 3.1 Core Schema Overview

```sql
-- Authentication & Teams
users (id, email, name, avatar_url, created_at, updated_at)
teams (id, name, slug, owner_id, workspace_name, created_at)
team_members (id, team_id, user_id, role, created_at)

-- Permissions & Access Control
permissions (id, team_id, role, [8 permission booleans])
api_keys (id, team_id, user_id, key, name, scopes, rate_limit, created_at)

-- UTM Management
utm_parameters (id, team_id, name, type, data_type, required, description, created_by, created_at)
utm_parameter_values (id, team_id, parameter_id, value, label, source, source_ref, created_at)
naming_conventions (id, team_id, name, description, rules, is_default, created_at)

-- Link Generation
utm_links (id, team_id, created_by, base_url, full_url, utm_source, utm_medium, utm_campaign, utm_term, utm_content, custom_params, channel_type, platform, post_format, qr_code_url, qr_code_svg, is_public, shared_with, created_at, updated_at, deleted_at)

-- Analytics (Phase 3)
link_clicks (id, link_id, clicked_at, user_agent, ip_country, referrer)

-- Integrations
integrations (id, team_id, type, status, config, last_synced, created_at)
```

### 3.2 Complete SQL Schema (Detailed)

```sql
-- ============================================
-- AUTHENTICATION & TEAMS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'creator', 'viewer')),
  invited_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- ============================================
-- PERMISSIONS (RBAC)
-- ============================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL UNIQUE,
  
  -- Link management
  can_create_links BOOLEAN DEFAULT FALSE,
  can_edit_links BOOLEAN DEFAULT FALSE,
  can_delete_links BOOLEAN DEFAULT FALSE,
  
  -- Parameter management
  can_create_utm_params BOOLEAN DEFAULT FALSE,
  can_edit_utm_params BOOLEAN DEFAULT FALSE,
  
  -- Team management
  can_manage_team BOOLEAN DEFAULT FALSE,
  
  -- Integrations
  can_import_from_ads BOOLEAN DEFAULT FALSE,
  can_export_data BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- UTM PARAMETER MANAGEMENT
-- ============================================

CREATE TABLE utm_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,  -- "utm_source", "utm_campaign", "utm_custom_click_id"
  type VARCHAR(20) NOT NULL CHECK (type IN ('standard', 'custom')),
  data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'number', 'alphanumeric', 'email', 'uuid')),
  
  required BOOLEAN DEFAULT FALSE,
  description TEXT,
  position INT DEFAULT 0,  -- Order in UI
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, name)
);

CREATE TABLE utm_parameter_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES utm_parameters(id) ON DELETE CASCADE,
  
  value VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  
  source VARCHAR(50) NOT NULL CHECK (source IN ('manual', 'auto', 'google_sheets', 'airtable', 'google_ads', 'meta_ads', 'linkedin_ads', 'tiktok_ads')),
  source_ref TEXT,  -- e.g., campaign ID from Google Ads
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, parameter_id, value)
);

-- ============================================
-- NAMING CONVENTIONS
-- ============================================

CREATE TABLE naming_conventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- JSON schema with validation rules
  rules JSONB NOT NULL,  -- {"utm_campaign": {"pattern": "...", "transform": "..."}, ...}
  
  is_default BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- UTM LINKS (Core Feature)
-- ============================================

CREATE TABLE utm_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Base URL and generated URL
  base_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  
  -- Standard 5 UTM parameters
  utm_source VARCHAR(255) NOT NULL,
  utm_medium VARCHAR(255) NOT NULL,
  utm_campaign VARCHAR(255) NOT NULL,
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  
  -- Custom parameters (flexible JSON)
  custom_params JSONB DEFAULT '{}',  -- {"utm_click_id": "abc123", "utm_version": "2"}
  
  -- Metadata
  channel_type VARCHAR(50),  -- 'organic_social', 'warm_dm', 'cold_dm', 'paid_search', 'paid_social'
  platform VARCHAR(100),     -- 'facebook', 'instagram', 'google_ads', 'linkedin', etc.
  post_format VARCHAR(100),  -- 'reels', 'image', 'carousel', 'search_ad'
  
  -- QR Code (generated on demand)
  qr_code_url TEXT,
  qr_code_svg TEXT,
  
  -- Sharing & permissions
  is_public BOOLEAN DEFAULT FALSE,  -- Can non-team members view?
  shared_with JSONB DEFAULT '{}',   -- {"user_id": [...], "team_id": [...]}
  
  -- Soft delete
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_utm_links_team_id ON utm_links(team_id);
CREATE INDEX idx_utm_links_created_by ON utm_links(created_by);
CREATE INDEX idx_utm_links_created_at ON utm_links(created_at DESC);

-- ============================================
-- LINK ANALYTICS (Phase 3)
-- ============================================

CREATE TABLE link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES utm_links(id) ON DELETE CASCADE,
  
  clicked_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_country VARCHAR(2),
  referrer TEXT,
  
  -- Optional: User tracking (if they logged in)
  user_id UUID REFERENCES users(id)
);

CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at DESC);

-- ============================================
-- INTEGRATIONS
-- ============================================

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL CHECK (type IN ('google_sheets', 'airtable', 'google_ads', 'meta_ads', 'linkedin_ads', 'tiktok_ads', 'hubspot', 'slack')),
  status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('active', 'error', 'disconnected')),
  
  -- Encrypted config (handled by app layer)
  config JSONB NOT NULL,  -- {"access_token": "...", "sheet_id": "...", "ad_account_id": "..."}
  
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, type)
);

-- ============================================
-- API KEYS (For external integrations)
-- ============================================

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  key_hash VARCHAR(255) NOT NULL UNIQUE,  -- Hashed version stored
  name VARCHAR(255) NOT NULL,
  scopes TEXT[] DEFAULT ARRAY[]::TEXT[],  -- ['links:read', 'links:create', 'utm_params:read']
  
  rate_limit INT DEFAULT 100000,  -- Requests per month
  requests_this_month INT DEFAULT 0,
  
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, name)
);

-- ============================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_parameter_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_conventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);

-- Users can only see teams they're members of
CREATE POLICY teams_select ON teams FOR SELECT USING (
  id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
  OR owner_id = auth.uid()
);

-- All team-scoped tables filtered by team membership
CREATE POLICY utm_links_select ON utm_links FOR SELECT USING (
  team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY utm_links_insert ON utm_links FOR INSERT WITH CHECK (
  team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

-- Similar policies for utm_parameters, utm_parameter_values, integrations, api_keys, etc.
```

### 3.3 Indices for Performance

```sql
-- Team queries
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- Link queries (common filters)
CREATE INDEX idx_utm_links_team_created ON utm_links(team_id, created_at DESC);
CREATE INDEX idx_utm_links_campaign ON utm_links(team_id, utm_campaign);
CREATE INDEX idx_utm_links_source ON utm_links(team_id, utm_source);

-- Parameter queries
CREATE INDEX idx_utm_params_team_id ON utm_parameters(team_id);
CREATE INDEX idx_utm_param_values_param_id ON utm_parameter_values(parameter_id);
CREATE INDEX idx_utm_param_values_team_id ON utm_parameter_values(team_id);

-- Integration queries
CREATE INDEX idx_integrations_team_id ON integrations(team_id);

-- API key queries
CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
```

---

## Part 4: Authentication & Authorization

### 4.1 Authentication Flow

**User Signup (Magic Link):**
```
1. User enters email
2. System sends link: https://app.com/auth/callback?token=xyz
3. User clicks link
4. Link verified by Supabase Auth
5. Session created (JWT + refresh token)
6. User redirected to onboarding
```

**User Login (Existing):**
```
1. User enters email
2. System sends link
3. User clicks → verified → session created
```

**Social Login (Optional):**
```
1. User clicks "Continue with Google"
2. Google OAuth 2.0 flow
3. Session created
```

### 4.2 Team Roles & Permissions

| Role | Links | UTM Params | Team | Integrations | API |
|------|-------|-----------|------|--------------|-----|
| **Admin** | CRUD | CRUD | Manage members | Connect/disconnect | Full access |
| **Editor** | CRUD own | CRUD | View | Trigger sync | Read-only |
| **Creator** | Create only | Read | — | — | Limited |
| **Viewer** | Read only | Read | — | — | — |

**Permission Matrix (Detailed):**
```json
{
  "admin": {
    "links": ["create", "read", "update", "delete"],
    "utm_params": ["create", "read", "update", "delete"],
    "naming_conventions": ["create", "read", "update", "delete"],
    "integrations": ["connect", "disconnect", "read"],
    "team": ["manage_members", "manage_roles", "read_settings"],
    "api_keys": ["create", "delete"],
    "analytics": ["view_all"]
  },
  "editor": {
    "links": ["create", "read", "update_own", "delete_own"],
    "utm_params": ["create", "read", "update", "delete"],
    "naming_conventions": ["read"],
    "integrations": ["read", "trigger_sync"],
    "team": ["read_members"],
    "api_keys": [],
    "analytics": ["view_own"]
  },
  "creator": {
    "links": ["create", "read", "delete_own"],
    "utm_params": ["read"],
    "naming_conventions": ["read"],
    "integrations": [],
    "team": [],
    "api_keys": [],
    "analytics": []
  },
  "viewer": {
    "links": ["read"],
    "utm_params": ["read"],
    "naming_conventions": ["read"],
    "integrations": [],
    "team": [],
    "api_keys": [],
    "analytics": []
  }
}
```

### 4.3 Session Management

**Token Strategy:**
- Access token (JWT): 1 hour, used for API requests
- Refresh token: 7 days, stored in HTTP-only cookie
- When access expires: Use refresh token to get new access token
- Token revoked: Clear cookies on logout, invalidate in database

**Cookie Security:**
```javascript
// HTTP-only, Secure, SameSite=Strict
Set-Cookie: auth_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600;
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800;
```

---

## Part 5: REST API Design (OpenAPI 3.0)

### 5.1 Base URL & Authentication

```
Base: https://app.com/api/v1
Auth: Bearer {access_token}
Headers: Content-Type: application/json, Authorization: Bearer ...
```

### 5.2 Authentication Endpoints

```
POST   /auth/signup
  Body: { email: string }
  Response: { message, sent_to_email }

POST   /auth/callback
  Query: ?token=xyz&email=user@example.com
  Response: { access_token, refresh_token, user: {...} }

POST   /auth/refresh
  Body: { refresh_token: string }
  Response: { access_token, expires_in }

GET    /auth/session
  Response: { user: {...}, teams: [...] }

POST   /auth/logout
  Response: { message }
```

### 5.3 Links Endpoints

```
GET    /teams/{teamId}/links
  Query: ?page=1&limit=50&search=campaign&sort=created_at&order=desc
  Response: { data: [...], total, page, limit }

POST   /teams/{teamId}/links
  Body: { 
    base_url, utm_source, utm_medium, utm_campaign, 
    utm_term?, utm_content?, custom_params?,
    channel_type?, platform?, post_format?
  }
  Response: { id, full_url, qr_code_url, created_at }

GET    /teams/{teamId}/links/{linkId}
  Response: { id, base_url, full_url, utm_*, custom_params, created_at, ... }

PUT    /teams/{teamId}/links/{linkId}
  Body: { utm_campaign?, utm_term?, custom_params? }
  Response: { id, full_url, updated_at }

DELETE /teams/{teamId}/links/{linkId}
  Response: { message }

GET    /teams/{teamId}/links/{linkId}/qr
  Response: { qr_code_url, qr_code_svg }

POST   /teams/{teamId}/links/{linkId}/copy
  Response: { copy_count, copied_at }
```

### 5.4 UTM Parameters Endpoints

```
GET    /teams/{teamId}/utm-params
  Response: { 
    standard: [
      { id, name: "utm_source", type: "standard", values: [...] },
      ...
    ],
    custom: [ ... ]
  }

POST   /teams/{teamId}/utm-params
  Body: { name, type, data_type, required?, description? }
  Response: { id, name, type, created_at }

GET    /teams/{teamId}/utm-params/{paramId}/values
  Response: { parameter: {...}, values: [...] }

POST   /teams/{teamId}/utm-params/{paramId}/values
  Body: { value, label, source? }
  Response: { id, value, label, created_at }

DELETE /teams/{teamId}/utm-params/{paramId}/values/{valueId}
  Response: { message }
```

### 5.5 Naming Conventions Endpoints

```
GET    /teams/{teamId}/naming-conventions
  Response: { default: {...}, custom: [...] }

POST   /teams/{teamId}/naming-conventions
  Body: { name, description, rules: {...}, is_default? }
  Response: { id, name, rules, created_at }

PUT    /teams/{teamId}/naming-conventions/{id}
  Body: { name?, description?, rules?, is_default? }
  Response: { id, updated_at }

DELETE /teams/{teamId}/naming-conventions/{id}
  Response: { message }
```

### 5.6 Integrations Endpoints

```
GET    /teams/{teamId}/integrations
  Response: [
    { id, type: "google_ads", status: "active", last_synced, ... },
    ...
  ]

POST   /teams/{teamId}/integrations/{type}/auth
  Query: ?type=google_ads
  Response: { auth_url: "https://accounts.google.com/o/oauth2/..." }

POST   /teams/{teamId}/integrations/{type}/callback
  Body: { code, state }
  Response: { status: "active", last_synced }

POST   /teams/{teamId}/integrations/sync
  Response: { synced_at, added_values: 42, updated_values: 15 }

POST   /teams/{teamId}/integrations/{id}/disconnect
  Response: { message }
```

### 5.7 Team Endpoints

```
GET    /teams/{teamId}
  Response: { id, name, owner_id, members: [...], tier: "free" }

PUT    /teams/{teamId}
  Body: { name?, workspace_name? }
  Response: { id, updated_at }

POST   /teams/{teamId}/members
  Body: { email, role: "editor" }
  Response: { message: "Invitation sent" }

GET    /teams/{teamId}/members
  Response: [
    { id, email, name, role, joined_at },
    ...
  ]

PUT    /teams/{teamId}/members/{userId}/role
  Body: { role: "admin" }
  Response: { id, role, updated_at }

DELETE /teams/{teamId}/members/{userId}
  Response: { message }
```

### 5.8 API Key Endpoints

```
GET    /teams/{teamId}/api-keys
  Response: [
    { id, name, scopes, rate_limit, requests_this_month, created_at },
    ...
  ]

POST   /teams/{teamId}/api-keys
  Body: { name, scopes: ["links:read", "links:create"] }
  Response: { key: "utm_live_abc123xyz", name, scopes, created_at }
           ⚠️  Key shown ONCE, not retrievable later

DELETE /teams/{teamId}/api-keys/{keyId}
  Response: { message }
```

### 5.9 External API (Content System Integration)

**Purpose:** Allow Get Levrg Content System V2 to generate UTM links without logging in.

**Authentication:** API key in header
```bash
Authorization: Bearer utm_live_abc123xyz
```

**Endpoint:**
```
POST   /external/generate-link
  Body: {
    base_url: "https://blog.example.com/post-slug",
    utm_source: "organic_social",
    utm_medium: "organic_social",
    utm_campaign: "product_launch",
    utm_term?: "social_proof",
    utm_content?: "carousel",
    platform: "linkedin",
    custom_params?: { utm_click_id: "xyz" }
  }
  Response: {
    link_id: "uuid",
    full_url: "https://...",
    qr_code_url: "https://...",
    qr_code_svg: "<svg>...",
    created_at: "2026-04-12T..."
  }
```

---

## Part 6: Complexity Modes (User Experience Layers)

### 6.1 Mode 1: "Simple" (Default for All New Users)

**What User Sees:**
- Single form with 5 fields (no advanced options)
- Platform: Dropdown (Facebook, Instagram, LinkedIn, TikTok, etc.)
- Campaign: Searchable input (dropdown from predefined values)
- Theme/Term: Optional searchable input
- Post Type: Dropdown (Reel, Story, Post, etc.)
- Generate button

**Backend:**
- UTM parameters: Only standard 5 visible
- No custom parameters available
- Naming convention: Applied but not shown
- Permissions: Not enforced (public user)

**Used By:** ICP A (small business owners), new ICP B users

**Duration:** Usually 1-4 weeks before moving to Team Standard

### 6.2 Mode 2: "Team Standard" (After First Link + Login)

**What User Sees:**
- Same simple form
- BUT: "You're in {Team Name}" badge
- View "Naming convention: {name}" summary
- Team members can see/copy your links
- Ability to invite team members

**Backend:**
- Rows filtered by team_id
- Naming convention rules enforced
- Permissions checked (editor vs creator vs viewer)
- Rate limiting: 100 links/month (free tier)

**Used By:** ICP B teams with basic setup (agencies, marketing ops starting out)

**Duration:** Usually 4-12 weeks before moving to Advanced

### 6.3 Mode 3: "Advanced" (Opt-in for Power Users)

**What User Sees:**
- Full UI with tabs: Links, Parameters, Conventions, Integrations, Settings
- Links tab: Master spreadsheet (TanStack Table) + filter/group/sort
- Parameters tab: Standard + custom parameter management
- Conventions tab: Editor to create/modify naming rules
- Integrations tab: Connect Google Ads, Meta, LinkedIn, TikTok
- Settings tab: Team members, roles, API keys

**Backend:**
- Full CRUD on all resources
- Custom parameter creation
- API key generation (rate limiting per tier)
- Multi-step OAuth flows
- Bulk link generation
- Advanced filtering & analytics

**Used By:** ICP B advanced (agencies with complex structures, enterprise)

**Duration:** Ongoing

**Unlock Trigger:** 
- User creates 10+ links in team standard mode
- OR user clicks "Unlock Advanced" button
- OR user subscribes to Pro tier ($15/mo)

### 6.4 Mode 4: "Programmatic" (API-Only)

**No UI.** Fully managed via REST API + webhooks.

**Used By:** 
- Get Levrg Content System V2 (generate links via API)
- External third-party tools
- Automation workflows (Zapier, Make, n8n)

**Unlock Trigger:** 
- Generate API key from Advanced mode
- Subscribe to Pro+ tier (100k requests/month)

---

## Part 7: Current State → V3 Migration Path

### 7.1 Current State (V1)

**Data:**
- localStorage: UtmLinks, UtmValues, DataConnections
- No user/auth data
- No team concept
- ~50-200 links per localStorage user

**Code Structure:**
```
src/
  app/
    page.tsx (redirects to /organic)
    organic/page.tsx (main form)
    ads/page.tsx (ads page, mock data)
    settings/
      values/page.tsx (manage values)
      connections/page.tsx (Google Sheets, Airtable)
  components/
    organic/ (UTM form, results, table)
    settings/ (value section, sheets connection, airtable)
  lib/
    storage.ts (localStorage wrapper)
    utm-config.ts (UTM framework)
    google/ (auth, sheets API)
    airtable/ (API)
    types.ts
```

**Limitations:**
- Single user only
- No permissions
- No custom UTM params
- No team management
- No API
- localStorage limits (5-10MB per domain)

### 7.2 Migration Strategy (Parallel Path)

**Phase 1: Set up new infrastructure (Week 1-2)**
- Supabase project created
- Database schema initialized
- Auth system implemented
- New API routes created

**Phase 2: Dual-write approach (Week 3-4)**
- During development, write to BOTH localStorage (existing) and PostgreSQL (new)
- Old users still use old app (unchanged)
- New signup path goes to new system
- This allows rollback if issues arise

**Phase 3: Data migration (Week 5)**
- Migrate active users' localStorage data to PostgreSQL
- One-time migration: "Save to cloud" button
- Auto-sync on login for existing users
- Preserve data ownership (each user becomes team owner)

**Phase 4: Switch traffic (Week 6)**
- Redirect old app to new system
- Old localStorage as fallback
- Monitor for issues
- Keep offline access available (service worker + local cache)

### 7.3 Code Changes Required

**New Files/Directories:**
```
src/
  app/
    api/v1/
      auth/
        signup/route.ts
        callback/route.ts
        refresh/route.ts
        logout/route.ts
        session/route.ts
      teams/{teamId}/
        links/route.ts
        utm-params/route.ts
        integrations/route.ts
        members/route.ts
        naming-conventions/route.ts
      external/
        generate-link/route.ts
    onboarding/
      page.tsx
      team-creation/page.tsx
    dashboard/
      page.tsx
      team-switcher.tsx
  middleware.ts (auth, team context)
  lib/
    auth.ts (Supabase client, token management)
    db.ts (database queries)
    permissions.ts (RBAC checks)
    api/
      teams/route-handlers.ts
      links/route-handlers.ts
      integrations/route-handlers.ts
  hooks/
    use-auth.ts (current user + team)
    use-team.ts (team context)
    use-permissions.ts (check user's permissions)
  context/
    AuthContext.tsx
    TeamContext.tsx

env/
  .env.example → add Supabase keys
  .env.local → user fills in
```

**Modified Files:**
```
src/
  app/
    page.tsx → redirect to /dashboard (not /organic)
    organic/page.tsx → add team context, update to use API
    ads/page.tsx → migrate to use API
    settings/
      values/page.tsx → team-scoped, API-based
      connections/page.tsx → team-scoped, API-based
  components/
    organic/
      utm-generator-form.tsx → add team context, custom params support
      links-table.tsx → API-based with pagination
    layout/
      sidebar.tsx → add team switcher, add settings menu
  lib/
    storage.ts → deprecate, replace with API calls
    types.ts → add new types (User, Team, Permissions)
```

---

## Part 8: Implementation Phases (10 Weeks)

### Phase 1: Foundation (Week 1-2) - Authentication & Teams

**Goals:**
- Supabase project set up
- User signup/login flow working
- Team creation/switching working
- Basic RLS policies active

**Tasks:**
1. **Infrastructure Setup (3 days)**
   - Create Supabase project (free tier)
   - Enable PostgreSQL, Auth, Storage
   - Configure Google OAuth credentials
   - Set environment variables

2. **Database Schema (2 days)**
   - Create all tables (users, teams, team_members, permissions, api_keys)
   - Add RLS policies for team isolation
   - Create necessary indices
   - Test queries work with RLS

3. **Auth API Routes (2 days)**
   - POST /api/auth/signup (send magic link)
   - POST /api/auth/callback (verify magic link)
   - POST /api/auth/refresh (refresh access token)
   - GET /api/auth/session (get current user)
   - POST /api/auth/logout (revoke tokens)

4. **Auth Frontend Components (1 day)**
   - LoginPage component
   - OnboardingPage (team creation)
   - AuthContext (track current user + team)
   - ProtectedRoute wrapper

5. **Team Management Routes (1 day)**
   - POST /api/teams (create team)
   - GET /api/teams (list user's teams)
   - GET /api/teams/{teamId} (get team details)

6. **Testing (1 day)**
   - Auth flow tests (signup, login, logout)
   - Team creation tests
   - RLS policy tests
   - Database integrity tests

**Deliverables:**
- ✅ User can sign up with email
- ✅ User receives magic link, clicks it, logged in
- ✅ User creates a team
- ✅ User can switch between teams
- ✅ Data isolation working (RLS verified)

---

### Phase 2: Core UTM Features (Week 3-4) - Links & Parameters

**Goals:**
- Link creation/management working
- UTM parameter management working
- Simple mode UI functional
- API endpoints CRUD-complete

**Tasks:**

1. **Link Management API (2 days)**
   - POST /api/teams/{teamId}/links (create)
   - GET /api/teams/{teamId}/links (list with pagination)
   - GET /api/teams/{teamId}/links/{linkId} (get)
   - PUT /api/teams/{teamId}/links/{linkId} (update)
   - DELETE /api/teams/{teamId}/links/{linkId} (delete with soft delete)

2. **UTM Parameter Management API (2 days)**
   - GET /api/teams/{teamId}/utm-params (list standard + custom)
   - POST /api/teams/{teamId}/utm-params (create custom)
   - GET /api/teams/{teamId}/utm-params/{paramId}/values (list values)
   - POST /api/teams/{teamId}/utm-params/{paramId}/values (add value)
   - DELETE /api/teams/{teamId}/utm-params/{paramId}/values/{valueId} (remove value)

3. **Naming Conventions API (1 day)**
   - POST /api/teams/{teamId}/naming-conventions (create)
   - GET /api/teams/{teamId}/naming-conventions (list)
   - PUT /api/teams/{teamId}/naming-conventions/{id} (update)
   - Validation logic: apply naming convention rules to values

4. **Frontend: Simple Mode (2 days)**
   - Modify utm-generator-form.tsx to use API instead of localStorage
   - Add team context to form
   - Fetch utm_parameter values from API
   - Apply naming convention auto-formatting
   - Show team name in header

5. **Frontend: Master Spreadsheet (1 day)**
   - Modify links-table.tsx to fetch from API
   - Add pagination (API-based)
   - Add filtering by campaign, source, date
   - Group by naming convention

6. **Testing (1 day)**
   - Link CRUD tests (API)
   - Parameter CRUD tests
   - Naming convention validation tests
   - Permission checks (editor vs creator)

**Deliverables:**
- ✅ User creates UTM link via Simple mode UI
- ✅ Link saved to PostgreSQL (not localStorage)
- ✅ User sees link in master spreadsheet (paginated)
- ✅ User can edit custom parameters
- ✅ Naming convention rules validated on create

---

### Phase 3: Integrations (Week 5-6) - Google Ads, Meta, LinkedIn, TikTok

**Goals:**
- Google Ads OAuth working
- Meta Ads OAuth working
- LinkedIn Ads OAuth working
- TikTok Ads OAuth working
- Auto-import campaign/adset names as UTM values

**Tasks:**

1. **Google Ads Integration (2 days)**
   - POST /api/teams/{teamId}/integrations/google-ads/auth (OAuth consent URL)
   - POST /api/teams/{teamId}/integrations/google-ads/callback (exchange code)
   - Background job: Fetch campaigns from Google Ads API
   - Auto-create utm_parameter_values from campaign/adset names
   - Store credentials encrypted in integrations table

2. **Meta Ads Integration (1 day)**
   - Same pattern as Google Ads
   - Fetch Ad Account → Campaigns → AdSets
   - Create values

3. **LinkedIn Ads Integration (1 day)**
   - Same pattern
   - Fetch Campaigns → Creatives

4. **TikTok Ads Integration (1 day)**
   - Same pattern
   - Fetch Campaigns → AdGroups → Ads

5. **Sync Endpoint (1 day)**
   - POST /api/teams/{teamId}/integrations/sync
   - Trigger all connected integrations to refresh
   - Return count of new/updated values

6. **Frontend: Integration Settings (1 day)**
   - IntegrationCard component (show status, last_synced)
   - Connect buttons (OAuth redirect)
   - Sync Now button
   - Disconnect button (with confirmation)

7. **Testing (1 day)**
   - OAuth flow tests (mock OAuth response)
   - API fetch tests (mock Google Ads/Meta/LinkedIn/TikTok responses)
   - Error handling (expired tokens, network errors)
   - Rate limiting tests

**Deliverables:**
- ✅ User clicks "Connect Google Ads"
- ✅ OAuth flow completes, credentials stored
- ✅ Campaigns auto-imported as utm_campaign values
- ✅ User can sync all integrations
- ✅ Values auto-populate in dropdown on link creation

---

### Phase 4: API & Advanced Features (Week 7-8) - Programmatic Access & Power Features

**Goals:**
- API key system working
- External API endpoint functional
- Team member management working
- Advanced mode UI operational
- Custom parameter creation working

**Tasks:**

1. **API Key Management (1 day)**
   - POST /api/teams/{teamId}/api-keys (create key)
   - GET /api/teams/{teamId}/api-keys (list keys)
   - DELETE /api/teams/{teamId}/api-keys/{keyId} (delete)
   - Rate limiting logic (per-tier, per-month)

2. **External API Endpoint (2 days)**
   - POST /api/external/generate-link (no auth, API key only)
   - Generate link for external systems (Content System V2)
   - Return full_url + qr_code_url
   - Rate limit by API key

3. **Team Member Management API (1 day)**
   - POST /api/teams/{teamId}/members (invite user)
   - GET /api/teams/{teamId}/members (list members)
   - PUT /api/teams/{teamId}/members/{userId}/role (change role)
   - DELETE /api/teams/{teamId}/members/{userId} (remove user)
   - Send email invitations

4. **Advanced Mode UI (2 days)**
   - TabsComponent: Links | Parameters | Conventions | Integrations | Settings
   - ParametersTab: List standard, list custom, create custom, manage values
   - IntegrationsTab: All integrations with status + sync buttons
   - SettingsTab: Team name, members, roles, API keys
   - Permissions checks: Only admins see Settings tab, etc.

5. **Custom Parameters UI (1 day)**
   - Form to create custom parameter
   - Data type selector (string, number, alphanumeric, email, uuid)
   - Validation rules
   - Delete custom parameter (with confirm)

6. **Testing (1 day)**
   - API key lifecycle tests
   - External API endpoint tests (rate limiting, auth)
   - Team member invitation tests
   - Permission enforcement tests (editor vs creator vs viewer)

**Deliverables:**
- ✅ Admin generates API key from Settings
- ✅ Content System V2 calls /api/external/generate-link with key
- ✅ Link created, returned with QR code
- ✅ Team member invited via email
- ✅ Member joins team, assigned role
- ✅ Viewer can see links, copy them, but not edit
- ✅ Creator can create links, not edit others'

---

### Phase 5: Polish & Launch (Week 9-10) - QR Codes, Analytics, Notifications, Docs

**Goals:**
- QR code generation polished
- Basic analytics working
- Notifications implemented
- Documentation complete
- Performance optimized
- Ready for production

**Tasks:**

1. **QR Code Enhancement (1 day)**
   - GET /api/teams/{teamId}/links/{linkId}/qr (fetch QR)
   - Generate on-demand (not stored by default)
   - Cache QR in Redis for 1 hour
   - Return both PNG URL + SVG for embedding
   - Frontend: QR preview in link details

2. **Basic Analytics (1 day)**
   - Link click tracking (redirect endpoint)
   - GET /api/teams/{teamId}/links/{linkId}/analytics (click counts)
   - Analytics dashboard (chart of clicks over time)
   - Top links by clicks

3. **Notifications (1 day)**
   - Slack integration: POST /api/teams/{teamId}/integrations/slack/auth
   - Send notification when link shared/copied
   - Send notification on team member invite
   - Send weekly summary (X links created, Y clicks)

4. **Documentation (1 day)**
   - OpenAPI spec generated (Swagger)
   - API documentation deployed (Swagger UI)
   - User guide (getting started, integrations, API)
   - Developer guide (how to use external API)

5. **Performance Optimization (1 day)**
   - Database query optimization (indices verified)
   - API response times measured
   - Frontend bundle size analyzed
   - Caching strategy for utm_parameter_values

6. **Testing & QA (2 days)**
   - Full end-to-end tests (signup → create link → invite member → view as viewer)
   - Load testing (1000 concurrent users)
   - Security audit (JWT validation, RLS policies, API auth)
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)

7. **Deployment Prep (1 day)**
   - Vercel deployment configured
   - Supabase backup strategy
   - Monitoring setup (error tracking, performance)
   - Rollback plan

**Deliverables:**
- ✅ QR code generated for every link
- ✅ Click tracking functional
- ✅ Slack notifications sent
- ✅ API documentation live (Swagger)
- ✅ App deployed to production (Vercel + Supabase)
- ✅ Monitoring alerts configured
- ✅ Rollback procedure documented

---

## Part 9: Implementation Approach Based on Current Code

### 9.1 Reusing Existing Code

**Keep (No Changes):**
- `src/lib/types.ts` - Extend with new User/Team/Permission types
- `src/lib/utm-config.ts` - Use existing UTM framework (getPlatformsForChannel, getUtmMedium, buildUtmUrl)
- `src/lib/utils/to-snake-case.ts` - Reuse for naming convention auto-formatting
- `src/components/ui/*` - All shadcn/ui components (button, badge, input, etc.)
- `src/components/layout/sidebar.tsx` - Extend with team switcher

**Refactor (Significant Changes):**
- `src/lib/storage.ts` → Deprecate. Move all storage to API calls + React Context
- `src/components/organic/utm-generator-form.tsx` → Add team context, API integration, naming convention UI
- `src/components/organic/links-table.tsx` → API-based with pagination, permission checks
- `src/app/organic/page.tsx` → Add role-based visibility

**New Files:**
- All API routes (`src/app/api/v1/...`)
- Auth context & hooks
- Team context & hooks
- Permission utilities
- Database query helpers

### 9.2 Database Layer Architecture

**Pattern: Supabase Client in Route Handlers**

```typescript
// src/app/api/v1/teams/[teamId]/links/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = params;
  const userId = (await request.json()).user_id; // From JWT
  
  // RLS handles team isolation automatically
  const { data, error } = await supabase
    .from('utm_links')
    .insert({
      team_id: teamId,
      created_by: userId,
      base_url: '...',
      utm_source: '...',
      // ...
    })
    .select();
  
  return Response.json(data);
}
```

**Frontend Pattern: useQuery Hook**

```typescript
// src/hooks/use-links.ts
import { useQuery } from '@tanstack/react-query';

export function useLinks(teamId: string) {
  return useQuery({
    queryKey: ['links', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}/links`);
      return res.json();
    }
  });
}
```

### 9.3 Naming Conventions in Code

**Storage:**
```typescript
interface NamingConvention {
  id: string;
  team_id: string;
  name: string;
  rules: {
    utm_source?: {
      pattern: string;      // regex
      transform?: 'lowercase' | 'lowercase_underscore' | 'uppercase';
      examples: string[];
    };
    utm_campaign?: { ... };
    utm_term?: { ... };
    // ... per parameter
  };
  validation: {
    max_length: number;
    min_length: number;
    reserved_words: string[];
  };
}
```

**Validation:**
```typescript
// src/lib/naming-convention-validator.ts
export function validateAgainstConvention(
  value: string,
  convention: NamingConvention,
  parameterName: 'utm_source' | 'utm_campaign' | 'utm_term'
): { valid: boolean; transformed: string; errors: string[] } {
  const rules = convention.rules[parameterName];
  if (!rules) return { valid: true, transformed: value, errors: [] };
  
  // Check pattern
  if (!new RegExp(rules.pattern).test(value)) {
    return {
      valid: false,
      transformed: value,
      errors: [`Doesn't match pattern: ${rules.pattern}`]
    };
  }
  
  // Check reserved words
  if (convention.validation.reserved_words.includes(value.toLowerCase())) {
    return {
      valid: false,
      transformed: value,
      errors: ['{value} is a reserved word']
    };
  }
  
  // Apply transform
  let transformed = value;
  if (rules.transform === 'lowercase') {
    transformed = value.toLowerCase();
  } else if (rules.transform === 'lowercase_underscore') {
    transformed = toSnakeCase(value);
  }
  
  return { valid: true, transformed, errors: [] };
}
```

---

## Part 10: Branching Strategy & Deployment

### 10.1 Git Workflow

**Branch Structure:**
```
main (production, always deployable)
  ↑
dev (development, merges from features)
  ↑
feature/* (individual features)
  - feature/auth-foundation
  - feature/link-management
  - feature/google-ads-integration
  - feature/api-endpoints
  - feature/advanced-ui
```

**Workflow:**
```
1. Create feature branch: git checkout -b feature/auth-foundation
2. Implement Phase 1 tasks
3. Write tests
4. Create PR to dev
5. Code review (self-review is fine for MVP)
6. Merge to dev
7. Every Friday: Merge dev → main
8. Every Friday: Deploy main to Vercel
```

### 10.2 Deployment Pipeline

**Automated:**
- Vercel watches main branch
- Build runs on every commit to main
- Deploys to production if tests pass
- Environment: Use .env.local with Supabase keys

**Manual Steps:**
1. Run database migrations (if any schema changes)
2. Test in production (signup flow, link creation, integrations)
3. Monitor error tracking (Sentry or Vercel logs)

### 10.3 Database Versioning

**Migrations Folder:**
```
src/lib/db/migrations/
  001_initial_schema.sql
  002_add_naming_conventions.sql
  003_add_qr_code_fields.sql
```

**Before Each Deploy:**
```bash
# Run any pending migrations
SUPABASE_PROJECT_REF=... npx supabase db push
```

---

## Part 11: What Comes Next (After Documentation Complete)

### Phase Completion Checklist

Once ARCHITECTURE_V3.md is complete and approved:

**Before Implementation Starts:**
1. ✅ Review & approve ARCHITECTURE_V3.md
2. ✅ Set up Supabase project (create free account, initialize)
3. ✅ Create `.env.example` with required keys
4. ✅ Document setup process (README)
5. ✅ Create GitHub issues for each phase
6. ✅ Assign story points / estimates

**Implementation Order:**
1. **Phase 1 (Week 1-2):** Auth + Teams
   - Goal: User can sign up, create team, team switching works
   - Success: 3 test users with separate teams

2. **Phase 2 (Week 3-4):** Link + Parameter management
   - Goal: Simple mode works via API, data in PostgreSQL
   - Success: Old localStorage data migrates to new system

3. **Phase 3 (Week 5-6):** Integrations
   - Goal: Can import from 4 ad platforms
   - Success: 10+ campaign names auto-populated from Google Ads

4. **Phase 4 (Week 7-8):** API + Advanced UI
   - Goal: Advanced mode operational, API key works
   - Success: Content System V2 can generate links via API

5. **Phase 5 (Week 9-10):** Polish + Launch
   - Goal: Production-ready, documented
   - Success: Live on vercel.com, 10 beta users testing

### Critical Success Metrics

**Week 2 (End Phase 1):**
- Auth flows working (signup, login, logout)
- 3+ test teams created
- RLS policies verified protecting data

**Week 4 (End Phase 2):**
- Link creation/deletion working via API
- Old localStorage data successfully migrated
- Performance: Link creation <200ms p99

**Week 6 (End Phase 3):**
- All 4 ad platforms integrated
- Campaign names auto-imported
- Sync success rate >95%

**Week 8 (End Phase 4):**
- Content System V2 generating links via external API
- API key rate limiting working
- Team member invitations working

**Week 10 (End Phase 5):**
- QR codes generated, click tracking working
- 10 beta users onboarded
- 50+ links created (proof of concept)
- Zero critical bugs in first week

---

## Part 12: Comparison: V1 vs V3

| Aspect | V1 | V3 |
|--------|----|----|
| **Storage** | localStorage (5-10MB limit) | PostgreSQL (unlimited) |
| **Users** | Single user only | Multi-user + teams |
| **Auth** | None | Magic link + Google OAuth |
| **Permissions** | None | RBAC (4 roles) |
| **Custom UTM params** | ❌ | ✅ (enterprise feature) |
| **Naming conventions** | ❌ | ✅ (validation + auto-format) |
| **API** | ❌ | ✅ (for Content System) |
| **Ad platform imports** | ❌ | ✅ (Google, Meta, LinkedIn, TikTok) |
| **QR codes** | Future | ✅ Built-in |
| **Link analytics** | ❌ | ✅ (clicks tracked) |
| **Team collaboration** | ❌ | ✅ (invite members, roles) |
| **Pricing** | Free forever | Free + Pro ($15) + Agency ($39) |
| **Time to implement** | 2 weeks (done) | 10 weeks |
| **DB queries needed** | 0 | 27+ endpoints |
| **Security audit** | Not needed | JWT, RLS, API auth |

---

## Part 13: Security Deep Dive

### 13.1 Authentication Flow

```
User signup flow:
1. User enters email: user@example.com
2. System generates magic link token
3. Email sent: "Click here to login: https://app.com/auth/callback?token=xyz&email=user@example.com"
4. User clicks link
5. Token verified against Supabase Auth
6. Session created: JWT access_token (1h) + refresh_token (7d)
7. Stored in HTTP-only cookies
8. User redirected to /dashboard

Subsequent requests:
- Access token in Authorization header: Bearer {token}
- If expired: Use refresh token to get new access token
- If both expired: Redirect to login
```

### 13.2 API Key Security

```
Creation flow:
1. Admin clicks "Generate API Key"
2. System creates: key = "utm_live_" + random(32 chars)
3. Key hash = sha256(key)
4. Database stores: key_hash, NOT the key itself
5. API returns key ONE TIME: "utm_live_abc123xyz...copy this now"
6. Key not retrievable later (hash only in DB)

API request:
POST /external/generate-link
Authorization: Bearer utm_live_abc123xyz...

Server:
1. Extract key from header
2. Hash the key: sha256(key)
3. Look up key_hash in database
4. Find team_id associated with key
5. Check rate limit: requests_this_month < rate_limit
6. Process request
7. Increment requests_this_month
```

### 13.3 Row-Level Security (RLS)

```
Example: Viewer in Team A should NOT see links from Team B

Database policy:
CREATE POLICY link_visibility ON utm_links FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  )
);

When User A (viewer in Team B) runs:
SELECT * FROM utm_links;

Database automatically filters:
WHERE team_id IN (
  SELECT team_id FROM team_members WHERE user_id = 'user-a-id'
)

Result: Only Team B's links returned, even if they try to hack the query
```

### 13.4 Permissions Enforcement (Backend)

```typescript
// Every API endpoint must check permissions

// Example: POST /api/teams/{teamId}/utm-params
export async function POST(request, { params }) {
  const userId = getAuthUser(request).id;
  const { teamId } = params;
  
  // 1. Check user is member of team
  const member = await getTeamMember(teamId, userId);
  if (!member) throw new Unauthorized();
  
  // 2. Check user has permission
  const perms = await getPermission(member.role);
  if (!perms.can_create_utm_params) throw new Forbidden();
  
  // 3. Proceed with creation
  const param = await createUtmParameter(teamId, data);
  return Response.json(param);
}
```

### 13.5 Data Encryption

```
At Rest:
- Supabase encrypts all data at rest (AES-256)
- Database backups encrypted

In Transit:
- All HTTPS (TLS 1.3)
- JWT tokens signed with RS256

API Keys:
- Hashed with SHA-256 before storage
- Never logged
- Shown only once on creation

Integrations Config:
- Stored as JSONB encrypted
- Access tokens for Google/Meta/LinkedIn/TikTok encrypted
- Never logged
```

---

## Part 14: Testing Strategy

### 14.1 Unit Tests (Vitest)

```typescript
// src/lib/naming-convention-validator.test.ts
describe('validateAgainstConvention', () => {
  it('accepts valid snake_case values', () => {
    const convention = createMockConvention('snake_case');
    const result = validateAgainstConvention('product_launch', convention, 'utm_campaign');
    expect(result.valid).toBe(true);
    expect(result.transformed).toBe('product_launch');
  });
  
  it('rejects values with spaces', () => {
    const convention = createMockConvention('snake_case');
    const result = validateAgainstConvention('Product Launch', convention, 'utm_campaign');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Doesn\'t match pattern');
  });
  
  it('transforms to snake_case when rule requires', () => {
    const convention = createMockConvention('auto_transform');
    const result = validateAgainstConvention('Product Launch', convention, 'utm_campaign');
    expect(result.transformed).toBe('product_launch');
  });
});
```

### 14.2 Integration Tests (RTL + API Mocking)

```typescript
// src/components/organic/utm-generator-form.test.tsx
describe('UTM Generator Form (with API)', () => {
  it('creates link via API and shows result', async () => {
    // Mock API
    MSW.use(
      http.post('/api/v1/teams/:teamId/links', async ({ request }) => {
        return HttpResponse.json({
          id: 'link-123',
          full_url: 'https://...',
          created_at: '2026-04-12T...'
        });
      })
    );
    
    // Render form
    const { getByRole, getByText } = render(<UtmGeneratorForm teamId="team-1" />);
    
    // Fill form
    fireEvent.change(getByRole('textbox', { name: /base url/i }), {
      target: { value: 'https://example.com' }
    });
    fireEvent.click(getByRole('button', { name: /generate/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(getByText(/link created/i)).toBeInTheDocument();
    });
  });
});
```

### 14.3 E2E Tests (Playwright)

```typescript
// e2e/auth.spec.ts
test.describe('Authentication Flow', () => {
  test('user can sign up and create team', async ({ page }) => {
    // Navigate to signup
    await page.goto('/auth/signup');
    
    // Enter email
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button:has-text("Send Link")');
    
    // Wait for "Check your email" message
    await expect(page.locator('text=Check your email')).toBeVisible();
    
    // In real test: extract link from email, click it
    // For demo: navigate directly to callback with token
    // (in real flow, user would get link in email)
    
    // Complete signup (create team)
    await page.goto('/onboarding/team-creation');
    await page.fill('[name="team_name"]', 'My Test Team');
    await page.click('button:has-text("Create Team")');
    
    // Verify redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=My Test Team')).toBeVisible();
  });
});
```

### 14.4 Performance Tests

```typescript
// e2e/performance.spec.ts
test('link creation responds in <200ms p99', async ({ page }) => {
  // Setup: logged in, on organic page
  
  // Measure time to create link
  const start = performance.now();
  
  // Fill form, submit
  await page.fill('[name="base_url"]', 'https://example.com');
  await page.selectOption('[name="campaign"]', 'launch');
  await page.click('button:has-text("Generate")');
  
  // Wait for result
  await page.waitForSelector('text=Link created');
  
  const duration = performance.now() - start;
  console.log(`Link creation time: ${duration}ms`);
  expect(duration).toBeLessThan(200);
});
```

### 14.5 Security Tests

```typescript
// e2e/security.spec.ts
test('cannot access other team\'s data', async ({ page, context }) => {
  // Create 2 users with 2 teams
  const user1 = await signup({ email: 'user1@test.com' });
  const user2 = await signup({ email: 'user2@test.com' });
  
  // User 1: Create link in Team A
  await loginAsUser(page, user1);
  await page.goto('/organic');
  await createLink(page, 'user1-link');
  
  // User 2: Try to access User 1's link via direct API call
  const response = await fetch('/api/v1/teams/{teamA}/links', {
    headers: { Authorization: `Bearer ${user2.token}` }
  });
  
  // Should get 403 Forbidden or empty response (RLS filters it)
  expect(response.status).toBe(403);
  // OR expect response data to be empty (RLS silently filters)
});
```

---

## Part 15: Documentation Structure

After implementation, documentation should include:

1. **Developer Guide**
   - Local setup (npm install, Supabase keys)
   - Running tests
   - Architecture walkthrough
   - How to add new features

2. **API Documentation**
   - OpenAPI/Swagger spec
   - Example requests/responses per endpoint
   - Rate limits
   - Error codes

3. **User Guide**
   - Getting started (signup, first link)
   - Integrations setup
   - Team management
   - Advanced features (custom params, naming conventions)
   - API usage for external systems

4. **Infrastructure Guide**
   - Supabase setup
   - Vercel deployment
   - Environment variables
   - Monitoring & alerts
   - Disaster recovery

---

## Summary: Next Steps After Documentation

1. **This Document is Done** ✅
   - Full ARCHITECTURE_V3.md complete with all implementation details
   - Ready for review and approval

2. **Next Steps (After Approval):**
   - [ ] Review ARCHITECTURE_V3.md
   - [ ] Create Supabase account (free tier)
   - [ ] Document setup process
   - [ ] Create GitHub issues for each phase
   - [ ] Begin Phase 1 implementation

3. **Expected Timeline:**
   - Approval & setup: 2-3 days
   - Phase 1: 10 working days (2 weeks)
   - Phase 2: 10 working days (2 weeks)
   - Phase 3: 10 working days (2 weeks)
   - Phase 4: 10 working days (2 weeks)
   - Phase 5: 10 working days (2 weeks)
   - **Total: 10 weeks (50 work days)**

4. **Resources Needed:**
   - Supabase free tier (PostgreSQL 500MB, Auth, Storage)
   - Vercel (already using)
   - Google/Meta/LinkedIn/TikTok OAuth apps (registration needed)
   - ~50 working hours of coding

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2026-04-12  
**Version:** 3.0
