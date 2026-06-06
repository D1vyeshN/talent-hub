"use client"
import { useState, useEffect } from "react";
import { Building2, CheckCircle, MapPin, Search, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { companyService } from "@/features/company/services/company.service";
import type { Company } from "@/types";

const INDUSTRIES = ["All", "Technology", "Fintech", "Food Tech", "E-commerce", "Quick Commerce"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true);
        const response = await companyService.getAll();
        setCompanies(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load companies");
        // Fallback to mock data for demo
        const { MOCK_COMPANIES } = await import("@/lib/mockData");
        setCompanies(MOCK_COMPANIES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = industry === "All" || c.industry.toLowerCase().includes(industry.toLowerCase());
    return matchSearch && matchIndustry;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading companies...</p>
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
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Top Companies</h1>
          <p className="text-gray-500 text-lg">Discover great places to work across India</p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search companies by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Industry Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                industry === ind
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((company) => (
            <div
              key={company.id}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer"
              onClick={() => redirect(`companies/${company.id}`)}
            >
              {/* Logo & Verified */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
                  {company.logo}
                </div>
                {company.verified && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              {/* Name & Industry */}
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{company.industry}</p>

              {/* Meta */}
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {company.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {company.size} employees
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-gray-700">{company.rating}</span>
                  <span className="text-xs text-gray-400">({company.reviewsCount?.toLocaleString()} reviews)</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <Badge variant="success" size="sm">
                  <Building2 className="w-3 h-3" />
                  {company.activeJobs} open roles
                </Badge>
                <Button variant="ghost" size="xs" className="text-blue-600 hover:bg-blue-50">
                  View →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-600">No companies found</h3>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
