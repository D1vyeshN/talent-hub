# Recruiter Sidebar Design — 2026-06-02

## Problem
The current `RecruiterDashboard.tsx` (`frontend/src/pageFiles/RecruiterDashboard.tsx`) is a flat, tab-based page using hardcoded mock data. It has no sidebar navigation, no route structure, and no way to navigate between the 8 feature modules the user identified.

## Goal
Build a route-based Recruiter Dashboard with a collapsible sidebar that surfaces all 8 core modules + Reports, replacing the single flat tab page.

---

## 1. Route Structure

```
frontend/src/app/(main)/(dashboard)/recruiter-dashboard/
├── layout.tsx          ← Sidebar + inner navbar wrapper
├── page.tsx            ← Dashboard home (stats, charts)
├── jobs/
│   ├── page.tsx        ← My Jobs list (CRUD, publish/unpublish)
│   └── post/
│       └── page.tsx    ← Post new job form
├── applications/
│   └── page.tsx        ← Apps per job, filter by status, accept/reject
├── candidates/
│   └── page.tsx        ← Search/browse candidates, talent pool
├── interviews/
│   └── page.tsx        ← Schedule, reschedule, notes, status
├── messages/
│   └── page.tsx        ← Chat with candidates
├── notifications/
│   └── page.tsx        ← Notification list
├── company/
│   └── page.tsx        ← Company profile, logo, description
├── settings/
│   └── page.tsx        ← Edit profile, account settings
└── reports/
    └── page.tsx        ← Export applications CSV
```

Old file `frontend/src/pageFiles/RecruiterDashboard.tsx` → deleted after migration.

---

## 2. Sidebar Menu Items

| Section | Item | Icon | Route |
|---------|------|------|-------|
| Main | Dashboard | `LayoutDashboard` | `/recruiter-dashboard` |
| Jobs | My Jobs | `Briefcase` | `/recruiter-dashboard/jobs` |
| Jobs | Post a Job | `Plus` | `/recruiter-dashboard/jobs/post` |
| Candidates | Applications | `Users` | `/recruiter-dashboard/applications` |
| Candidates | Candidates | `Search` | `/recruiter-dashboard/candidates` |
| Candidates | Interviews | `Calendar` | `/recruiter-dashboard/interviews` |
| Communication | Messages | `MessageSquare` | `/recruiter-dashboard/messages` |
| Communication | Notifications | `Bell` | `/recruiter-dashboard/notifications` |
| Account | Company | `Building2` | `/recruiter-dashboard/company` |
| Account | Settings | `Settings` | `/recruiter-dashboard/settings` |
| Account | Reports | `Download` | `/recruiter-dashboard/reports` |

---

## 3. Layout Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────────────────┐  │
│ │ SIDEBAR   │ │ RECRUITER NAVBAR (breadcrumbs, mobile toggle) │  │
│ │          │ ├────────────────────────────────────────────────┤  │
│ │ Menu     │ │                                                │  │
│ │ items    │ │ {children} (scrollable page content)           │  │
│ │          │ │                                                │  │
│ │ Profile  │ │                                                │  │
│ │ card     │ │                                                │  │
│ │          │ │                                                │  │
│ └──────────┘ └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Sidebar Behavior

- **Desktop:** collapsible icon-only (64px) ↔ full text (260px), toggled via `ui.sidebarOpen` + `toggleSidebar` (already in `uiSlice`)
- **Mobile:** overlay drawer that closes on navigation or backdrop tap
- **Active item:** highlighted background + blue left border accent, driven by `usePathname()`

---

## 5. New Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/components/dashboard/RecruiterSidebar.tsx` | Sidebar nav with sections, icons, active state, profile card |
| `frontend/src/components/dashboard/RecruiterNavbar.tsx` | Top bar inside dashboard (breadcrumbs, mobile toggle) |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/layout.tsx` | Layout wrapper |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/page.tsx` | Dashboard home |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/jobs/page.tsx` | My Jobs list |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/jobs/post/page.tsx` | Post Job form |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/applications/page.tsx` | Applications |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/candidates/page.tsx` | Candidates |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/interviews/page.tsx` | Interviews |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/messages/page.tsx` | Messages |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/notifications/page.tsx` | Notifications |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/company/page.tsx` | Company |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/settings/page.tsx` | Settings |
| `frontend/src/app/(main)/(dashboard)/recruiter-dashboard/reports/page.tsx` | Reports/CSV |

---

## 6. Existing Files to Modify

| File | Change |
|------|--------|
| `frontend/src/pageFiles/RecruiterDashboard.tsx` | Delete after content migrated to routes |

---

## 7. Implementation Order

**Phase 1 — Foundation:** Sidebar, layout, dashboard home
**Phase 2 — Core:** Jobs, Applications, Company
**Phase 3 — Supporting:** Candidates, Interviews, Notifications, Messages
**Phase 4 — Extras:** Settings, Reports
