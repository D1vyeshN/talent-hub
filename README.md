# TalentHub

A full-stack job marketplace platform built with the **MERN stack** (MongoDB, Express, React, Node.js). Connects job seekers with top companies through intelligent job matching, real-time messaging, and comprehensive analytics.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 · React 19 · TypeScript · Redux Toolkit · Tailwind CSS v4 |
| **Backend** | Express.js *(coming soon)* |
| **Database** | MongoDB / Mongoose *(coming soon)* |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Animations** | Framer Motion |

## 📁 Project Structure

```
talent-hub/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages & layouts
│   │   │   ├── (auth)/          # Login & Register pages
│   │   │   ├── (main)/          # Protected routes
│   │   │   │   ├── jobs/        # Job listings & detail views
│   │   │   │   ├── companies/   # Company browsing & profiles
│   │   │   │   ├── dashboard/   # Candidate & Recruiter dashboards
│   │   │   │   ├── messages/    # Real-time messaging
│   │   │   │   ├── salaries/    # Salary insights
│   │   │   │   ├── resources/   # Career resources
│   │   │   │   └── settings/    # User settings
│   │   │   ├── layout.tsx       # Root layout with fonts & providers
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── providers.tsx    # Redux & theme providers
│   │   │   ├── error.tsx        # Error boundary
│   │   │   └── not-found.tsx    # 404 page
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, NotificationPanel
│   │   │   └── ui/              # Reusable UI primitives
│   │   │       ├── Avatar.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── Skeleton.tsx
│   │   │       └── Tabs.tsx
│   │   ├── lib/
│   │   │   ├── mockData.ts      # Mock data (to be replaced by API calls)
│   │   │   └── utils.ts         # Utility functions
│   │   ├── store/               # Redux store
│   │   │   ├── index.ts
│   │   │   ├── hooks.ts
│   │   │   └── slices/
│   │   │       ├── authSlice.ts # Authentication state
│   │   │       └── uiSlice.ts   # UI state (modals, panels)
│   │   ├── types/               # TypeScript interfaces
│   │   │   └── index.ts         # Shared types (User, Job, Company, etc.)
│   │   └── utils/
│   │       └── cn.ts            # Class name utility (clsx + tailwind-merge)
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
└── backend/                     # Express API *(to be created)*
    ├── src/
    │   ├── routes/              # API route handlers
    │   ├── models/              # Mongoose schemas
    │   ├── middleware/          # Auth, validation, error handling
    │   └── index.ts             # Server entry point
    └── package.json
```

## ✨ Features

### 👤 For Candidates
- **Job Discovery** — Browse and filter jobs by type, level, salary, location, and skills
- **Smart Search** — Full-text search with auto-suggested tech skills
- **Job Alerts** — Get notified about new matching positions
- **Application Tracking** — Monitor application status (Applied → Screening → Interview → Offer)
- **Candidate Dashboard** — Profile views analytics, skills match, application stats
- **Company Profiles** — Explore companies, ratings, and open positions
- **Salary Insights** — Compare salary ranges across roles and companies
- **Real-time Messaging** — Chat directly with recruiters

### 🏢 For Recruiters
- **Job Posting** — Create and manage job listings (Free: 3 jobs, Pro: 25 jobs, Enterprise: unlimited)
- **Applicant Management** — Review candidates, track pipeline with hiring funnel analytics
- **Recruiter Dashboard** — Applications over time, job views, hiring funnel visualization
- **Company Management** — Create/edit company profiles
- **Direct Messaging** — Reach out to candidates instantly
- **Featured Jobs** — Boost visibility for priority positions

### 🔐 Authentication & Roles
- **Candidate** — Browse jobs, apply, track applications, message recruiters
- **Recruiter** — Post jobs, manage applicants, view analytics
- **Admin** — Platform oversight and moderation

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (for backend, coming soon)

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Next.js) |
| `npm run build` | Build for production |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting errors |

## 🔜 Roadmap

- [ ] **Express.js Backend** — REST API with authentication, job CRUD, applications, messaging
- [ ] **MongoDB Integration** — Mongoose models for all entities (Users, Jobs, Companies, Applications)
- [ ] **Replace Mock Data** — Migrate from `src/lib/mockData.ts` to real API calls
- [ ] **JWT Authentication** — Secure login/register with token-based auth
- [ ] **File Uploads** — Resume upload and company logo storage
- [ ] **Real-time Chat** — WebSocket-based messaging
- [ ] **Email Notifications** — Nodemailer integration
- [ ] **Payment Integration** — Subscription plans for recruiters
- [ ] **Admin Panel** — User management, content moderation
- [ ] **Testing** — Playwright E2E tests + unit tests

## 📦 Key Dependencies

```
next@16        — React framework with App Router
react@19       — UI library
typescript@5   — Type safety
@reduxjs/toolkit@2  — State management
tailwindcss@4  — Utility-first CSS
framer-motion@12  — Animations
lucide-react    — Icon library
recharts        — Data visualization
react-hot-toast — Toast notifications
date-fns        — Date utilities
```

## 📝 Notes

- Currently uses **mock data** in `src/lib/mockData.ts` — will be replaced by API calls once the backend is built
- Authentication is **client-side only** (Redux state) — migrating to JWT-based auth with the backend
- Type definitions in `src/types/index.ts` serve as the contract between frontend and future backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'feat: add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

Built with ❤️ using Claude Code
