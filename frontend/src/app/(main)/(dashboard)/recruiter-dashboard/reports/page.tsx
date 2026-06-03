"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { MOCK_APPLICATIONS, MOCK_JOBS } from "@/lib/mockData";
import { Application } from "@/types";
import { Download, FileSpreadsheet, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function exportCSV(data: Application[], filename: string) {
  if (!data.length) return;

  const headers = [
    "Candidate",
    "Email",
    "Job Title",
    "Applied Date",
    "Status",
    "Cover Letter",
  ];

  const rows = data.map((a) => {
    const candidateName = a.candidate?.name ?? "Unknown";
    const candidateEmail = (a.candidate as any)?.email ?? "N/A";
    return [
      candidateName,
      candidateEmail,
      a.job.title,
      new Date(a.appliedAt).toLocaleDateString(),
      a.status,
      a.coverLetter?.replace(/\n/g, " ") ?? "",
    ];
  });

  const csv = [headers.join(","), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [selectedJob, setSelectedJob] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const applications = MOCK_APPLICATIONS;
  const filtered =
    selectedJob === "all"
      ? applications
      : applications.filter((a) => a.jobId === selectedJob);

  const handleExport = () => {
    setDownloading(true);
    setDone(false);
    setTimeout(() => {
      exportCSV(filtered, `applications-${selectedJob === "all" ? "all" : selectedJob}-${new Date().toISOString().slice(0, 10)}.csv`);
      setDownloading(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-sm text-gray-500 mt-1">
          Export applications and candidate data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Applications</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Filter by Job
              </label>
              <Select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                options={[
                  { value: "all", label: "All Jobs" },
                  ...MOCK_JOBS.map((j) => ({
                    value: j.id,
                    label: j.title,
                  })),
                ]}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Date Range
              </label>
              <Input type="date" value={new Date().toISOString().slice(0, 10)} readOnly />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filtered.length}</span> application
              {filtered.length !== 1 ? "s" : ""} will be exported
            </div>
            <Button
              variant="primary"
              icon={
                downloading
                  ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : done
                    ? <CheckCircle className="w-4 h-4" />
                    : <Download className="w-4 h-4" />
              }
              onClick={handleExport}
              disabled={downloading || filtered.length === 0}
            >
              {downloading ? "Exporting..." : done ? "Downloaded!" : "Export CSV"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Preview ({filtered.length} rows)
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Position</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 10).map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {a.candidate?.name ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{a.job.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info" size="sm">{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(a.appliedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length > 10 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-center text-xs text-gray-400">
                    ...and {filtered.length - 10} more rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}