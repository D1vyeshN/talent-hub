"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { MOCK_CANDIDATE, MOCK_JOBS } from "@/lib/mockData";
import { Search, Star, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_CANDIDATES = [
  MOCK_CANDIDATE,
  {
    id: "c2",
    name: "Rahul Verma",
    experience: 4,
    skills: ["Python", "Django", "AWS", "Docker"],
    headline: "Full Stack Developer | Django • React",
    location: "Pune, India",
  },
  {
    id: "c3",
    name: "Priya Singh",
    experience: 7,
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    headline: "Senior Frontend Engineer | React • TypeScript",
    location: "Hyderabad, India",
  },
];

export default function CandidatesPage() {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = MOCK_CANDIDATES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and browse talent · {MOCK_CANDIDATES.length} profiles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Candidates</CardTitle>
        </CardHeader>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card key={c.id} padding="md" hoverable className="border-gray-100">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} size="md" />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{c.headline}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {c.location} · {c.experience} yrs
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-700 rounded border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="xs" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Resume
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => toggleSave(c.id)}
                      icon={
                        <Star
                          className={cn("w-3.5 h-3.5", saved.has(c.id) && "fill-amber-400 text-amber-500")}
                        />
                      }
                    >
                      {saved.has(c.id) ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}