"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Star, ExternalLink, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllCandidates } from "@/features/candidate/services/candidate.service";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        const response = await getAllCandidates();
        setCandidates(response.data);
      } catch (err) {
        setError("Failed to load candidates");
        console.error("Failed to fetch candidates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const toggleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = candidates.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search and browse talent · {candidates.length} profiles
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

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading candidates...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No candidates found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <Card key={c._id} padding="md" hoverable className="border-gray-100">
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
                      {c.skills?.map((s: string) => (
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
                        onClick={() => toggleSave(c._id)}
                        icon={
                          <Star
                            className={cn("w-3.5 h-3.5", saved.has(c._id) && "fill-amber-400 text-amber-500")}
                          />
                        }
                      >
                        {saved.has(c._id) ? "Saved" : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}