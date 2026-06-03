"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { MOCK_APPLICATIONS, MOCK_CANDIDATE } from "@/lib/mockData";
import { Calendar, Clock, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewRound = "HR Round" | "Technical Round" | "Manager Round" | "Final Round";
type InterviewStatus = "scheduled" | "completed" | "cancelled";

interface Interview {
  id: string;
  candidate: string;
  candidateId: string;
  job: string;
  round: InterviewRound;
  date: string;
  time: string;
  notes: string;
  status: InterviewStatus;
}

const INTERVIEW_ROUNDS: InterviewRound[] = [
  "HR Round",
  "Technical Round",
  "Manager Round",
  "Final Round",
];

const initialInterviews: Interview[] = [
  {
    id: "iv1",
    candidate: MOCK_CANDIDATE.name,
    candidateId: MOCK_CANDIDATE.id,
    job: MOCK_APPLICATIONS[0].job.title,
    round: "Technical Round",
    date: "2024-01-16",
    time: "10:30 AM",
    notes: "Focus on React performance optimization",
    status: "scheduled",
  },
  {
    id: "iv2",
    candidate: "Rahul Verma",
    candidateId: "c3",
    job: MOCK_APPLICATIONS[1].job.title,
    round: "HR Round",
    date: "2024-01-17",
    time: "2:00 PM",
    notes: "Salary discussion",
    status: "scheduled",
  },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    candidate: "",
    job: "",
    round: "HR Round" as InterviewRound,
    date: "",
    time: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInterview: Interview = {
      id: `iv-${Date.now()}`,
      candidate: form.candidate || MOCK_CANDIDATE.name,
      candidateId: MOCK_CANDIDATE.id,
      job: form.job || MOCK_APPLICATIONS[0].job.title,
      round: form.round,
      date: form.date,
      time: form.time || "TBD",
      notes: form.notes,
      status: "scheduled",
    };
    setInterviews((prev) => [newInterview, ...prev]);
    setShowForm(false);
    setForm({ candidate: "", job: "", round: "HR Round", date: "", time: "", notes: "" });
  };

  const updateStatus = (id: string, status: InterviewStatus) => {
    setInterviews((prev) => prev.map((iv) => (iv.id === id ? { ...iv, status } : iv)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and track candidate interviews</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(!showForm)}>
          Schedule Interview
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Interview</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Candidate Name"
                value={form.candidate}
                onChange={(e) => setForm({ ...form, candidate: e.target.value })}
                placeholder="e.g. Aryan Sharma"
              />
              <Input
                label="Position"
                value={form.job}
                onChange={(e) => setForm({ ...form, job: e.target.value })}
                placeholder="e.g. Frontend Engineer"
              />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Interview Round</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.round}
                  onChange={(e) => setForm({ ...form, round: e.target.value as InterviewRound })}
                >
                  {INTERVIEW_ROUNDS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <Input
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add any preparation notes..."
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary">Schedule</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {interviews.map((iv) => (
          <Card key={iv.id} padding="md">
            <div className="flex items-start gap-4">
              <Avatar name={iv.candidate} size="md" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{iv.candidate}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {iv.job} · {iv.round}
                    </p>
                  </div>
                  <Badge variant={iv.status === "scheduled" ? "info" : iv.status === "completed" ? "success" : "error"} size="sm">
                    {iv.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {iv.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {iv.time}
                  </span>
                </div>
                {iv.notes && (
                  <div className="flex items-start gap-2 mt-3 p-2.5 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-600">{iv.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {iv.status === "scheduled" && (
                    <>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => updateStatus(iv.id, "completed")}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="text-red-500"
                        onClick={() => updateStatus(iv.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
