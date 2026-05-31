import type {
  Job, Company, Application, Candidate, Recruiter,
  Notification, Message, Plan
} from "@/types";

// ─── Companies ───────────────────────────────────────────────────────────────

export const MOCK_COMPANIES: Company[] = [
  {
    id: "c1", name: "Google", logo: "🔵", website: "https://google.com",
    industry: "Technology", size: "1000+", location: "Bengaluru, India",
    description: "A leading global technology company.", foundedYear: 1998,
    rating: 4.5, reviewsCount: 12400, activeJobs: 48, verified: true,
  },
  {
    id: "c2", name: "Microsoft", logo: "🟦", website: "https://microsoft.com",
    industry: "Technology", size: "1000+", location: "Hyderabad, India",
    description: "Empowering every person and organization.", foundedYear: 1975,
    rating: 4.3, reviewsCount: 9800, activeJobs: 36, verified: true,
  },
  {
    id: "c3", name: "Razorpay", logo: "🔷", website: "https://razorpay.com",
    industry: "Fintech", size: "501-1000", location: "Bengaluru, India",
    description: "India's leading payment gateway.", foundedYear: 2014,
    rating: 4.6, reviewsCount: 2300, activeJobs: 24, verified: true,
  },
  {
    id: "c4", name: "Swiggy", logo: "🟠", website: "https://swiggy.com",
    industry: "Food Tech", size: "1000+", location: "Bengaluru, India",
    description: "Delivering happiness to your doorstep.", foundedYear: 2014,
    rating: 4.1, reviewsCount: 3100, activeJobs: 18, verified: true,
  },
  {
    id: "c5", name: "Zepto", logo: "🟣", website: "https://zepto.in",
    industry: "Quick Commerce", size: "501-1000", location: "Mumbai, India",
    description: "10-minute grocery delivery.", foundedYear: 2021,
    rating: 4.0, reviewsCount: 980, activeJobs: 12, verified: true,
  },
  {
    id: "c6", name: "CRED", logo: "⚫", website: "https://cred.club",
    industry: "Fintech", size: "201-500", location: "Bengaluru, India",
    description: "A members-only credit card bill payment app.", foundedYear: 2018,
    rating: 4.4, reviewsCount: 1560, activeJobs: 15, verified: true,
  },
  {
    id: "c7", name: "PhonePe", logo: "🟤", website: "https://phonepe.com",
    industry: "Fintech", size: "1000+", location: "Bengaluru, India",
    description: "India's most trusted digital payments platform.", foundedYear: 2015,
    rating: 4.2, reviewsCount: 4200, activeJobs: 29, verified: true,
  },
  {
    id: "c8", name: "Meesho", logo: "🩷", website: "https://meesho.com",
    industry: "E-commerce", size: "1000+", location: "Bengaluru, India",
    description: "Democratizing e-commerce for small businesses.", foundedYear: 2015,
    rating: 4.0, reviewsCount: 2100, activeJobs: 21, verified: false,
  },
];

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export const MOCK_JOBS: Job[] = [
  {
    id: "j1", title: "Senior Frontend Engineer", company: MOCK_COMPANIES[0],
    location: "Bengaluru, India", type: "full-time", level: "senior",
    salary: { min: 2800000, max: 4500000, currency: "INR", period: "yearly" },
    description: "We are looking for a Senior Frontend Engineer to join our Ads Infrastructure team. You will be responsible for building scalable, high-performance web applications that reach billions of users globally.",
    requirements: ["5+ years React experience", "Strong TypeScript skills", "Experience with large-scale systems", "Knowledge of web performance optimization"],
    responsibilities: ["Lead frontend architecture decisions", "Mentor junior engineers", "Collaborate with design and product teams", "Drive technical roadmap"],
    skills: ["React", "TypeScript", "GraphQL", "Next.js", "Tailwind CSS"],
    postedAt: "2024-01-15T10:00:00Z", expiresAt: "2024-02-15T10:00:00Z",
    status: "active", applicantsCount: 128, viewsCount: 2340,
    isFeatured: true, isRemote: false, recruiter: "r1", category: "Technology",
  },
  {
    id: "j2", title: "Full Stack Developer", company: MOCK_COMPANIES[2],
    location: "Bengaluru, India", type: "full-time", level: "mid",
    salary: { min: 1500000, max: 2500000, currency: "INR", period: "yearly" },
    description: "Join Razorpay's core payments team to build the infrastructure that powers India's digital economy. You'll work on high-throughput systems processing millions of transactions daily.",
    requirements: ["3+ years full-stack experience", "Node.js & React proficiency", "Database design skills", "API design experience"],
    responsibilities: ["Build and maintain payment APIs", "Optimize database queries", "Write clean, tested code", "Participate in code reviews"],
    skills: ["Node.js", "React", "PostgreSQL", "Redis", "Docker"],
    postedAt: "2024-01-14T08:00:00Z", expiresAt: "2024-02-14T08:00:00Z",
    status: "active", applicantsCount: 89, viewsCount: 1560,
    isFeatured: true, isRemote: false, recruiter: "r2", category: "Technology",
  },
  {
    id: "j3", title: "Product Designer (UI/UX)", company: MOCK_COMPANIES[5],
    location: "Remote", type: "remote", level: "mid",
    salary: { min: 1200000, max: 2000000, currency: "INR", period: "yearly" },
    description: "CRED is looking for a Product Designer who obsesses over details and can craft experiences for India's most premium user base. You'll own end-to-end design for our flagship features.",
    requirements: ["4+ years UI/UX experience", "Proficiency in Figma", "Strong visual design sensibility", "Experience with design systems"],
    responsibilities: ["Design user flows and prototypes", "Collaborate with product and engineering", "Conduct user research", "Maintain design system"],
    skills: ["Figma", "Prototyping", "Design Systems", "User Research", "Motion Design"],
    postedAt: "2024-01-13T09:00:00Z", expiresAt: "2024-02-13T09:00:00Z",
    status: "active", applicantsCount: 64, viewsCount: 1120,
    isFeatured: false, isRemote: true, recruiter: "r3", category: "Design",
  },
  {
    id: "j4", title: "Backend Engineer — Golang", company: MOCK_COMPANIES[4],
    location: "Mumbai, India", type: "full-time", level: "senior",
    salary: { min: 2000000, max: 3500000, currency: "INR", period: "yearly" },
    description: "Zepto is scaling its instant delivery platform and needs talented backend engineers to build and scale its logistics and order management systems.",
    requirements: ["4+ years backend experience", "Strong Go/Golang skills", "Experience with distributed systems", "Microservices expertise"],
    responsibilities: ["Design high-throughput APIs", "Build real-time tracking systems", "Optimize logistics algorithms", "Lead technical discussions"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Kafka", "gRPC"],
    postedAt: "2024-01-12T11:00:00Z", expiresAt: "2024-02-12T11:00:00Z",
    status: "active", applicantsCount: 43, viewsCount: 870,
    isFeatured: false, isRemote: false, recruiter: "r4", category: "Technology",
  },
  {
    id: "j5", title: "Data Scientist", company: MOCK_COMPANIES[3],
    location: "Bengaluru, India", type: "full-time", level: "mid",
    salary: { min: 1800000, max: 3000000, currency: "INR", period: "yearly" },
    description: "Join Swiggy's Data Science team to build recommendation engines and demand forecasting models that directly impact millions of food orders daily.",
    requirements: ["3+ years in data science", "Strong Python skills", "ML/DL experience", "SQL proficiency"],
    responsibilities: ["Build ML models for recommendations", "Analyze large datasets", "A/B test experiments", "Present insights to stakeholders"],
    skills: ["Python", "TensorFlow", "SQL", "Spark", "Airflow"],
    postedAt: "2024-01-11T07:00:00Z", expiresAt: "2024-02-11T07:00:00Z",
    status: "active", applicantsCount: 156, viewsCount: 2100,
    isFeatured: true, isRemote: false, recruiter: "r5", category: "Data Science",
  },
  {
    id: "j6", title: "DevOps Engineer", company: MOCK_COMPANIES[6],
    location: "Bengaluru, India", type: "full-time", level: "senior",
    salary: { min: 2200000, max: 3800000, currency: "INR", period: "yearly" },
    description: "PhonePe is looking for a DevOps Engineer to build and manage our cloud infrastructure, CI/CD pipelines, and ensure 99.99% uptime for our payment systems.",
    requirements: ["5+ years DevOps experience", "AWS/GCP expertise", "Kubernetes mastery", "Security best practices"],
    responsibilities: ["Manage cloud infrastructure", "Build CI/CD pipelines", "Monitor system health", "Lead incident response"],
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Python"],
    postedAt: "2024-01-10T10:00:00Z", expiresAt: "2024-02-10T10:00:00Z",
    status: "active", applicantsCount: 38, viewsCount: 690,
    isFeatured: false, isRemote: false, recruiter: "r1", category: "Engineering",
  },
  {
    id: "j7", title: "Product Manager", company: MOCK_COMPANIES[1],
    location: "Hyderabad, India", type: "full-time", level: "lead",
    salary: { min: 3000000, max: 5000000, currency: "INR", period: "yearly" },
    description: "Microsoft is seeking an experienced Product Manager to lead its Cloud Business Applications group, driving strategy for enterprise SaaS products.",
    requirements: ["6+ years PM experience", "Enterprise software background", "Strong analytical skills", "Excellent communication"],
    responsibilities: ["Define product roadmap", "Work with engineering and design", "Analyze market trends", "Drive product launches"],
    skills: ["Product Strategy", "Roadmapping", "Agile", "Analytics", "Stakeholder Management"],
    postedAt: "2024-01-09T09:00:00Z", expiresAt: "2024-02-09T09:00:00Z",
    status: "active", applicantsCount: 72, viewsCount: 1340,
    isFeatured: true, isRemote: false, recruiter: "r2", category: "Product",
  },
  {
    id: "j8", title: "React Native Developer", company: MOCK_COMPANIES[7],
    location: "Remote", type: "remote", level: "mid",
    salary: { min: 1200000, max: 2200000, currency: "INR", period: "yearly" },
    description: "Meesho is building the next generation of social commerce in India. We need React Native developers to craft beautiful, performant mobile experiences for Tier 2/3 India.",
    requirements: ["3+ years React Native experience", "iOS/Android deployment knowledge", "State management expertise", "Performance optimization skills"],
    responsibilities: ["Build cross-platform mobile features", "Optimize app performance", "Write unit and integration tests", "Collaborate with backend teams"],
    skills: ["React Native", "TypeScript", "Redux", "Firebase", "REST APIs"],
    postedAt: "2024-01-08T08:00:00Z", expiresAt: "2024-02-08T08:00:00Z",
    status: "active", applicantsCount: 91, viewsCount: 1780,
    isFeatured: false, isRemote: true, recruiter: "r3", category: "Technology",
  },
  {
    id: "j9", title: "Marketing Manager — Growth", company: MOCK_COMPANIES[4],
    location: "Mumbai, India", type: "full-time", level: "mid",
    salary: { min: 1000000, max: 1800000, currency: "INR", period: "yearly" },
    description: "Drive Zepto's user acquisition and retention strategies across digital channels. Own the full funnel from awareness to conversion.",
    requirements: ["4+ years growth marketing", "Digital marketing expertise", "Data-driven mindset", "Experience in D2C or quick commerce"],
    responsibilities: ["Plan and execute growth campaigns", "Manage paid media budgets", "Analyze funnel metrics", "A/B test creatives"],
    skills: ["Growth Marketing", "Google Ads", "Meta Ads", "Analytics", "SEO"],
    postedAt: "2024-01-07T10:00:00Z", expiresAt: "2024-02-07T10:00:00Z",
    status: "active", applicantsCount: 47, viewsCount: 890,
    isFeatured: false, isRemote: false, recruiter: "r4", category: "Marketing",
  },
  {
    id: "j10", title: "Machine Learning Engineer", company: MOCK_COMPANIES[0],
    location: "Bengaluru, India", type: "full-time", level: "senior",
    salary: { min: 3500000, max: 6000000, currency: "INR", period: "yearly" },
    description: "Join Google DeepMind's India team to build cutting-edge ML systems that power products used by billions. You'll work on NLP, CV, and reinforcement learning problems at scale.",
    requirements: ["5+ years ML engineering", "Strong Python & ML frameworks", "Research publications preferred", "Distributed training experience"],
    responsibilities: ["Design and train large-scale models", "Deploy ML pipelines to production", "Collaborate with research scientists", "Optimize inference latency"],
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Distributed Computing"],
    postedAt: "2024-01-06T09:00:00Z", expiresAt: "2024-02-06T09:00:00Z",
    status: "active", applicantsCount: 203, viewsCount: 4200,
    isFeatured: true, isRemote: false, recruiter: "r5", category: "Data Science",
  },
  {
    id: "j11", title: "Backend Engineer — Python", company: MOCK_COMPANIES[2],
    location: "Bengaluru, India", type: "full-time", level: "entry",
    salary: { min: 800000, max: 1400000, currency: "INR", period: "yearly" },
    description: "Entry-level position for ambitious backend engineers who want to work on India's most critical payment infrastructure at Razorpay.",
    requirements: ["1-2 years Python experience", "Basic understanding of REST APIs", "SQL knowledge", "Problem-solving mindset"],
    responsibilities: ["Develop backend features", "Write unit tests", "Debug production issues", "Learn from senior engineers"],
    skills: ["Python", "Django", "PostgreSQL", "REST APIs", "Git"],
    postedAt: "2024-01-05T08:00:00Z", expiresAt: "2024-02-05T08:00:00Z",
    status: "active", applicantsCount: 312, viewsCount: 5600,
    isFeatured: false, isRemote: false, recruiter: "r1", category: "Technology",
  },
  {
    id: "j12", title: "Content Strategist", company: MOCK_COMPANIES[5],
    location: "Remote", type: "remote", level: "mid",
    salary: { min: 900000, max: 1500000, currency: "INR", period: "yearly" },
    description: "CRED is looking for a content strategist to craft compelling narratives for India's most premium credit card community.",
    requirements: ["3+ years content experience", "Strong writing portfolio", "SEO knowledge", "Experience in fintech preferred"],
    responsibilities: ["Develop content strategy", "Write long-form content", "Manage content calendar", "Collaborate with design"],
    skills: ["Content Strategy", "SEO", "Copywriting", "Brand Voice", "Analytics"],
    postedAt: "2024-01-04T10:00:00Z", expiresAt: "2024-02-04T10:00:00Z",
    status: "active", applicantsCount: 58, viewsCount: 980,
    isFeatured: false, isRemote: true, recruiter: "r2", category: "Content & Writing",
  },
];

// ─── Mock Candidate ────────────────────────────────────────────────────────────

export const MOCK_CANDIDATE: Candidate = {
  id: "u1", name: "Aryan Sharma", email: "aryan.sharma@email.com",
  avatar: "AS", role: "candidate",
  headline: "Senior Frontend Engineer | React • TypeScript • Next.js",
  location: "Bengaluru, India",
  skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL", "Tailwind CSS"],
  experience: 5, resumeUrl: "/resume-aryan.pdf",
  savedJobs: ["j1", "j3", "j7"], appliedJobs: ["j2", "j5", "j10"],
  profileCompletion: 82, createdAt: "2023-06-15T10:00:00Z",
};

// ─── Mock Recruiter ────────────────────────────────────────────────────────────

export const MOCK_RECRUITER: Recruiter = {
  id: "r1", name: "Priya Nair", email: "priya.nair@google.com",
  avatar: "PN", role: "recruiter",
  company: "Google", companyId: "c1",
  designation: "Senior Technical Recruiter",
  postedJobs: ["j1", "j6", "j10"],
  createdAt: "2022-03-10T09:00:00Z",
};

// ─── Mock Applications ────────────────────────────────────────────────────────

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1", jobId: "j2", job: MOCK_JOBS[1],
    candidateId: "u1", candidate: MOCK_CANDIDATE,
    status: "interview", appliedAt: "2024-01-10T10:00:00Z", updatedAt: "2024-01-14T15:00:00Z",
    coverLetter: "I'm excited to apply for the Full Stack Developer position at Razorpay...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    id: "a2", jobId: "j5", job: MOCK_JOBS[4],
    candidateId: "u1", candidate: MOCK_CANDIDATE,
    status: "screening", appliedAt: "2024-01-08T09:00:00Z", updatedAt: "2024-01-11T12:00:00Z",
    coverLetter: "As a data enthusiast with 5 years of experience...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    id: "a3", jobId: "j10", job: MOCK_JOBS[9],
    candidateId: "u1", candidate: MOCK_CANDIDATE,
    status: "applied", appliedAt: "2024-01-06T11:00:00Z", updatedAt: "2024-01-06T11:00:00Z",
    coverLetter: "I would love to work on ML systems at Google...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    id: "a4", jobId: "j1", job: MOCK_JOBS[0],
    candidateId: "u2", status: "offer",
    appliedAt: "2024-01-05T08:00:00Z", updatedAt: "2024-01-13T16:00:00Z",
  },
  {
    id: "a5", jobId: "j1", job: MOCK_JOBS[0],
    candidateId: "u3", status: "rejected",
    appliedAt: "2024-01-04T10:00:00Z", updatedAt: "2024-01-12T14:00:00Z",
  },
  {
    id: "a6", jobId: "j6", job: MOCK_JOBS[5],
    candidateId: "u4", status: "screening",
    appliedAt: "2024-01-11T09:00:00Z", updatedAt: "2024-01-13T10:00:00Z",
  },
];

// ─── Mock Notifications ────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "application_update",
    title: "Interview Scheduled!", message: "Razorpay wants to schedule a technical interview with you for Full Stack Developer role.",
    read: false, createdAt: "2024-01-14T15:00:00Z", actionUrl: "/applications/a1",
  },
  {
    id: "n2", type: "profile_view",
    title: "Google viewed your profile", message: "A recruiter from Google viewed your profile 2 hours ago.",
    read: false, createdAt: "2024-01-14T13:00:00Z",
  },
  {
    id: "n3", type: "job_alert",
    title: "New jobs matching your profile", message: "5 new Senior Frontend Engineer positions were posted today in Bengaluru.",
    read: false, createdAt: "2024-01-14T08:00:00Z", actionUrl: "/jobs",
  },
  {
    id: "n4", type: "new_message",
    title: "New message from Priya Nair", message: "Hi Aryan, I'd love to discuss the Senior Frontend Engineer role at Google...",
    read: true, createdAt: "2024-01-13T10:00:00Z", actionUrl: "/messages",
  },
  {
    id: "n5", type: "application_update",
    title: "Application Update — Swiggy", message: "Your application for Data Scientist is under screening review.",
    read: true, createdAt: "2024-01-11T12:00:00Z", actionUrl: "/applications/a2",
  },
];

// ─── Mock Conversations ────────────────────────────────────────────────────────

export const MOCK_MESSAGES: Message[] = [
  { id: "m1", senderId: "r1", receiverId: "u1", content: "Hi Aryan! I came across your profile and think you'd be a great fit for our Senior Frontend Engineer role at Google.", sentAt: "2024-01-13T10:00:00Z", read: true },
  { id: "m2", senderId: "u1", receiverId: "r1", content: "Hi Priya! Thank you for reaching out. I'm definitely interested in learning more about the role.", sentAt: "2024-01-13T10:15:00Z", read: true },
  { id: "m3", senderId: "r1", receiverId: "u1", content: "Great! The role is within our Ads Infrastructure team. You'd be working on large-scale React applications serving billions of users.", sentAt: "2024-01-13T10:20:00Z", read: true },
  { id: "m4", senderId: "u1", receiverId: "r1", content: "That sounds incredibly exciting! Could you share more about the team structure and the tech stack you're working with?", sentAt: "2024-01-13T10:30:00Z", read: true },
  { id: "m5", senderId: "r1", receiverId: "u1", content: "Of course! The team uses React, TypeScript, GraphQL, and internal tooling. Team size is around 12 engineers. Would you be open to a 30-min intro call this week?", sentAt: "2024-01-13T11:00:00Z", read: false },
];

// ─── Analytics Data ────────────────────────────────────────────────────────────

export const CANDIDATE_ANALYTICS = {
  profileViews: [
    { label: "Mon", value: 12 }, { label: "Tue", value: 18 },
    { label: "Wed", value: 9 }, { label: "Thu", value: 24 },
    { label: "Fri", value: 31 }, { label: "Sat", value: 15 },
    { label: "Sun", value: 8 },
  ],
  applicationStatus: [
    { label: "Applied", value: 3 }, { label: "Screening", value: 1 },
    { label: "Interview", value: 1 }, { label: "Offer", value: 0 },
  ],
  skillsMatch: [
    { label: "React", value: 95 }, { label: "TypeScript", value: 88 },
    { label: "Node.js", value: 75 }, { label: "GraphQL", value: 70 },
    { label: "Next.js", value: 85 },
  ],
};

export const RECRUITER_ANALYTICS = {
  applicationsOverTime: [
    { label: "Week 1", value: 24 }, { label: "Week 2", value: 38 },
    { label: "Week 3", value: 52 }, { label: "Week 4", value: 41 },
  ],
  jobViews: [
    { label: "Jan 10", value: 234 }, { label: "Jan 11", value: 312 },
    { label: "Jan 12", value: 189 }, { label: "Jan 13", value: 445 },
    { label: "Jan 14", value: 523 }, { label: "Jan 15", value: 398 },
    { label: "Jan 16", value: 267 },
  ],
  hiringFunnel: [
    { label: "Applied", value: 128 }, { label: "Screened", value: 64 },
    { label: "Interviewed", value: 24 }, { label: "Offered", value: 8 },
    { label: "Hired", value: 5 },
  ],
};

// ─── Subscription Plans ────────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: "free", name: "Free", price: 0, billingPeriod: "monthly",
    features: ["Post up to 3 jobs", "Basic applicant tracking", "Email support", "Standard job listing"],
    jobPostLimit: 3, featuredJobs: 0, highlighted: false,
  },
  {
    id: "pro", name: "Pro", price: 4999, billingPeriod: "monthly",
    features: ["Post up to 25 jobs", "Advanced ATS", "Priority support", "Featured job listings", "Analytics dashboard", "Custom branding", "Resume database access"],
    jobPostLimit: 25, featuredJobs: 5, highlighted: true,
  },
  {
    id: "enterprise", name: "Enterprise", price: 14999, billingPeriod: "monthly",
    features: ["Unlimited job posts", "Full ATS suite", "Dedicated account manager", "Unlimited featured jobs", "Advanced analytics", "API access", "Custom integrations", "White-label solution"],
    jobPostLimit: -1, featuredJobs: -1, highlighted: false,
  },
];
