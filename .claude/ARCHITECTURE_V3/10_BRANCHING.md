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

