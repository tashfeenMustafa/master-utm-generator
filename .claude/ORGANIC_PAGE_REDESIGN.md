# Organic Page Redesign — Onboarding & UX Overhaul

**Version:** V1 (Single-user localStorage). For V2 (Multi-tenant), see `ARCHITECTURE_V3.md`.

## Current Problems

1. **Empty state is scary** — New users land on blank table with no idea what to do
2. **No guidance** — "Generate UTM Link" button exists but context is missing
3. **Copy is technical** — Field names assume users understand UTM structure
4. **No examples** — "What's a good utm_campaign value?" — crickets
5. **Organic only** — DM channels buried in same page, unclear flow

## New Direction

Position the page as **guided on-ramp** for new users, not a blank spreadsheet. Three clear sections:

1. **Intro + Example** (collapsible, dismissible)
2. **Quick Start** (pre-filled template)
3. **Your Links** (master table)

---

## Wireframe / Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER SECTION                                                  │
│ Heading: "Create Tracking Links"                               │
│ Copy: "Build shareable links that track where your traffic     │
│        comes from. We'll keep your naming consistent."          │
│ [Close] button (top right, dismiss intro)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ QUICK EXAMPLE (collapsible section)                            │
│                                                                  │
│ "Here's what a tracking link looks like:"                      │
│ https://www.example.com/?utm_source=facebook&utm_medium=organic_social... │
│                                                                  │
│ "Click 'Create a Link' above to build your own."              │
│ [Create a Link] button (primary)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MASTER TABLE                                                    │
│ Full spreadsheet view with filters, search, grouping            │
│ (existing LinksTable component)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Copy Changes

### Header Section
```
OLD:
"Organic & DMs"
"Generate UTM links for organic social media posts and direct messages."

NEW:
"Create Tracking Links for Social Media"
"Build shareable links that track where your traffic comes from. 
We'll keep your naming consistent across your whole team."
```

**Why:** 
- "Social Media" is clearer than "Organic & DMs"
- Removes jargon ("UTM links")
- Emphasizes benefit (tracking) and team feature

### Empty State (when no links exist)
```
OLD:
"No UTM links generated yet. Click 'Generate UTM Link' to create your first one."

NEW:
Icon: 🔗 (or custom illustration)
Heading: "Create Your First Tracking Link"
Copy: "You haven't created any tracking links yet. Here's how it works:

1. Paste the page you want to track (e.g., your blog post or landing page)
2. Pick the platform (Facebook, Instagram, LinkedIn, TikTok, Twitter, Reddit)
3. Name your campaign and content type (we'll format it for you)
4. Copy the link and share it"

[Create Your First Link] button (primary, large)

[Optional: "See an example" expandable section showing sample link + QR code]
```

### Generator Form Copy (Field Labels & Help Text)

#### utm_campaign
```
OLD LABEL: "utm_campaign"
OLD HELP: "Your content pillar or campaign name. e.g., brand_awareness"

NEW LABEL: "Campaign"
NEW HELP: "What campaign is this for? e.g., summer_sale, brand_awareness, product_launch"
```

#### utm_term
```
OLD LABEL: "utm_term"
OLD HELP: "Your content theme. e.g., customer_stories"

NEW LABEL: "Theme (Optional)"
NEW HELP: "What's the theme? e.g., customer_stories, case_study, behind_the_scenes"
```

#### utm_content (Organic/DM)
```
OLD LABEL: "Post Format" + "Content Hook"
OLD HELP: "Format: The format of your post on this platform. Hook: A short descriptor"

NEW LABEL: "Post Type & Description"
NEW HELP: "What kind of post + what's it about? 
Examples:
  • Reel: 5_tips_for_growth
  • Image: customer_transformation
  • Carousel: step_by_step_guide"
```

#### Platform Selector (Sets utm_source)
```
OLD: Dropdown with technical platform names

NEW: Visual dropdown with platform logos + names
  ○ Facebook
  ○ Instagram
  ○ LinkedIn
  ○ TikTok
  ○ Twitter (X)
  ○ Reddit

HELP TEXT: "Which platform are you posting to? We'll automatically add utm_source."
NOTE: Selecting a platform auto-fills utm_source (e.g., 'facebook', 'instagram')
```

#### Channel Type (Sets utm_medium)
```
LABEL: "Channel Type"
HELP: "Where is this going? We'll automatically categorize it."

OPTIONS:
  ○ Organic Social — Post on platform feed (utm_medium = organic_social)
  ○ Paid Social — Paid ad campaign (utm_medium = paid_social)
  ○ Direct Message — DM / email (utm_medium = organic_dm or cold_dm)

HELP TEXT: "We'll automatically add utm_medium based on this selection."
NOTE: utm_source + utm_medium are auto-set; user only needs to select platform + channel
```

### Custom UTM Parameters (V1 Phase 2 Feature)

**NEW FIELD - Add to Form (Optional Expansion)**

```
LABEL: "Custom Parameters (Optional)"
HELP: "Add any extra parameters to your link. E.g., utm_custom_id=summer2024"

FEATURE:
  • Expandable section showing:
    - Dropdown: Select parameter name (or type custom name)
    - Text input: Parameter value
    - "+" button to add more
  • Live preview of final URL shows custom params appended
  • Validation:
    - Parameter names must be snake_case
    - Values must be URL-safe (no spaces, special chars)
    - Max 5 custom parameters per link
    - Show helpful error: "Use snake_case only, e.g., utm_custom_id"

EXAMPLE:
  User selects "utm_custom_id" and enters "summer_2024"
  Final URL: https://example.com/?utm_source=instagram&...&utm_custom_id=summer_2024

ACCEPTANCE:
  - Custom params stored in UtmLink type: `customParams?: Record<string, string>`
  - CSV export includes custom params in columns
  - Value library allows selecting common custom params (dropdown autocomplete)
```

---

### Result Card (After Generation)
```
INSTEAD OF:
Just showing URL + copy button

NEW: Show
  • Live preview of the link (truncated with copy button)
  • QR code for the link (scannable version)
  • Visual breakdown of each tracking parameter
  • "Copy Link" + "Copy QR Code" + "Dismiss" buttons
  • Optional: "Share this link" (copy pre-filled message)
```

---

## New Components Needed

### 1. IntroSection (Dismissible)
```tsx
export function IntroSection() {
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">
            Create Tracking Links for Social Media
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Build shareable links that track where your traffic comes from.
            We'll keep your naming consistent across your whole team.
          </p>
          <ExampleLink className="mt-4" />
          <Button onClick={() => setDrawerOpen(true)} className="mt-4">
            Create Your First Link
          </Button>
        </div>
        <button onClick={() => setDismissed(true)}>×</button>
      </div>
    </div>
  );
}
```

### 2. ExampleLink (Collapsible)
```tsx
export function ExampleLink() {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-indigo-600 hover:underline"
      >
        {expanded ? '▼' : '▶'} Here's what a tracking link looks like
      </button>
      {expanded && (
        <div className="mt-3 p-3 bg-white border border-indigo-100 rounded">
          <p className="font-mono text-xs text-gray-600 break-words">
            https://www.example.com/?utm_source=instagram&utm_medium=organic_social&...
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Each part tells Google Analytics where this traffic came from.
          </p>
        </div>
      )}
    </div>
  );
}
```

### 3. OnboardingTooltips
Show on first visit only:
- Generator drawer field tooltips (already exist, enhance copy)
- Result card explanation (point to QR code, copy buttons)
- Table filter explanation (show how to find past links)

---

## Page Structure (Updated)

```tsx
export default function OrganicPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<UtmLink | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <div className="p-6 space-y-6">
      {/* INTRO SECTION */}
      <IntroSection onCreateClick={() => setDrawerOpen(true)} />
      
      {/* RESULT CARD */}
      {lastGenerated && (
        <ResultCard link={lastGenerated} onDismiss={() => setLastGenerated(null)} />
      )}
      
      {/* MASTER TABLE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Your Tracking Links</h2>
          <Button onClick={() => setDrawerOpen(true)}>
            + Create a Link
          </Button>
        </div>
        <LinksTable refreshKey={refreshKey} />
      </div>
      
      {/* GENERATOR DRAWER */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create a Tracking Link</SheetTitle>
            <SheetDescription>
              We'll format it correctly and keep your naming consistent.
            </SheetDescription>
          </SheetHeader>
          <UtmGeneratorForm
            onGenerated={handleGenerated}
            onCancel={() => setDrawerOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

---

## Visual Enhancements

### Icons
- Use Lucide icons:
  - `<Link2 className="size-6" />` for heading
  - `<QrCode className="size-5" />` next to QR copy button
  - `<Copy className="size-4" />` for link copy
  - `<Share2 className="size-4" />` for share button

### Empty State Illustration
- Use Undraw.co custom illustration showing:
  - Person sharing a link
  - Mobile phone with QR code
  - Simple, colorful, encouraging

### Color Coding
- Success (after copy): Green checkmark + "Copied!"
- Platform badges: Keep current implementation (colored pills per platform)
- New link highlight: Subtle indigo-50 background on row for 5 seconds

---

## Mobile Adaptations

### Small screens (<640px)
- IntroSection: Reduced padding, single-column
- Create button: Sticky bottom right (floating action button) in addition to top button
- Table: Horizontal scroll, prioritize Full URL + Actions columns
- QR code: Larger (easier to scan on mobile)
- Result card: Full width, centered

---

## Onboarding Sequence (First Visit)

**Step 1:** User lands on Organic page
- IntroSection shows (not dismissed)
- Empty state shows with illustration
- Inline notification: "Here's a quick tour... [Dismiss | Show Me]"

**Step 2:** User clicks "Create Your First Link"
- Drawer opens
- First field (Base URL) has tooltip showing example
- After generation, result card shows with explanation overlay

**Step 3:** User copies link or dismisses
- IntroSection is now dismissible (small X button)
- User can create more links freely
- Table grows with their links

---

## Copy Tone Changes

| Current | New | Why |
|---------|-----|-----|
| "Generate UTM Link" | "Create a Tracking Link" | More approachable |
| "utm_campaign" | "Campaign" | Removes jargon |
| "utm_content" | "Post Type & Description" | Explains what it is |
| "Sync Now" | "Update Values" | Clearer action |
| "No UTM links generated yet" | "Create Your First Tracking Link" | Encouraging, action-oriented |

---

## Success Metrics

After redesign, measure:
- **Organic page bounce rate:** Should drop <30%
- **Time on page (first visit):** Should increase 1-2 min (reading intro)
- **First link creation time:** Should decrease (clearer flow)
- **Help icon clicks:** Should drop (better copy)
- **Support questions about UTMs:** Should drop (better education)
