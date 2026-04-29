# Dashboard Design — Home / Quick Access

## Overview

Add a dashboard as the new home page (instead of redirecting straight to `/organic`). Provides at-a-glance stats and quick access to key features.

**Position:** `/` (home) → Dashboard
**Redirect:** From dashboard, deep links go to respective sections

---

## Layout

```
┌────────────────────────────────────────────────────────────┐
│ HEADER                                                     │
│ "Dashboard"                                                │
│ Welcome, [User] 👋                                         │
│ (Or generic welcome if no saved name)                      │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ STAT CARDS (3 columns, responsive to 1 column on mobile)   │
│                                                            │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│ │ Links    │  │ Campaigns│  │ Campaigns│                │
│ │ 247      │  │ 12       │  │ By Source │                │
│ │ Created  │  │ Active   │  │ F I L R  │                │
│ └──────────┘  └──────────┘  └──────────┘                │
│                                                            │
│ ┌──────────────────────────────────────────────────┐     │
│ │ Links Created This Month                         │     │
│ │ [Chart: 0→80 links, 10-day trend line]           │     │
│ └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ QUICK ACCESS SECTION                                       │
│                                                            │
│ [Create New Link] [View All Links] [Manage Values]       │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ RECENT LINKS (Last 5 created)                              │
│                                                            │
│ Link | Source | Campaign | Date                           │
│ ───────────────────────────────────────────────────        │
│ [Link] | facebook | spring_sale | Today                  │
│ [Link] | instagram | brand_awareness | Yesterday          │
│ ...                                                        │
│                                                            │
│ [View All Links →]                                        │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ INTEGRATIONS STATUS                                        │
│                                                            │
│ ● Google Sheets    Connected (Last synced: 2h ago)       │
│ ○ Airtable         Not connected                         │
│                                                            │
│ [Manage Connections →]                                   │
└────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. StatCard (Reusable)
```tsx
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href?: string; // Optional link to drill down
}

export function StatCard({ icon, label, value, href }: StatCardProps) {
  const Wrapper = href ? Link : 'div';
  return (
    <Wrapper href={href} className="bg-white border border-indigo-100 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-3xl font-bold text-indigo-950 mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </Wrapper>
  );
}
```

**Usage:**
- Total links created: 247
- Active campaigns: 12
- Platforms used (donut chart): Facebook (40%), Instagram (35%), LinkedIn (25%)

---

### 2. StatsGrid

```tsx
export function StatsGrid() {
  const links = getLinks();
  const values = getValues();
  const campaigns = new Set(links.map(l => l.utmCampaign)).size;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<LinkIcon className="size-8 text-indigo-600" />}
        label="Total Links"
        value={links.length}
        href="/organic"
      />
      <StatCard
        icon={<TagIcon className="size-8 text-indigo-600" />}
        label="Campaigns"
        value={campaigns}
        href="/organic?filter=campaign"
      />
      <StatCard
        icon={<TrendingUpIcon className="size-8 text-indigo-600" />}
        label="This Month"
        value={thisMonthCount}
      />
    </div>
  );
}
```

---

### 3. TrendChart (Simple)

```tsx
export function TrendChart() {
  const links = getLinks();
  const dailyCounts = groupBy(links, link => 
    new Date(link.dateGenerated).toLocaleDateString()
  );
  
  return (
    <div className="bg-white border border-indigo-100 rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4">Links Created (Last 30 days)</h3>
      <SimpleLineChart data={dailyCounts} />
      <p className="text-xs text-gray-600 mt-4">
        {links.length} total · Trending up
      </p>
    </div>
  );
}
```

**Library:** Use a lightweight chart library:
- Option 1: `recharts` (7KB, React native)
- Option 2: `chart.js` with `react-chartjs-2`
- Option 3: Simple SVG line chart (custom, minimal deps)

**Data:** Last 30 days, aggregate by day, show trend line

---

### 4. QuickActions

```tsx
export function QuickActions() {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4">Quick Access</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => router.push('/organic?create=true')}>
          + Create New Link
        </Button>
        <Button variant="secondary" href="/organic">
          View All Links
        </Button>
        <Button variant="secondary" href="/settings/values">
          Manage Values
        </Button>
        <Button variant="secondary" href="/health-checker">
          Check a Link
        </Button>
      </div>
    </div>
  );
}
```

---

### 5. RecentLinks

```tsx
export function RecentLinks() {
  const links = getLinks().slice(0, 5);
  
  return (
    <div className="bg-white border border-indigo-100 rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4">Recent Links</h3>
      {links.length === 0 ? (
        <p className="text-sm text-gray-600">
          No links created yet. <Link href="/organic">Create one now.</Link>
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {links.map(link => (
              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-gray-700 truncate">
                    {link.fullUrl}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge>{link.utmSource}</Badge>
                    <Badge>{link.utmCampaign}</Badge>
                  </div>
                </div>
                <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                  {formatDate(link.dateGenerated)}
                </div>
              </div>
            ))}
          </div>
          <Link href="/organic" className="text-sm text-indigo-600 hover:underline mt-4 block">
            View all links →
          </Link>
        </>
      )}
    </div>
  );
}
```

---

### 6. IntegrationStatus

```tsx
export function IntegrationStatus() {
  const connections = getConnections();
  const googleConnected = connections.some(c => c.type === 'google_sheets' && c.status === 'active');
  const airtableConnected = connections.some(c => c.type === 'airtable' && c.status === 'active');
  
  return (
    <div className="bg-white border border-indigo-100 rounded-lg p-6">
      <h3 className="font-bold text-lg mb-4">Integrations</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${googleConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Google Sheets</span>
          </div>
          {googleConnected && (
            <p className="text-xs text-gray-600">
              Last synced: {formatTime(lastSyncTime)}
            </p>
          )}
          {!googleConnected && (
            <Link href="/settings/connections" className="text-xs text-indigo-600 hover:underline">
              Connect
            </Link>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${airtableConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm">Airtable</span>
          </div>
          {airtableConnected && (
            <p className="text-xs text-gray-600">
              Connected
            </p>
          )}
          {!airtableConnected && (
            <Link href="/settings/connections" className="text-xs text-indigo-600 hover:underline">
              Connect
            </Link>
          )}
        </div>
      </div>
      <Link href="/settings/connections" className="text-sm text-indigo-600 hover:underline mt-4 block">
        Manage connections →
      </Link>
    </div>
  );
}
```

---

## Dashboard Page Structure

```tsx
// src/app/dashboard/page.tsx
"use client";

import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentLinks } from "@/components/dashboard/recent-links";
import { IntegrationStatus } from "@/components/dashboard/integration-status";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-gray-600">Welcome back! Here's what's happening with your tracking links.</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Quick Actions */}
      <QuickActions />

      {/* Trend Chart */}
      <TrendChart />

      {/* Recent Links */}
      <RecentLinks />

      {/* Integration Status */}
      <IntegrationStatus />
    </div>
  );
}
```

---

## Update Root Redirect

```tsx
// src/app/page.tsx (existing)
// Change from:
// export { default } from "./organic/page";

// To:
export { default } from "./dashboard/page";
```

---

## Files to Create

- `src/app/dashboard/page.tsx` — Dashboard page
- `src/components/dashboard/stats-grid.tsx` — Stats cards
- `src/components/dashboard/stat-card.tsx` — Single stat card
- `src/components/dashboard/trend-chart.tsx` — Line chart
- `src/components/dashboard/quick-actions.tsx` — CTA buttons
- `src/components/dashboard/recent-links.tsx` — Last 5 links
- `src/components/dashboard/integration-status.tsx` — Connection status
- `src/lib/dashboard/metrics.ts` — Helper functions for calculations

---

## Mobile Experience

- **Stats grid:** 1 column on mobile, 2 on tablet, 3 on desktop
- **Chart:** Full width, responsive height
- **Links table:** Vertical layout (link on top, metadata below) on mobile
- **Buttons:** Stack vertically on mobile if needed

---

## Performance

- **Stats calculations:** Done on client (fast, in-app data only)
- **No external API calls** — Everything from localStorage
- **Lazy load:** Chart only renders if scrolled into view (use IntersectionObserver)
- **Cache:** Recalculate on mount and when storage changes (useStorageSync hook)

---

## Integration with Navigation

- **Sidebar:** Add "Dashboard" as first nav item (home icon)
- **Mobile nav:** Add "Dashboard" as first tab
- **Breadcrumbs:** Not needed on dashboard (already clear)
- **Back button:** Not needed (dashboard is home)

---

## Metrics to Track

After implementing, measure:
- **Time on dashboard:** Should be 30-60 seconds for returning users
- **CTR on Quick Actions:** Should be >30% (Create New Link is primary)
- **CTR on Recent Links:** Should be >20%
- **Bounce rate:** Should be <50% (not a landing page, just navigation hub)
