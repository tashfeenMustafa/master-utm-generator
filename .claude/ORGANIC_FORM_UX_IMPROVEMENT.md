# Organic Form UX Improvement

## Problem Statement

Current form is **functionally correct but conceptually confusing**:
- Users don't understand why they pick "Channel Type" then "Platform"
- `utm_source` and `utm_medium` appear as magic badges (derived, not editable)
- Multiple conditional fields hidden/shown creates disorientation
- Naming convention rules aren't visible — users don't know why inputs become snake_case
- No clear mental model of "what info I provide" → "what UTM params are generated"

**Result:** Users need to read docs to understand how to use it.

---

## Solution: Reorganize Into Logical Sections

### Section 1: "Where Are You Promoting?"

**Goal:** User tells us the promotion channel. System derives `utm_source` + `utm_medium`.

```
┌─────────────────────────────────────────────────────────┐
│ WHERE ARE YOU PROMOTING?                                │
│ Help your analytics understand the traffic source       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ SELECT SOURCE TYPE                                      │
│ [ Organic 🌱 ] [ Paid Ads 📢 ] [ Social 💬 ] [ Email ] │
│                                                          │
│ (Users can also add custom sources in Settings)         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ When you select a source, the platform options update   │
│                                                          │
│ SELECT PLATFORM (Required)                              │
│ [Dropdown showing: LinkedIn, Facebook, Instagram, ...]  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ THESE ARE ASSIGNED:                                     │
│                                                          │
│ utm_source: ▌ facebook ▌  (editable)                    │
│ utm_medium: ▌ paid_social ▌  (editable)                 │
│                                                          │
│ Both can be customized in Settings → Naming Conventions │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Rename "Channel Type" → "Source Type" (clearer intent)
- Show selected `utm_source` + `utm_medium` as **editable fields** (not badges)
  - Values still derive from source type + platform
  - But user can override if their naming convention is different
  - Tooltip: "Comes from your source type + platform. Override in Settings → Naming Conventions."
- Add note: "Users can manage custom sources in Settings"

---

### Section 2: "What Are You Promoting?"

**Goal:** User describes the content/campaign. System applies naming conventions.

```
┌─────────────────────────────────────────────────────────┐
│ WHAT ARE YOU PROMOTING?                                 │
│ Describe your content so analytics are human-readable   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ CAMPAIGN NAME (Required)                                │
│ [Input: "Q2 Product Launch"]                            │
│ Rule: Must be snake_case (auto-formatted)               │
│ Value: q2_product_launch ✓                              │
│ (or pick from saved campaigns: [List])                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ CONTENT TOPIC (Optional)                                │
│ [Input: "Customer Success"]                             │
│ Rule: Must be snake_case (auto-formatted)               │
│ Value: customer_success ✓                               │
│ (or pick from saved topics: [List])                     │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ These rules come from Settings → Naming Conventions     │
│ You can change them anytime.                            │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Rename fields to plain English: `utm_campaign` → "Campaign Name", `utm_term` → "Content Topic"
- Show **naming rule inline** (e.g., "Must be snake_case (auto-formatted)")
- Show **formatted value in real-time** under each field
- Each field has example + dropdown of saved values
- Link to Settings → Naming Conventions where users can set these rules

---

### Section 3: "How Is It Being Shared?" (Non-Blog Only)

**Goal:** Describe content format + main hook. System composes `utm_content`.

```
┌─────────────────────────────────────────────────────────┐
│ HOW IS IT BEING SHARED?                                 │
│ Tell us the format and key message                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ POST FORMAT (Required) — Which format are you using?    │
│ [Dropdown: Carousel, Reel, Thread, Article, ...]        │
│                                                          │
│ CONTENT HOOK (Required) — What's the key message?       │
│ [Input: "5 Growth Tips"]                                │
│ Value: 5_growth_tips ✓                                  │
│                                                          │
│ Your utm_content will be: format-hook                   │
│ Preview: carousel-5_growth_tips                         │
│                                                          │
│ (utm_content rule: format-hook, managed in Settings)    │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Clear headers: "POST FORMAT" vs "CONTENT HOOK"
- Show the **composition rule** ("format-hook")
- Show **live preview** of the result
- Link to Settings where this rule is customizable

---

### Section 4: "Where Does It Go?"

**Goal:** Base URL. Separate from UTM logic.

```
┌─────────────────────────────────────────────────────────┐
│ WHERE DOES IT GO?                                       │
│ The destination page URL                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ BASE URL (Required)                                     │
│ [Input: "https://example.com/product"]                  │
│ Must start with https://                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Move to bottom (less important, foundation is set by sections 1-3)
- Keep simple, clear validation

---

### Section 5: "Your Final Link"

**Goal:** Show the result clearly.

```
┌─────────────────────────────────────────────────────────┐
│ YOUR TRACKING LINK                                      │
├─────────────────────────────────────────────────────────┤
│ Full URL:                                               │
│ https://example.com/product?utm_source=facebook&utm_... │
│                                                          │
│ BREAKDOWN:                                              │
│ utm_source: facebook                                    │
│ utm_medium: paid_social                                 │
│ utm_campaign: q2_product_launch                         │
│ utm_term: customer_success                              │
│ utm_content: carousel-5_growth_tips                     │
│                                                          │
│ [Copy Link] [Copy UTM Params] [Download QR] [Share]     │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- Show all final values clearly
- Multiple copy options for different use cases

---

## Implementation Plan

### Phase 1: Structure & Layout
1. Create `FormSection` wrapper component (styled container with heading + description)
2. Reorganize form fields into 5 sections with clear headings
3. Add inline naming rule displays under each field
4. Add real-time value preview (snake_case, composed values)

### Phase 2: Interactivity & Settings Links
1. Add "Manage in Settings" links for:
   - Source types → Settings → Source Types
   - Naming conventions → Settings → Naming Conventions
2. Make `utm_source` + `utm_medium` **editable** (not just badges)
3. Add naming rule explanations on hover/focus

### Phase 3: Polish
1. Mobile responsiveness
2. Accessibility (aria-labels, descriptions)
3. Visual hierarchy (bold field names, muted rules)
4. Copy refinement (examples, plain English)

---

## Key UX Improvements Summary

| Issue | Solution |
|-------|----------|
| "Channel Type" is vague | Rename to "Source Type" + add sub-label "Help your analytics understand the traffic source" |
| utm_source/utm_medium are "magic" | Make them **visible and editable** with rule shown |
| Multiple conditional fields confuse | Use **clear section headers** to group related fields |
| Users don't know naming conventions | Show **inline rules** ("snake_case", "format-hook") under each field + link to Settings |
| No mental model of the flow | Organize as story: "Where? → What? → How? → Where? → Final Link" |
| Examples hidden in tooltips | Show **live formatted values** as users type |
| Form is overwhelming | Use **section dividers** to reduce cognitive load |

---

## Naming Conventions (New Settings Feature)

Users will be able to customize:
1. **Source Type mappings** (organic → utm_source: "organic", utm_medium: "organic")
2. **Campaign naming rule** (e.g., "snake_case", "campaign_{quarter}", etc.)
3. **Term naming rule** (e.g., "snake_case", "topic_{name}", etc.)
4. **Content Hook naming rule** (e.g., "snake_case", "format-hook", etc.)
5. **utm_medium naming rule** (e.g., "paid_social", "organic", custom values)

**Example:**
```
Campaign Rule: "Must be snake_case and start with q[1-4]"
  Input: "Q1 2025 Launch"
  Formatted: "q1_2025_launch" ✓

Content Hook Rule: "Must match: [format]-[topic]"
  Format options: carousel, reel, article, ...
  Topics: predefined list
  Result: "carousel-customer_stories" ✓
```

---

## Testing Checklist

- [ ] Form is understandable without reading docs
- [ ] First-time users can create a link successfully
- [ ] All naming convention rules display correctly
- [ ] Inline value previews update in real-time
- [ ] Settings links navigate correctly
- [ ] Mobile layout doesn't collapse section headers
- [ ] Accessibility: all fields have clear labels + descriptions
- [ ] Copy tone is friendly, non-technical
