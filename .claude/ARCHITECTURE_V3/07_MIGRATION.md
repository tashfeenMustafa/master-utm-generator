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

