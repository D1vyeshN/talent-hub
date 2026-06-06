"use client"
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle, Globe, MapPin, Star, Users, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { MOCK_JOBS } from "@/lib/mockData";
import { formatSalaryRange, timeAgo } from "@/lib/utils";
import { redirect } from "next/navigation";
import { companyService } from "@/features/company/services/company.service";
import { getCompanyAvatarColor, getCompanyAvatarInitial } from "@/lib/companyAvatar";
import type { Company } from "@/types";

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) {
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setError(null);
      timerRef.current = undefined;
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = undefined;
    };
  }, [error]);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const data = await companyService.getById(companyId);
        setCompany(data);
      } catch (err: any) {
        setError(err.message || "Failed to load company");
        // Fallback to mock data for demo
        const { MOCK_COMPANIES } = await import("@/lib/mockData");
        setCompany(MOCK_COMPANIES[0]);
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const companyJobs = MOCK_JOBS.filter((j) => j.company._id === company?._id);

  const REVIEWS = [
    { author: "Software Engineer", rating: 5, title: "Incredible culture and growth", text: "Amazing place to work. The engineering culture is top notch, with emphasis on mentorship and innovation.", date: "Jan 2024" },
    { author: "Product Manager", rating: 4, title: "Great work-life balance", text: "Flexible hours, excellent benefits. The only downside is occasional bureaucracy at scale.", date: "Dec 2023" },
    { author: "Data Scientist", rating: 5, title: "Best team I've worked with", text: "World-class infrastructure and incredibly talented colleagues. The ML resources are unmatched.", date: "Nov 2023" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-600">Company not found</h3>
            <p className="text-sm text-gray-400 mt-1">The company you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 text-sm text-amber-600 border border-amber-200">
            ⚠️ Using fallback data. Backend endpoint may not be available.
          </div>
        )}
        {/* Back */}
        <button
          onClick={() => redirect("companies")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </button>

        {/* Company Hero */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-36 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800" />

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${getCompanyAvatarColor(company.name)} flex items-center justify-center`}>
                    <span className="text-3xl font-bold text-white">
                      {getCompanyAvatarInitial(company.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pb-2">
                <Button
                  variant={following ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setFollowing(!following)}
                >
                  {following ? "✓ Following" : "+ Follow"}
                </Button>
                <Button variant="primary" size="sm" onClick={() => redirect("jobs")}>
                  View All Jobs
                </Button>
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                  {company.verified && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-500 mt-1">{company.industry}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{company.location}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{company.size} employees</span>
                  <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /><a href={company.website} className="text-blue-600 hover:underline">Website</a></span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Founded {company.foundedYear}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xl font-bold text-gray-900">{company.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({company.reviewsCount?.toLocaleString()} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <p className="text-sm text-gray-600 leading-relaxed">
                {company.description} Google's mission is to organize the world's information and make it universally accessible and useful. Since our founding in 1998, Google has grown by leaps and bounds. From offering search in a single language we now offer dozens of products and services—including various forms of advertising and web applications for all kinds of tasks—in scores of languages. And starting from two computer science students in a university dorm room, we now have thousands of employees and offices around the world. A lot has changed since the first Google search engine appeared. But some things haven't changed: our dedication to our users and our belief in the possibilities of the Internet itself.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                {[
                  { label: "Employees", value: "180,000+" },
                  { label: "Open Roles", value: company.activeJobs?.toString() || "0" },
                  { label: "Founded", value: company.foundedYear?.toString() || "—" },
                  { label: "Rating", value: `${company.rating}/5` },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Open Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Open Positions ({companyJobs.length})</CardTitle>
                <button className="text-xs text-blue-600" onClick={() => redirect("jobs")}>View all →</button>
              </CardHeader>
              <div className="space-y-3">
                {companyJobs.map((job) => (
                  <div
                    key={job.id}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all"
                    onClick={() => redirect("job-detail")}
                  >
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{job.title}</h3>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span>{job.type.replace("-", " ")}</span>
                        <span>{job.level} level</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatSalaryRange(job.salary.min, job.salary.max)}</p>
                      <p className="text-xs text-gray-400">{timeAgo(job.postedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Reviews</CardTitle>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold">{company.rating} / 5</span>
                </div>
              </CardHeader>
              <div className="space-y-5">
                {REVIEWS.map((review) => (
                  <div key={review.title} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{review.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{review.author}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Company Overview</CardTitle></CardHeader>
              <div className="space-y-3">
                {[
                  { icon: Building2, label: "Industry", value: company.industry },
                  { icon: Users, label: "Company Size", value: `${company.size} employees` },
                  { icon: MapPin, label: "Headquarters", value: company.location },
                  { icon: Globe, label: "Website", value: company.website || "—" },
                  { icon: Briefcase, label: "Open Roles", value: `${company.activeJobs} positions` },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Benefits & Perks</h3>
              <div className="flex flex-wrap gap-2">
                {["🏥 Health Insurance", "💻 Remote Work", "📚 L&D Budget", "🍕 Free Meals", "✈️ Travel Allowance", "💰 ESOPs", "🧘 Wellness", "🎓 Paid Leaves"].map((b) => (
                  <span key={b} className="text-xs bg-white text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-medium">
                    {b}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
