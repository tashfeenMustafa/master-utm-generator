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

