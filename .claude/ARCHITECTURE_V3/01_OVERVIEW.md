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

