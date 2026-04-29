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

