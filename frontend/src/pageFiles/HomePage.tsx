"use client";
import { useState } from "react";
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  ChevronRight,
  Globe,
  MapPin,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MOCK_JOBS, MOCK_COMPANIES } from "@/lib/mockData";
import { formatSalaryRange, timeAgo } from "@/lib/utils";
import { JOB_CATEGORIES } from "@/constants";
import { redirect } from "next/navigation";

const STATS = [
  {
    label: "Active Jobs",
    value: "50,000+",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Companies Hiring",
    value: "8,000+",
    icon: Building2,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Candidates Placed",
    value: "200,000+",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Cities Covered",
    value: "150+",
    icon: Globe,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered Matching",
    description:
      "Our ML algorithms match you with jobs that fit your skills, experience, and career goals.",
  },
  {
    icon: Shield,
    title: "Verified Companies",
    description:
      "Every company on TalentHub is verified and background-checked for authenticity.",
  },
  {
    icon: BarChart2,
    title: "Salary Insights",
    description: "Get data-driven salary benchmarks to negotiate confidently.",
  },
  {
    icon: BookOpen,
    title: "Career Resources",
    description:
      "Access interview guides, resume templates, and career coaching.",
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul Mehta",
    role: "Software Engineer at Google",
    avatar: "RM",
    rating: 5,
    text: "TalentHub connected me with Google in just 2 weeks. The AI matching was incredibly accurate — every job recommendation was relevant to my skills.",
  },
  {
    name: "Anita Krishnan",
    role: "Product Manager at Razorpay",
    avatar: "AK",
    rating: 5,
    text: "The platform is beautifully designed and actually understands what I was looking for. Landed my dream PM role at a top fintech startup.",
  },
  {
    name: "Vikram Singh",
    role: "Data Scientist at Swiggy",
    avatar: "VS",
    rating: 5,
    text: "From profile creation to offer letter — the entire journey was smooth. I especially loved the salary insights feature.",
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const featuredJobs = MOCK_JOBS.filter((j) => j.isFeatured).slice(0, 4);
  const topCompanies = MOCK_COMPANIES.slice(0, 6);

  const handleSearch = () => {
    redirect("jobs");
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-blue-50 via-white to-white pt-16 pb-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="info" className="mb-6 text-sm px-4 py-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            50,000+ new jobs added this week
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Dream Job
            </span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl">
              With TalentHub
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with top companies, get AI-powered job matches, and take
            your career to the next level. Join 2M+ professionals already
            thriving on TalentHub.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Job title, skills, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="City, state, or remote..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSearch}
              className="sm:w-auto w-full"
            >
              Search Jobs
            </Button>
          </div>

          {/* Quick Tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Popular:</span>
            {[
              "React Developer",
              "Product Manager",
              "Data Scientist",
              "UI Designer",
              "DevOps",
              "Remote",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => redirect("jobs")}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────── */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex p-3 rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Jobs
              </h2>
              <p className="text-gray-500">
                Handpicked opportunities from top companies
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => redirect("jobs")}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => redirect("job-detail")}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                {/* Featured Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="info" className="text-xs">
                    ⭐ Featured
                  </Badge>
                </div>

                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {job.company.logo}
                  </div>

                  <div className="flex-1 pr-16">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 font-medium">
                        {job.company.name}
                      </span>
                      {job.company.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="default" size="sm">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </Badge>
                  <Badge variant="info" size="sm">
                    {job.type.replace("-", " ")}
                  </Badge>
                  <Badge variant="success" size="sm">
                    {job.level}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatSalaryRange(job.salary.min, job.salary.max)}
                      <span className="text-xs text-gray-500 font-normal ml-1">
                        / yr
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {timeAgo(job.postedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      redirect("job-detail");
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job Categories ────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-500">Explore jobs across top industries</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {JOB_CATEGORIES.slice(0, 10).map((cat, i) => {
              const emojis = [
                "💻",
                "🎨",
                "📣",
                "💰",
                "🏥",
                "📚",
                "💼",
                "⚙️",
                "🔧",
                "👥",
              ];
              
              return (
                <button
                  key={cat}
                  onClick={() => redirect("jobs")}
                  className="group bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="text-3xl mb-3">{emojis[i]}</div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                    {cat}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {Math.floor(Math.random() * 500 + 50)} jobs
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Top Companies ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Top Hiring Companies
              </h2>
              <p className="text-gray-500">
                Explore opportunities at world-class organizations
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => redirect("companies")}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              All Companies
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topCompanies.map((company) => (
              <button
                key={company.id}
                onClick={() => redirect(`companies/${company.id}`)}
                className="group bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-3xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {company.logo}
                </div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">
                  {company.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {company.activeJobs} open roles
                </p>
                <div className="flex items-center justify-center gap-1 mt-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-500">
                    {company.rating}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">
              Why TalentHub?
            </h2>
            <p className="text-blue-200 text-lg max-w-xl mx-auto">
              Built for India's top talent and forward-thinking companies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-blue-200 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Success Stories
            </h2>
            <p className="text-gray-500">
              Join thousands who found their dream jobs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.name}
                variant="default"
                className="hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to take the next step?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join over 2 million professionals who trust TalentHub to advance
                their careers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => redirect("register")}
                  icon={<ChevronRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => redirect("jobs")}
                  className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white"
                >
                  Browse Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-lg">TalentHub</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                India's premier job portal connecting talent with opportunity.
              </p>
            </div>
            {[
              {
                title: "For Job Seekers",
                links: [
                  "Search Jobs",
                  "Career Advice",
                  "Resume Tips",
                  "Salary Calculator",
                ],
              },
              {
                title: "For Employers",
                links: [
                  "Post a Job",
                  "Browse Resumes",
                  "Recruitment Solutions",
                  "Pricing",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Blog", "Press", "Careers at TalentHub"],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold text-sm mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2024 TalentHub. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {link}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
