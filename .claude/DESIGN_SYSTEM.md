# Master UTM Generator — Design System & Branding v2

## Brand Evolution

**Current:** Corporate green (#248234) feels serious but generic. Boring headings.

**New Direction:** Modern, accessible, approachable. Design should feel like "someone built this for me," not "a tool I have to learn."

---

## Color Palette (v2)

### Primary Colors
| Color | Hex | Role | Usage |
|-------|-----|------|-------|
| **Indigo 600** | `#4F46E5` | Primary action | Buttons, links, badges |
| **Indigo 50** | `#F0F4FF` | Light bg | Cards, highlights, sections |
| **Indigo 950** | `#0D0842` | Dark text | Headings, strong emphasis |

### Semantic Colors
| Color | Hex | Role | Usage |
|-------|-----|------|-------|
| **Success** | `#10B981` | Positive feedback | Checkmarks, "copied" states, success toasts |
| **Warning** | `#F59E0B` | Caution | Validation warnings, info alerts |
| **Destructive** | `#EF4444` | Delete/danger | Delete buttons, error toasts |
| **Neutral** | `#6B7280` | Secondary text | Helper text, disabled states, muted content |

### Backgrounds
| Color | Hex | Role | Usage |
|-------|-----|------|-------|
| **Light** | `#FFFFFF` | Primary bg | Main content area, cards |
| **Off-white** | `#F9FAFB` | Secondary bg | Page background, grouped sections |
| **Dark** | `#0F172A` | Sidebar bg | Left sidebar (when pinned) |

### Gradients
- **Primary gradient:** Indigo 600 → Indigo 500 (subtle, for highlights)
- **Success gradient:** Green 500 → Teal 500 (result cards)

---

## Typography

### Fonts
| Family | Font | Usage | Weights |
|--------|------|-------|---------|
| **Headings** | Inter | Headings (all h1-h6) | 700 (bold) |
| **Body** | Inter | Body text, UI labels | 400 (regular), 500 (medium), 600 (semibold) |
| **Monospace** | Geist Mono | Code/URLs | 500 |

**Rationale:** Single font family (Inter) is modern, clean, and accessible. Geist Mono is contemporary and scannable for technical content.

### Type Scale
| Scale | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **H1** | 32px | 700 | 40px | Page titles |
| **H2** | 24px | 700 | 32px | Section headings |
| **H3** | 20px | 700 | 28px | Subsection headings |
| **Body Large** | 16px | 400 | 24px | Card titles, prominent text |
| **Body** | 14px | 400 | 20px | Main body text |
| **Body Small** | 13px | 400 | 18px | Helper text, labels |
| **Label** | 12px | 500 | 16px | Button labels, badges |

### Letter Spacing
- **Normal:** 0 (headings, body)
- **Tight:** -0.02em (badges, labels to feel compact)

---

## Component Styles

### Buttons
#### Primary
- Background: Indigo 600
- Text: White
- Hover: Indigo 700
- Active: Indigo 800
- Border radius: 8px
- Padding: 10px 16px (height 40px)
- Font: Label (12px, 500)
- Icon + text supported

#### Secondary
- Background: Indigo 50
- Text: Indigo 600
- Border: 1px Indigo 200
- Hover: Indigo 100
- Border radius: 8px

#### Destructive
- Background: Red 50
- Text: Red 600
- Border: 1px Red 200
- Hover: Red 100

#### Outline (for context)
- Background: Transparent
- Text: Indigo 600
- Border: 1px Indigo 300
- Hover: Indigo 50

### Cards
- Background: White
- Border: 1px Indigo 100
- Border radius: 10px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Padding: 16px
- Spacing: 12px between card children

### Badges
- Background: Indigo 100
- Text: Indigo 700
- Border radius: 6px
- Padding: 4px 8px
- Font: Label (12px, 500)

**Semantic badges:**
- Success: Green 100 bg, Green 700 text
- Warning: Amber 100 bg, Amber 700 text
- Error: Red 100 bg, Red 700 text

### Input Fields
- Border: 1px Neutral 300
- Background: White
- Focus border: Indigo 500 (2px)
- Focus ring: Indigo 50
- Border radius: 8px
- Padding: 8px 12px (height 40px)
- Font: Body (14px, 400)
- Label above, 8px spacing
- Placeholder: Neutral 400

### Tables
- Border: 1px Neutral 200
- Row hover: Indigo 50
- Header bg: Neutral 50
- Header font: 600
- Cell padding: 12px
- Border radius: 8px (outer corners)

### Tooltips & Popovers
- Background: Indigo 950
- Text: White
- Border radius: 6px
- Arrow: Indigo 950
- Padding: 8px 12px
- Max width: 200px
- Font: Body Small (13px)

### Drawers (Sheets)
- Background: White
- Width (desktop): 80vw max 600px
- Width (mobile): Full width
- Border left: None (modern aesthetic)
- Shadow: -2px 0 8px rgba(0,0,0,0.15)
- Close button: X in top right

---

## Spacing & Layout

### Scale
- **2px** — Ultra-tight spacing (icon gaps, badge padding)
- **4px** — Tight spacing (form field padding, tight groups)
- **8px** — Default spacing (between elements, margins)
- **12px** — Relaxed spacing (card padding, section breaks)
- **16px** — Large spacing (page padding, major sections)
- **24px** — Extra large (between page sections)
- **32px** — Massive (top-level section gaps)

### Responsive
- **Mobile:** 16px padding, single column, full-width forms
- **Tablet:** 20px padding, 2-column forms when applicable
- **Desktop:** 24px padding, multi-column layouts

---

## Data Visualization

### Status Indicators
- **Active:** Green 500 (dot + label)
- **Inactive/Paused:** Neutral 400 (dot + label)
- **Error:** Red 500 (dot + label)
- **Pending:** Amber 400 (dot + label)

### Link Colors
- **Default:** Indigo 600
- **Visited:** Indigo 700
- **Hover:** Indigo 700 with underline

---

## Dark Sidebar (Pinned State)

- **Background:** `#0F172A` (dark slate)
- **Text:** White (accent text)
- **Icons:** White
- **Active state:** Indigo 500 bg, rounded 8px
- **Hover state:** Indigo 600 bg, rounded 8px
- **Divider:** Neutral 700

---

## Imagery & Icons

### Icons
- **Library:** Lucide React
- **Size:** 16px (labels), 20px (buttons), 24px (headings)
- **Color:** Match text color (inherit from parent)
- **Weight:** 2px stroke
- **Common icons:**
  - Plus → Generate/Add
  - Copy → Copy to clipboard
  - Trash2 → Delete
  - Settings → Settings
  - Link → URL/Connection
  - Check → Success
  - AlertCircle → Error

### Illustrations
- **Style:** Minimal, flat, modern
- **Color:** Use primary indigo palette only
- **Usage:** Empty states, hero sections, onboarding
- **Source:** Undraw.co (modern + customizable)

---

## Animation & Interaction

### Micro-interactions
- **Button hover:** 150ms ease (slight color shift + scale 1.02)
- **Toast entrance:** 300ms slide-up from bottom
- **Modal open:** 200ms fade + scale
- **Loading spinner:** Smooth 2s rotation
- **Copy feedback:** 200ms checkmark animation

### Transitions
- **Default:** 150ms ease-in-out
- **Fast:** 100ms ease-in
- **Slow:** 300ms ease-out

---

## Accessibility

### WCAG 2.1 AA Compliance
- **Contrast ratios:**
  - Body text: 4.5:1 minimum (white on indigo 600 = 10:1 ✓)
  - Large text: 3:1 minimum
- **Focus states:** 2px outline, Indigo 500
- **Color not sole indicator:** Icons + labels + patterns
- **Interactive elements:** 44x44px minimum (touch targets)

### Semantic HTML
- Use `<button>` for buttons, not `<div>`
- Use `<label>` for form fields
- Use `<a>` for links
- Use `<table>` for tabular data
- Use `role="alert"` for toasts
- Use `aria-live="polite"` for dynamic updates

---

## Usage in Code

### Tailwind Config Updates
```typescript
// Add to tailwind.config.ts
colors: {
  primary: {
    50: '#F0F4FF',
    600: '#4F46E5',
    700: '#4339CA',
    800: '#3730A3',
    950: '#0D0842',
  },
  success: '#10B981',
  warning: '#F59E0B',
  destructive: '#EF4444',
  sidebar: '#0F172A',
}

borderRadius: {
  DEFAULT: '8px',
  lg: '10px',
}
```

### Component Naming
- All components use semantic color names: `bg-primary`, `text-primary`, `border-primary`
- No hardcoded hex values in components
- All spacing via tailwind scale: `p-4`, `m-8`, `gap-3`

---

## Migration Path

### From Old (Green) to New (Indigo)
1. Update `tailwind.config.ts` with new palette
2. Replace all `#248234` with `#4F46E5`
3. Update all form elements (inputs, selects, checkboxes)
4. Refresh buttons (secondary → new indigo-50 variant)
5. Adjust card borders (lighter, indigo-tinted)
6. Update typography (one-line changes to font-weight/size)
7. Test all pages end-to-end

**Timeline:** 3-4 hours total
