## Part 12: Comparison: V1 vs V3

| Aspect | V1 | V3 |
|--------|----|----|
| **Storage** | localStorage (5-10MB limit) | PostgreSQL (unlimited) |
| **Users** | Single user only | Multi-user + teams |
| **Auth** | None | Magic link + Google OAuth |
| **Permissions** | None | RBAC (4 roles) |
| **Custom UTM params** | ❌ | ✅ (enterprise feature) |
| **Naming conventions** | ❌ | ✅ (validation + auto-format) |
| **API** | ❌ | ✅ (for Content System) |
| **Ad platform imports** | ❌ | ✅ (Google, Meta, LinkedIn, TikTok) |
| **QR codes** | Future | ✅ Built-in |
| **Link analytics** | ❌ | ✅ (clicks tracked) |
| **Team collaboration** | ❌ | ✅ (invite members, roles) |
| **Pricing** | Free forever | Free + Pro ($15) + Agency ($39) |
| **Time to implement** | 2 weeks (done) | 10 weeks |
| **DB queries needed** | 0 | 27+ endpoints |
| **Security audit** | Not needed | JWT, RLS, API auth |

---

