"use client";

import { MOCK_COMPANIES } from "@/lib/mockData";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_RECRUITER } from "@/lib/mockData";
import { Building2, Globe, MapPin, Users, Calendar, CheckCircle } from "lucide-react";


export default function CompanyPage() {
  const recruiter = MOCK_RECRUITER;
  const company = MOCK_COMPANIES.find((c) => c.id === recruiter.companyId) || MOCK_COMPANIES[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your company&apos;s public profile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <div className="space-y-6">
          {/* Logo and Name */}
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {company.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                {company.verified && (
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{company.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  {company.industry}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {company.size} employees
                </span>
                {company.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </span>
                )}
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Founded {company.foundedYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{company.activeJobs ?? 0}</p>
              <p className="text-xs text-gray-500">Active Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{company.rating ?? "N/A"}</p>
              <p className="text-xs text-gray-500">Company Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{company.reviewsCount ?? 0}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button variant="primary">Edit Company Profile</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}