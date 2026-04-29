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

