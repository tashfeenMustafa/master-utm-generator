## Part 9: Implementation Approach Based on Current Code

### 9.1 Reusing Existing Code

**Keep (No Changes):**
- `src/lib/types.ts` - Extend with new User/Team/Permission types
- `src/lib/utm-config.ts` - Use existing UTM framework (getPlatformsForChannel, getUtmMedium, buildUtmUrl)
- `src/lib/utils/to-snake-case.ts` - Reuse for naming convention auto-formatting
- `src/components/ui/*` - All shadcn/ui components (button, badge, input, etc.)
- `src/components/layout/sidebar.tsx` - Extend with team switcher

**Refactor (Significant Changes):**
- `src/lib/storage.ts` → Deprecate. Move all storage to API calls + React Context
- `src/components/organic/utm-generator-form.tsx` → Add team context, API integration, naming convention UI
- `src/components/organic/links-table.tsx` → API-based with pagination, permission checks
- `src/app/organic/page.tsx` → Add role-based visibility

**New Files:**
- All API routes (`src/app/api/v1/...`)
- Auth context & hooks
- Team context & hooks
- Permission utilities
- Database query helpers

### 9.2 Database Layer Architecture

**Pattern: Supabase Client in Route Handlers**

```typescript
// src/app/api/v1/teams/[teamId]/links/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  const { teamId } = params;
  const userId = (await request.json()).user_id; // From JWT
  
  // RLS handles team isolation automatically
  const { data, error } = await supabase
    .from('utm_links')
    .insert({
      team_id: teamId,
      created_by: userId,
      base_url: '...',
      utm_source: '...',
      // ...
    })
    .select();
  
  return Response.json(data);
}
```

**Frontend Pattern: useQuery Hook**

```typescript
// src/hooks/use-links.ts
import { useQuery } from '@tanstack/react-query';

export function useLinks(teamId: string) {
  return useQuery({
    queryKey: ['links', teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}/links`);
      return res.json();
    }
  });
}
```

### 9.3 Naming Conventions in Code

**Storage:**
```typescript
interface NamingConvention {
  id: string;
  team_id: string;
  name: string;
  rules: {
    utm_source?: {
      pattern: string;      // regex
      transform?: 'lowercase' | 'lowercase_underscore' | 'uppercase';
      examples: string[];
    };
    utm_campaign?: { ... };
    utm_term?: { ... };
    // ... per parameter
  };
  validation: {
    max_length: number;
    min_length: number;
    reserved_words: string[];
  };
}
```

**Validation:**
```typescript
// src/lib/naming-convention-validator.ts
export function validateAgainstConvention(
  value: string,
  convention: NamingConvention,
  parameterName: 'utm_source' | 'utm_campaign' | 'utm_term'
): { valid: boolean; transformed: string; errors: string[] } {
  const rules = convention.rules[parameterName];
  if (!rules) return { valid: true, transformed: value, errors: [] };
  
  // Check pattern
  if (!new RegExp(rules.pattern).test(value)) {
    return {
      valid: false,
      transformed: value,
      errors: [`Doesn't match pattern: ${rules.pattern}`]
    };
  }
  
  // Check reserved words
  if (convention.validation.reserved_words.includes(value.toLowerCase())) {
    return {
      valid: false,
      transformed: value,
      errors: ['{value} is a reserved word']
    };
  }
  
  // Apply transform
  let transformed = value;
  if (rules.transform === 'lowercase') {
    transformed = value.toLowerCase();
  } else if (rules.transform === 'lowercase_underscore') {
    transformed = toSnakeCase(value);
  }
  
  return { valid: true, transformed, errors: [] };
}
```

---

