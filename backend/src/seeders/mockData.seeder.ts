import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { User } from "../modules/users/user.model";
import { Candidate } from "../modules/candidate/candidate.model";
import { Recruiter } from "../modules/recruiter/recruiter.model";
import { Company } from "../modules/company/company.model";
import { Job } from "../modules/job/job.model";
import { Application } from "../modules/application/application.model";
import { Notification } from "../modules/notification/notification.model";
import { Message } from "../modules/message/message.model";
import { Conversation } from "../modules/message/conversation.model";
import { logger } from "../utils/logger";

// Load environment variables
dotenv.config();

// Mock data from frontend (simplified version for seeder)
const MOCK_COMPANIES = [
  {
    name: "Google",
    logo: "🔵",
    website: "https://google.com",
    industry: "Technology",
    size: "1000+",
    location: "Bengaluru, India",
    description: "A leading global technology company.",
    foundedYear: 1998,
    rating: 4.5,
    reviewsCount: 12400,
    activeJobs: 48,
    verified: true,
  },
  {
    name: "Microsoft",
    logo: "🟦",
    website: "https://microsoft.com",
    industry: "Technology",
    size: "1000+",
    location: "Hyderabad, India",
    description: "Empowering every person and organization.",
    foundedYear: 1975,
    rating: 4.3,
    reviewsCount: 9800,
    activeJobs: 36,
    verified: true,
  },
  {
    name: "Razorpay",
    logo: "🔷",
    website: "https://razorpay.com",
    industry: "Fintech",
    size: "501-1000",
    location: "Bengaluru, India",
    description: "India's leading payment gateway.",
    foundedYear: 2014,
    rating: 4.6,
    reviewsCount: 2300,
    activeJobs: 24,
    verified: true,
  },
  {
    name: "Swiggy",
    logo: "🟠",
    website: "https://swiggy.com",
    industry: "Food Tech",
    size: "1000+",
    location: "Bengaluru, India",
    description: "Delivering happiness to your doorstep.",
    foundedYear: 2014,
    rating: 4.1,
    reviewsCount: 3100,
    activeJobs: 18,
    verified: true,
  },
  {
    name: "Zepto",
    logo: "🟣",
    website: "https://zepto.in",
    industry: "Quick Commerce",
    size: "501-1000",
    location: "Mumbai, India",
    description: "10-minute grocery delivery.",
    foundedYear: 2021,
    rating: 4.0,
    reviewsCount: 980,
    activeJobs: 12,
    verified: true,
  },
  {
    name: "CRED",
    logo: "⚫",
    website: "https://cred.club",
    industry: "Fintech",
    size: "201-500",
    location: "Bengaluru, India",
    description: "A members-only credit card bill payment app.",
    foundedYear: 2018,
    rating: 4.4,
    reviewsCount: 1560,
    activeJobs: 15,
    verified: true,
  },
  {
    name: "PhonePe",
    logo: "🟤",
    website: "https://phonepe.com",
    industry: "Fintech",
    size: "1000+",
    location: "Bengaluru, India",
    description: "India's most trusted digital payments platform.",
    foundedYear: 2015,
    rating: 4.2,
    reviewsCount: 4200,
    activeJobs: 29,
    verified: true,
  },
  {
    name: "Meesho",
    logo: "🩷",
    website: "https://meesho.com",
    industry: "E-commerce",
    size: "1000+",
    location: "Bengaluru, India",
    description: "Democratizing e-commerce for small businesses.",
    foundedYear: 2015,
    rating: 4.0,
    reviewsCount: 2100,
    activeJobs: 21,
    verified: false,
  },
];

const MOCK_JOBS = [
  {
    title: "Senior Frontend Engineer",
    location: "Bengaluru, India",
    type: "full-time",
    level: "senior",
    salary: { min: 2800000, max: 4500000, currency: "INR", period: "yearly" },
    description: "We are looking for a Senior Frontend Engineer to join our Ads Infrastructure team. You will be responsible for building scalable, high-performance web applications that reach billions of users globally.",
    requirements: ["5+ years React experience", "Strong TypeScript skills", "Experience with large-scale systems", "Knowledge of web performance optimization"],
    responsibilities: ["Lead frontend architecture decisions", "Mentor junior engineers", "Collaborate with design and product teams", "Drive technical roadmap"],
    skills: ["React", "TypeScript", "GraphQL", "Next.js", "Tailwind CSS"],
    postedAt: "2024-01-15T10:00:00Z",
    expiresAt: "2024-02-15T10:00:00Z",
    status: "active",
    applicantsCount: 128,
    viewsCount: 2340,
    isFeatured: true,
    isRemote: false,
    category: "Technology",
  },
  {
    title: "Full Stack Developer",
    location: "Bengaluru, India",
    type: "full-time",
    level: "mid",
    salary: { min: 1500000, max: 2500000, currency: "INR", period: "yearly" },
    description: "Join Razorpay's core payments team to build the infrastructure that powers India's digital economy. You'll work on high-throughput systems processing millions of transactions daily.",
    requirements: ["3+ years full-stack experience", "Node.js & React proficiency", "Database design skills", "API design experience"],
    responsibilities: ["Build and maintain payment APIs", "Optimize database queries", "Write clean, tested code", "Participate in code reviews"],
    skills: ["Node.js", "React", "PostgreSQL", "Redis", "Docker"],
    postedAt: "2024-01-14T08:00:00Z",
    expiresAt: "2024-02-14T08:00:00Z",
    status: "active",
    applicantsCount: 89,
    viewsCount: 1560,
    isFeatured: true,
    isRemote: false,
    category: "Technology",
  },
  {
    title: "Product Designer (UI/UX)",
    location: "Remote",
    type: "remote",
    level: "mid",
    salary: { min: 1200000, max: 2000000, currency: "INR", period: "yearly" },
    description: "CRED is looking for a Product Designer who obsesses over details and can craft experiences for India's most premium user base. You'll own end-to-end design for our flagship features.",
    requirements: ["4+ years UI/UX experience", "Proficiency in Figma", "Strong visual design sensibility", "Experience with design systems"],
    responsibilities: ["Design user flows and prototypes", "Collaborate with product and engineering", "Conduct user research", "Maintain design system"],
    skills: ["Figma", "Prototyping", "Design Systems", "User Research", "Motion Design"],
    postedAt: "2024-01-13T09:00:00Z",
    expiresAt: "2024-02-13T09:00:00Z",
    status: "active",
    applicantsCount: 64,
    viewsCount: 1120,
    isFeatured: false,
    isRemote: true,
    category: "Design",
  },
  {
    title: "Backend Engineer — Golang",
    location: "Mumbai, India",
    type: "full-time",
    level: "senior",
    salary: { min: 2000000, max: 3500000, currency: "INR", period: "yearly" },
    description: "Zepto is scaling its instant delivery platform and needs talented backend engineers to build and scale its logistics and order management systems.",
    requirements: ["4+ years backend experience", "Strong Go/Golang skills", "Experience with distributed systems", "Microservices expertise"],
    responsibilities: ["Design high-throughput APIs", "Build real-time tracking systems", "Optimize logistics algorithms", "Lead technical discussions"],
    skills: ["Go", "Kubernetes", "PostgreSQL", "Kafka", "gRPC"],
    postedAt: "2024-01-12T11:00:00Z",
    expiresAt: "2024-02-12T11:00:00Z",
    status: "active",
    applicantsCount: 43,
    viewsCount: 870,
    isFeatured: false,
    isRemote: false,
    category: "Technology",
  },
  {
    title: "Data Scientist",
    location: "Bengaluru, India",
    type: "full-time",
    level: "mid",
    salary: { min: 1800000, max: 3000000, currency: "INR", period: "yearly" },
    description: "Join Swiggy's Data Science team to build recommendation engines and demand forecasting models that directly impact millions of food orders daily.",
    requirements: ["3+ years in data science", "Strong Python skills", "ML/DL experience", "SQL proficiency"],
    responsibilities: ["Build ML models for recommendations", "Analyze large datasets", "A/B test experiments", "Present insights to stakeholders"],
    skills: ["Python", "TensorFlow", "SQL", "Spark", "Airflow"],
    postedAt: "2024-01-11T07:00:00Z",
    expiresAt: "2024-02-11T07:00:00Z",
    status: "active",
    applicantsCount: 156,
    viewsCount: 2100,
    isFeatured: true,
    isRemote: false,
    category: "Data Science",
  },
  {
    title: "DevOps Engineer",
    location: "Bengaluru, India",
    type: "full-time",
    level: "senior",
    salary: { min: 2200000, max: 3800000, currency: "INR", period: "yearly" },
    description: "PhonePe is looking for a DevOps Engineer to build and manage our cloud infrastructure, CI/CD pipelines, and ensure 99.99% uptime for our payment systems.",
    requirements: ["5+ years DevOps experience", "AWS/GCP expertise", "Kubernetes mastery", "Security best practices"],
    responsibilities: ["Manage cloud infrastructure", "Build CI/CD pipelines", "Monitor system health", "Lead incident response"],
    skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Python"],
    postedAt: "2024-01-10T10:00:00Z",
    expiresAt: "2024-02-10T10:00:00Z",
    status: "active",
    applicantsCount: 38,
    viewsCount: 690,
    isFeatured: false,
    isRemote: false,
    category: "Engineering",
  },
  {
    title: "Product Manager",
    location: "Hyderabad, India",
    type: "full-time",
    level: "lead",
    salary: { min: 3000000, max: 5000000, currency: "INR", period: "yearly" },
    description: "Microsoft is seeking an experienced Product Manager to lead its Cloud Business Applications group, driving strategy for enterprise SaaS products.",
    requirements: ["6+ years PM experience", "Enterprise software background", "Strong analytical skills", "Excellent communication"],
    responsibilities: ["Define product roadmap", "Work with engineering and design", "Analyze market trends", "Drive product launches"],
    skills: ["Product Strategy", "Roadmapping", "Agile", "Analytics", "Stakeholder Management"],
    postedAt: "2024-01-09T09:00:00Z",
    expiresAt: "2024-02-09T09:00:00Z",
    status: "active",
    applicantsCount: 72,
    viewsCount: 1340,
    isFeatured: true,
    isRemote: false,
    category: "Product",
  },
  {
    title: "React Native Developer",
    location: "Remote",
    type: "remote",
    level: "mid",
    salary: { min: 1200000, max: 2200000, currency: "INR", period: "yearly" },
    description: "Meesho is building the next generation of social commerce in India. We need React Native developers to craft beautiful, performant mobile experiences for Tier 2/3 India.",
    requirements: ["3+ years React Native experience", "iOS/Android deployment knowledge", "State management expertise", "Performance optimization skills"],
    responsibilities: ["Build cross-platform mobile features", "Optimize app performance", "Write unit and integration tests", "Collaborate with backend teams"],
    skills: ["React Native", "TypeScript", "Redux", "Firebase", "REST APIs"],
    postedAt: "2024-01-08T08:00:00Z",
    expiresAt: "2024-02-08T08:00:00Z",
    status: "active",
    applicantsCount: 91,
    viewsCount: 1780,
    isFeatured: false,
    isRemote: true,
    category: "Technology",
  },
  {
    title: "Marketing Manager — Growth",
    location: "Mumbai, India",
    type: "full-time",
    level: "mid",
    salary: { min: 1000000, max: 1800000, currency: "INR", period: "yearly" },
    description: "Drive Zepto's user acquisition and retention strategies across digital channels. Own the full funnel from awareness to conversion.",
    requirements: ["4+ years growth marketing", "Digital marketing expertise", "Data-driven mindset", "Experience in D2C or quick commerce"],
    responsibilities: ["Plan and execute growth campaigns", "Manage paid media budgets", "Analyze funnel metrics", "A/B test creatives"],
    skills: ["Growth Marketing", "Google Ads", "Meta Ads", "Analytics", "SEO"],
    postedAt: "2024-01-07T10:00:00Z",
    expiresAt: "2024-02-07T10:00:00Z",
    status: "active",
    applicantsCount: 47,
    viewsCount: 890,
    isFeatured: false,
    isRemote: false,
    category: "Marketing",
  },
  {
    title: "Machine Learning Engineer",
    location: "Bengaluru, India",
    type: "full-time",
    level: "senior",
    salary: { min: 3500000, max: 6000000, currency: "INR", period: "yearly" },
    description: "Join Google DeepMind's India team to build cutting-edge ML systems that power products used by billions. You'll work on NLP, CV, and reinforcement learning problems at scale.",
    requirements: ["5+ years ML engineering", "Strong Python & ML frameworks", "Research publications preferred", "Distributed training experience"],
    responsibilities: ["Design and train large-scale models", "Deploy ML pipelines to production", "Collaborate with research scientists", "Optimize inference latency"],
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Distributed Computing"],
    postedAt: "2024-01-06T09:00:00Z",
    expiresAt: "2024-02-06T09:00:00Z",
    status: "active",
    applicantsCount: 203,
    viewsCount: 4200,
    isFeatured: true,
    isRemote: false,
    category: "Data Science",
  },
  {
    title: "Backend Engineer — Python",
    location: "Bengaluru, India",
    type: "full-time",
    level: "entry",
    salary: { min: 800000, max: 1400000, currency: "INR", period: "yearly" },
    description: "Entry-level position for ambitious backend engineers who want to work on India's most critical payment infrastructure at Razorpay.",
    requirements: ["1-2 years Python experience", "Basic understanding of REST APIs", "SQL knowledge", "Problem-solving mindset"],
    responsibilities: ["Develop backend features", "Write unit tests", "Debug production issues", "Learn from senior engineers"],
    skills: ["Python", "Django", "PostgreSQL", "REST APIs", "Git"],
    postedAt: "2024-01-05T08:00:00Z",
    expiresAt: "2024-02-05T08:00:00Z",
    status: "active",
    applicantsCount: 312,
    viewsCount: 5600,
    isFeatured: false,
    isRemote: false,
    category: "Technology",
  },
  {
    title: "Content Strategist",
    location: "Remote",
    type: "remote",
    level: "mid",
    salary: { min: 900000, max: 1500000, currency: "INR", period: "yearly" },
    description: "CRED is looking for a content strategist to craft compelling narratives for India's most premium credit card community.",
    requirements: ["3+ years content experience", "Strong writing portfolio", "SEO knowledge", "Experience in fintech preferred"],
    responsibilities: ["Develop content strategy", "Write long-form content", "Manage content calendar", "Collaborate with design"],
    skills: ["Content Strategy", "SEO", "Copywriting", "Brand Voice", "Analytics"],
    postedAt: "2024-01-04T10:00:00Z",
    expiresAt: "2024-02-04T10:00:00Z",
    status: "active",
    applicantsCount: 58,
    viewsCount: 980,
    isFeatured: false,
    isRemote: true,
    category: "Content & Writing",
  },
];

const MOCK_USERS = [
  {
    name: "Aryan Sharma",
    email: "aryan.sharma@email.com",
    password: "password123",
    role: "candidate",
    headline: "Senior Frontend Engineer | React • TypeScript • Next.js",
    location: "Bengaluru, India",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL", "Tailwind CSS"],
    experience: 5,
    resumeUrl: "/resume-aryan.pdf",
    profileCompletion: 82,
  },
  {
    name: "Sneha Patel",
    email: "sneha.patel@email.com",
    password: "password123",
    role: "candidate",
    headline: "Full Stack Developer | MERN Stack",
    location: "Mumbai, India",
    skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
    experience: 3,
    resumeUrl: "/resume-sneha.pdf",
    profileCompletion: 75,
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    password: "password123",
    role: "candidate",
    headline: "Backend Engineer | Python • Django",
    location: "Hyderabad, India",
    skills: ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
    experience: 4,
    resumeUrl: "/resume-vikram.pdf",
    profileCompletion: 68,
  },
  {
    name: "Priya Nair",
    email: "priya.nair@google.com",
    password: "password123",
    role: "recruiter",
    company: "Google",
    designation: "Senior Technical Recruiter",
  },
  {
    name: "Rahul Kumar",
    email: "rahul.kumar@razorpay.com",
    password: "password123",
    role: "recruiter",
    company: "Razorpay",
    designation: "Tech Recruiter",
  },
];

const MOCK_APPLICATIONS = [
  {
    status: "interview",
    coverLetter: "I'm excited to apply for the Full Stack Developer position at Razorpay...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    status: "screening",
    coverLetter: "As a data enthusiast with 5 years of experience...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    status: "applied",
    coverLetter: "I would love to work on ML systems at Google...",
    resumeUrl: "/resume-aryan.pdf",
  },
  {
    status: "offer",
    coverLetter: "I am very interested in the Senior Frontend Engineer position...",
    resumeUrl: "/resume-sneha.pdf",
  },
  {
    status: "rejected",
    coverLetter: "I believe my skills align well with this role...",
    resumeUrl: "/resume-vikram.pdf",
  },
  {
    status: "screening",
    coverLetter: "I am excited about the DevOps Engineer opportunity...",
    resumeUrl: "/resume-sneha.pdf",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    type: "application_update",
    title: "Interview Scheduled!",
    message: "Razorpay wants to schedule a technical interview with you for Full Stack Developer role.",
    read: false,
    actionUrl: "/applications/a1",
  },
  {
    type: "profile_view",
    title: "Google viewed your profile",
    message: "A recruiter from Google viewed your profile 2 hours ago.",
    read: false,
  },
  {
    type: "job_alert",
    title: "New jobs matching your profile",
    message: "5 new Senior Frontend Engineer positions were posted today in Bengaluru.",
    read: false,
    actionUrl: "/jobs",
  },
  {
    type: "new_message",
    title: "New message from Priya Nair",
    message: "Hi Aryan, I'd love to discuss the Senior Frontend Engineer role at Google...",
    read: true,
    actionUrl: "/messages",
  },
  {
    type: "application_update",
    title: "Application Update — Swiggy",
    message: "Your application for Data Scientist is under screening review.",
    read: true,
    actionUrl: "/applications/a2",
  },
];

const MOCK_MESSAGES = [
  {
    content: "Hi Aryan! I came across your profile and think you'd be a great fit for our Senior Frontend Engineer role at Google.",
    read: true,
  },
  {
    content: "Hi Priya! Thank you for reaching out. I'm definitely interested in learning more about the role.",
    read: true,
  },
  {
    content: "Great! The role is within our Ads Infrastructure team. You'd be working on large-scale React applications serving billions of users.",
    read: true,
  },
  {
    content: "That sounds incredibly exciting! Could you share more about the team structure and the tech stack you're working with?",
    read: true,
  },
  {
    content: "Of course! The team uses React, TypeScript, GraphQL, and internal tooling. Team size is around 12 engineers. Would you be open to a 30-min intro call this week?",
    read: false,
  },
];

// Default password for all mock users
const DEFAULT_PASSWORD = "password123";

async function seedDatabase(clearExisting: boolean = false) {
  try {
    await connectDB();

    if (clearExisting) {
      logger.info("Clearing existing data...");
      await User.deleteMany({});
      await Company.deleteMany({});
      await Job.deleteMany({});
      await Application.deleteMany({});
      await Notification.deleteMany({});
      await Message.deleteMany({});
      await Conversation.deleteMany({});
      logger.info("✅ Existing data cleared");
    }

    logger.info("Starting database seeding...");

    // 1. Create users
    logger.info("Creating users...");
    const users: any[] = [];
    const candidates: any[] = [];
    const recruiters: any[] = [];
    for (const userData of MOCK_USERS) {
      let user;
      if (userData.role === "candidate") {
        user = await Candidate.create({
          name: userData.name,
          email: userData.email,
          password: DEFAULT_PASSWORD,
          role: "candidate",
          headline: userData.headline,
          location: userData.location,
          skills: userData.skills,
          experience: userData.experience,
          resumeUrl: userData.resumeUrl,
          profileCompletion: userData.profileCompletion,
        });
        candidates.push(user);
      } else if (userData.role === "recruiter") {
        user = await Recruiter.create({
          name: userData.name,
          email: userData.email,
          password: DEFAULT_PASSWORD,
          role: "recruiter",
          company: userData.company,
          designation: userData.designation,
        });
        recruiters.push(user);
      }
      users.push(user);
    }
    logger.info(`✅ Created ${users.length} users (${candidates.length} candidates, ${recruiters.length} recruiters)`);

    // 2. Create companies (need a user as owner)
    logger.info("Creating companies...");
    const companies = await Company.insertMany(
      MOCK_COMPANIES.map((company) => ({
        ...company,
        owner: users[1]._id, // Use first recruiter as owner
      }))
    );
    logger.info(`✅ Created ${companies.length} companies`);

    // 3. Update recruiters with companyId
    logger.info("Updating recruiters with company IDs...");
    for (let i = 0; i < recruiters.length; i++) {
      const companyIndex = i % companies.length;
      await Recruiter.findByIdAndUpdate(recruiters[i]._id, {
        companyId: companies[companyIndex]._id,
      });
    }
    logger.info("✅ Updated recruiters with company IDs");

    // 4. Create jobs
    logger.info("Creating jobs...");
    const jobs = await Job.insertMany(
      MOCK_JOBS.map((job, index) => ({
        ...job,
        company: companies[index % companies.length]._id,
        recruiter: recruiters[0]._id, // Use first recruiter
      }))
    );
    logger.info(`✅ Created ${jobs.length} jobs`);

    // 5. Update recruiters with posted jobs
    logger.info("Updating recruiters with posted jobs...");
    await Recruiter.findByIdAndUpdate(recruiters[0]._id, {
      postedJobs: jobs.map((job) => job._id),
    });
    logger.info("✅ Updated recruiters with posted jobs");

    // 6. Create applications
    logger.info("Creating applications...");
    const applications = await Application.insertMany(
      MOCK_APPLICATIONS.map((app, index) => ({
        ...app,
        jobId: jobs[index % jobs.length]._id,
        candidateId: candidates[index % candidates.length]._id,
      }))
    );
    logger.info(`✅ Created ${applications.length} applications`);

    // 7. Update candidates with applied jobs
    logger.info("Updating candidates with applied jobs...");
    for (const candidate of candidates) {
      const candidateApplications = applications.filter(
        (app) => app.candidateId.toString() === candidate._id.toString()
      );
      await Candidate.findByIdAndUpdate(candidate._id, {
        appliedJobs: candidateApplications.map((app) => app.jobId),
      });
    }
    logger.info("✅ Updated candidates with applied jobs");

    // 8. Create notifications
    logger.info("Creating notifications...");
    await Notification.insertMany(
      MOCK_NOTIFICATIONS.map((notif) => ({
        ...notif,
        userId: candidates[0]._id, // Use first candidate
      }))
    );
    logger.info(`✅ Created ${MOCK_NOTIFICATIONS.length} notifications`);

    // 9. Create conversation
    logger.info("Creating conversation...");
    const conversation = await Conversation.create({
      participants: [candidates[0]._id, recruiters[0]._id],
      unreadCount: 0,
    });
    logger.info("✅ Created conversation");

    // 10. Create messages
    logger.info("Creating messages...");
    await Message.insertMany(
      MOCK_MESSAGES.map((msg, index) => ({
        ...msg,
        senderId: index % 2 === 0 ? recruiters[0]._id : candidates[0]._id,
        receiverId: index % 2 === 0 ? candidates[0]._id : recruiters[0]._id,
        conversationId: conversation._id,
      }))
    );
    logger.info(`✅ Created ${MOCK_MESSAGES.length} messages`);

    logger.info("🎉 Database seeding completed successfully!");
    logger.info("\n📝 Mock User Credentials:");
    logger.info("================================");
    users.forEach((user) => {
      logger.info(`${user.role.toUpperCase()}: ${user.email} / ${DEFAULT_PASSWORD}`);
    });

    process.exit(0);
  } catch (error) {
    logger.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeder
const clearExisting = process.argv.includes("--clear");
seedDatabase(clearExisting);
