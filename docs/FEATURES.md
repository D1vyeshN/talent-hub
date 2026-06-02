# TalentHub — Feature Specification

## Overview

TalentHub is a dual-role job platform connecting **Job Seekers** with **Recruiters**.
Scope is trimmed to ~10 core features that demonstrate full-stack engineering skills
for a developer portfolio project.

---

## Scope Philosophy

**Keep:** Features that demonstrate core engineering — auth, CRUD, search, real-time.
**Cut:** Analytics dashboards, social features, payment systems, subscription tiers,
fake data visualizations. These add complexity without showing engineering depth.

---

## Phase 1 — Core (Must Have)

### F-01: Authentication
| | |
|---|---|
| **Routes** | `/login`, `/register` |
| **Who** | Guest |
| **Status** | ✅ Built + connected |
| **Details** | JWT with httpOnly cookie, role-based (candidate / recruiter), demo login, auto-logout on 401 |

### F-02: Candidate Profile
| | |
|---|---|
| **Route** | `/candidate-dashboard` (profile tab) |
| **Who** | Candidate |
| **Status** | ⚠️ UI built, needs API |
| **Details** | Name, headline, location, skills, experience, avatar. View/update own profile |

### F-03: Recruiter Profile
| | |
|---|---|
| **Route** | `/recruiter-dashboard` (profile tab) |
| **Who** | Recruiter |
| **Status** | ⚠️ UI built, needs API |
| **Details** | Name, designation, company association |

### F-04: Job CRUD (Recruiter)
| | |
|---|---|
| **Route** | `/recruiter-dashboard` (my jobs tab) |
| **Who** | Recruiter |
| **Status** | ❌ Not built |
| **Details** | Create, edit, delete, close jobs. Set title, description, requirements, responsibilities, skills, salary range, location, type, level, category, expiry date |

### F-05: Job Search & Filters (Seeker)
| | |
|---|---|
| **Route** | `/jobs` |
| **Who** | Both (read-only for recruiters) |
| **Status** | ⚠️ UI built, uses mock data |
| **Details** | Full-text search (title, skill, company), filters: location, job type, experience level, category, remote-only. Sort: newest, salary, applicants. Pagination. |

### F-06: Job Detail
| | |
|---|---|
| **Route** | `/jobs/[id]` |
| **Who** | Both |
| **Status** | ⚠️ UI built, static demo |
| **Details** | Full description, requirements, responsibilities, skills, salary, company info, apply button, similar jobs |

### F-07: Job Application (Seeker)
| | |
|---|---|
| **Route** | Modal on `/jobs/[id]` |
| **Who** | Candidate |
| **Status** | ⚠️ UI built, mock only |
| **Details** | One-click apply with cover letter, resume URL attached, success confirmation |

### F-08: Saved Jobs (Seeker)
| | |
|---|---|
| **Route** | `/candidate-dashboard` (saved tab) |
| **Who** | Candidate |
| **Status** | ⚠️ UI built, mock only |
| **Details** | Bookmark/unbookmark jobs, quick-apply from saved list, view count |

### F-09: Applicant Management (Recruiter)
| | |
|---|---|
| **Route** | `/recruiter-dashboard` (applicants tab) |
| **Who** | Recruiter |
| **Status** | ❌ Not built |
| **Details** | View all applicants per job, search/filter applicants, view candidate profiles, update application status (screening → interview → offer → rejected) |

### F-10: Application Status Tracking (Seeker)
| | |
|---|---|
| **Route** | `/candidate-dashboard` (applications tab) |
| **Who** | Candidate |
| **Status** | ⚠️ UI built, mock only |
| **Details** | Status timeline: applied → screening → interview → offer → hired/rejected. Color-coded badges. Application list with job info and dates. |

---

## Phase 2 — Enhancements

### F-11: Real-Time Chat
| | |
|---|---|
| **Route** | `/messages` |
| **Who** | Both |
| **Status** | ⚠️ UI built, local state only |
| **Details** | Socket.IO or polling. Conversation list, send/receive messages, job context, unread indicators. Interview scheduling context. |

### F-12: Notifications
| | |
|---|---|
| **Route** | In-app panel (navbar bell) |
| **Who** | Both |
| **Status** | ⚠️ Component built, not wired |
| **Details** | Application updates, new messages, job alerts, profile views. Mark as read. Navigate to action URL. |

### F-13: Resume Upload
| | |
|---|---|
| **Route** | Candidate profile / application flow |
| **Who** | Candidate |
| **Status** | ❌ Not built |
| **Details** | Upload single resume (PDF), stored in backend. Attached to applications. Replace/delete. |

### F-14: Settings
| | |
|---|---|
| **Route** | `/settings` |
| **Who** | Both |
| **Status** | ⚠️ Form UI built, no backend |
| **Details** | Edit profile, change password, notification preferences, account settings. |

---

## Phase 3 — Nice to Have

### F-15: Admin Dashboard
| | |
|---|---|
| **Who** | Admin |
| **Status** | ❌ Not scoped |
| **Details** | User management, job moderation, platform stats, reported content |

### F-16: Email Notifications
| | |
|---|---|
| **Who** | Both |
| **Status** | ❌ Not scoped |
| **Details** | Email on application status change, new message, interview scheduled |

### F-17: Interview Scheduling
| | |
|---|---|
| **Who** | Both |
| **Status** | ❌ Not scoped |
| **Details** | Recruiter proposes slots, candidate confirms. Calendar integration |

---

## Features Explicitly Removed

| Feature | Reason for removal |
|---------|-------------------|
| Company Reviews & Ratings | Requires moderation, fake-review prevention |
| Salary Insights | Needs large datasets, becomes demo data |
| Subscription Plans / Payments | Payment complexity, no engineering depth |
| Featured Job Listings | Depends on payment system |
| Follow / Unfollow Companies | Social feature, low technical depth |
| Profile Completion Tracking | Small feature, low portfolio impact |
| Application Analytics Charts | Requires event tracking, demo data |
| Skills Match Radar Chart | Visualization only |
| Company-Wide Hiring Metrics | Advanced reporting |
| Job View Counts | Event tracking overhead |
| Multiple Resume Versions | Extra storage complexity |
| Resources / Career Content | CMS complexity |
| Company Follow/Unfollow | Social feature |

---

## Feature Status Matrix

| #  | Feature                    | Who          | Phase | Frontend        | Backend       |
|----|----------------------------|--------------|-------|-----------------|---------------|
| 1  | Authentication             | Guest        | 1     | ✅ Connected    | ✅ Done       |
| 2  | Candidate Profile          | Candidate    | 1     | ⚠️ UI ready     | Needed        |
| 3  | Recruiter Profile          | Recruiter    | 1     | ⚠️ UI ready     | Needed        |
| 4  | Job CRUD                   | Recruiter    | 1     | ❌ Not built    | Needed        |
| 5  | Job Search & Filters       | Both         | 1     | ⚠️ Mock         | Needed        |
| 6  | Job Detail                 | Both         | 1     | ⚠️ Mock         | Needed        |
| 7  | Job Application            | Candidate    | 1     | ⚠️ Mock         | Needed        |
| 8  | Saved Jobs                 | Candidate    | 1     | ⚠️ Partial      | Needed        |
| 9  | Applicant Management       | Recruiter    | 1     | ❌ Not built    | Needed        |
| 10 | Application Tracking       | Candidate    | 1     | ⚠️ Rich UI      | Needed        |
| 11 | Real-Time Chat             | Both         | 2     | ⚠️ UI ready     | Needed        |
| 12 | Notifications              | Both         | 2     | ⚠️ Component    | Needed        |
| 13 | Resume Upload              | Candidate    | 2     | ❌ Not built    | Needed        |
| 14 | Settings                   | Both         | 2     | ⚠️ Form UI      | Needed        |
| 15 | Admin Dashboard            | Admin        | 3     | ❌ Not scoped   | Optional      |
| 16 | Email Notifications        | Both         | 3     | ❌ Not scoped   | Optional      |
| 17 | Interview Scheduling       | Both         | 3     | ❌ Not scoped   | Optional      |

**Legend:** ✅ = connected to backend · ⚠️ = built but uses mock data · ❌ = placeholder or not built

---

## Implementation Order

```
Phase 1 core flow (each step = one /feature-scaffold + one /backend-feature):
  1. Auth           ← DONE
  2. Jobs           ← service + slice + backend 6 files
  3. Companies      ← service + slice + backend 6 files
  4. Applications   ← service + slice + backend 6 files
  5. Messages       ← service + slice + backend 6 files

Phase 2 enhancements:
  6. Notifications  ← service + slice + backend
  7. Resume Upload  ← storage only (no new feature scaffold needed)

Legacy pageFiles to migrate to feature-based structure as each backend connects:
  pageFiles/JobsPage → uses jobsSlice
  pageFiles/CandidateDashboard → uses applicationsSlice + companiesSlice
  pageFiles/RecruiterDashboard → uses jobsSlice + applicationsSlice
  pageFiles/MessagesPage → uses messagesSlice
```
