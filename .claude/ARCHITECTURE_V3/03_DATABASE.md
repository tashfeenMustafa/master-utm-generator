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

