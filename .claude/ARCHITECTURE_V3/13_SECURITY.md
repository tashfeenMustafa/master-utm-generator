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

