# Architecture V3 Documentation Index

Master UTM Generator V2 multi-tenant architecture, split into modular, focused documents.

**Last updated:** 2026-04-12  
**Status:** Implementation ready (5 phases, 10 weeks)

---

## Quick Navigation

### Starting Out (First Time?)
Read in this order:
1. [01_OVERVIEW.md](./01_OVERVIEW.md) — Executive summary + strategic context (15 min)
2. [02_STACK.md](./02_STACK.md) — Technology choices (10 min)
3. [03_DATABASE.md](./03_DATABASE.md) — Data model (20 min)
4. [05_API.md](./05_API.md) — 30+ endpoint design (25 min)

### For Builders
- [08_IMPLEMENTATION.md](./08_IMPLEMENTATION.md) — 5-phase roadmap, 10 weeks, week-by-week breakdown
- [07_MIGRATION.md](./07_MIGRATION.md) — V1 → V3 data migration strategy
- [04_AUTH.md](./04_AUTH.md) — Magic links, OAuth 2.0, multi-tenant session management

### For Security & Ops
- [13_SECURITY.md](./13_SECURITY.md) — Row-Level Security, data isolation, threat model
- [14_TESTING.md](./14_TESTING.md) — Test strategy, coverage targets, API testing

### Reference
- [06_COMPLEXITY_MODES.md](./06_COMPLEXITY_MODES.md) — UX layers (Simple, Team Standard, Advanced, Programmatic)
- [10_BRANCHING.md](./10_BRANCHING.md) — Git strategy for feature branches + deployment
- [11_NEXT_STEPS.md](./11_NEXT_STEPS.md) — Post-implementation roadmap

---

## Document Breakdown

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[01_OVERVIEW.md](./01_OVERVIEW.md)** | Architecture goals, V1→V3 differences, high-level design | 15 min |
| **[02_STACK.md](./02_STACK.md)** | Frontend, backend, database, auth, hosting choices & rationale | 10 min |
| **[03_DATABASE.md](./03_DATABASE.md)** | 13+ tables, relationships, indexes, soft deletes, RLS rules | 25 min |
| **[04_AUTH.md](./04_AUTH.md)** | Magic links, OAuth integrations, JWT tokens, RBAC (4 roles) | 20 min |
| **[05_API.md](./05_API.md)** | 30+ REST endpoints, request/response schemas, error handling | 30 min |
| **[06_COMPLEXITY_MODES.md](./06_COMPLEXITY_MODES.md)** | 4 UX layers for different user types (Simple/Standard/Advanced/API) | 15 min |
| **[07_MIGRATION.md](./07_MIGRATION.md)** | V1 localStorage → V3 PostgreSQL data migration | 20 min |
| **[08_IMPLEMENTATION.md](./08_IMPLEMENTATION.md)** | 5-phase roadmap, 10-week timeline, week-by-week tasks | 45 min |
| **[09_IMPLEMENTATION_APPROACH.md](./09_IMPLEMENTATION_APPROACH.md)** | Code structure, patterns, current state considerations | 20 min |
| **[10_BRANCHING.md](./10_BRANCHING.md)** | Git workflow, feature branches, CI/CD, deployment process | 15 min |
| **[11_NEXT_STEPS.md](./11_NEXT_STEPS.md)** | Phase 3 & beyond (integrations, VPD, mobile) | 10 min |
| **[12_COMPARISON.md](./12_COMPARISON.md)** | V1 vs V3 feature matrix | 5 min |
| **[13_SECURITY.md](./13_SECURITY.md)** | RLS, data isolation, threat model, secrets management | 25 min |
| **[14_TESTING.md](./14_TESTING.md)** | Test strategy, API testing, performance targets | 20 min |
| **[15_SUMMARY.md](./15_SUMMARY.md)** | Quick reference checklist | 5 min |

---

## Key Numbers at a Glance

- **Database tables:** 13 (users, teams, links, UTM values, naming conventions, etc.)
- **REST API endpoints:** 30+
- **Authentication methods:** Magic links + 5 OAuth providers (Google, Meta, LinkedIn, TikTok, Slack)
- **User roles:** 4 (Admin, Editor, Creator, Viewer)
- **Implementation timeline:** 5 phases over 10 weeks
- **Phase 1 focus:** Auth + Teams (foundation)
- **Phase 5 result:** Fully functional multi-tenant SaaS ready for launch

---

## Common Questions

**Q: Where do I start if I'm a new developer?**  
A: Read OVERVIEW.md → STACK.md → IMPLEMENTATION.md. Then jump to the specific phase you're implementing.

**Q: How do I prevent users from seeing other teams' data?**  
A: See SECURITY.md → Row-Level Security section. RLS rules automatically filter by `team_id`.

**Q: What's the difference between V1 and V3?**  
A: See OVERVIEW.md → Architecture Goals section. TL;DR: Single-user (V1) → Multi-tenant teams (V3) with OAuth, API, analytics.

**Q: I'm implementing Phase 2 (Links). Where do I look?**  
A: IMPLEMENTATION.md → Phase 2, then reference DATABASE.md for schema and API.md for endpoint design.

**Q: What about integrations (Google Ads, Meta)?**  
A: Phase 3 (see IMPLEMENTATION.md). OAuth 2.0 setup is in AUTH.md.

**Q: How are naming conventions enforced?**  
A: API routes validate against `naming_convention` rules stored per team. See API.md → Links endpoint.

---

## File Organization

```
.claude/ARCHITECTURE_V3/
├── INDEX.md ................................... This file (navigation guide)
├── README.md ................................... Folder overview & extraction history
├── 01_OVERVIEW.md .............................. Architecture goals + high-level design
├── 02_STACK.md ................................. Technology choices
├── 03_DATABASE.md .............................. Schema (13+ tables, relationships, indices)
├── 04_AUTH.md .................................. Authentication & authorization (magic links, OAuth)
├── 05_API.md ................................... REST API design (30+ endpoints, schemas)
├── 06_COMPLEXITY_MODES.md ..................... UX layers (Simple/Standard/Advanced/API)
├── 07_MIGRATION.md ............................. V1 → V3 data migration strategy
├── 08_IMPLEMENTATION.md ........................ 5-phase roadmap (10 weeks, detailed)
├── 09_IMPLEMENTATION_APPROACH.md .............. Code structure, patterns, current state
├── 10_BRANCHING.md ............................. Git workflow & deployment process
├── 11_NEXT_STEPS.md ............................ Phase 3+ roadmap (integrations, etc.)
├── 12_COMPARISON.md ............................ V1 vs V3 comparison matrix
├── 13_SECURITY.md .............................. RLS, data isolation, threat model
├── 14_TESTING.md ............................... Test strategy & performance targets
└── 15_SUMMARY.md ............................... Quick reference checklist
```

---

## Implementation Status

- ✅ Architecture designed
- ✅ Schema finalized
- ✅ API design complete
- ✅ Complexity modes defined
- ✅ Phase 1-5 roadmap created
- ⏳ Ready for implementation (Phase 1 starts after V1 Phase 2 ships)

---

## Versioning

- **V3 Release:** Planned for Q2 2026 (after V1 Phase 2 ships)
- **Last Architecture Update:** 2026-04-12
- **Documented by:** Claude Code
- **Review Status:** Ready for development team review

---

## Key Decisions (Why?)

**Why PostgreSQL (Supabase)?**
- Managed service (no ops overhead)
- Row-Level Security for multi-tenant data isolation
- Free tier for MVP (500MB)
- Auth built-in (magic links + OAuth)

**Why REST API over GraphQL?**
- Simpler caching (HTTP semantics)
- Easier for webhook integrations (OAuth providers)
- Better for mobile clients (smaller payloads with specific endpoints)

**Why 4 user roles instead of more?**
- Admin → Full control
- Editor → Can modify links + naming conventions
- Creator → Can only create links
- Viewer → Read-only (analytics, reports)
- Keeps UI simple, covers 95% of team use cases

**Why complexity modes?**
- Beginner users want "just generate a link"
- Advanced teams want "naming rules + validation"
- API-only clients want "programmatic everything"
- One product, 4 interfaces (no separate SKUs, just UI complexity)

---

## Getting Help

- **Architecture questions?** See the specific document (API, DATABASE, etc.)
- **Implementation blockers?** Check IMPLEMENTATION.md for that phase
- **Security concerns?** See SECURITY.md
- **Unclear decisions?** Each document has a "Why?" section

---

## Next Document

👉 **Recommended next read:** [OVERVIEW.md](./OVERVIEW.md)
