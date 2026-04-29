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

