"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchApplicationById } from "@/features/applications/store/applicationSlice";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { APPLICATION_STATUS_CONFIG } from "@/constants";
import { Calendar, FileText, User, Building2, Mail, MapPin, Briefcase } from "lucide-react";

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  userRole: "candidate" | "recruiter";
}

export default function ApplicationDetailsModal({
  isOpen,
  onClose,
  applicationId,
  userRole,
}: ApplicationDetailsModalProps) {
  const dispatch = useAppDispatch();
  const { selectedApplication, isLoading } = useAppSelector((s) => s.application);

  useEffect(() => {
    if (isOpen && applicationId) {
      dispatch(fetchApplicationById(applicationId));
    }
  }, [isOpen, applicationId, dispatch]);

  const application = selectedApplication;
  const candidate = application?.candidate;
  const job = application?.job;

  if (!application) {
    return null;
  }

  const config = APPLICATION_STATUS_CONFIG[application.status as keyof typeof APPLICATION_STATUS_CONFIG] || APPLICATION_STATUS_CONFIG.applied;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Details" size="lg">
      {isLoading ? (
        <div className="p-6 text-center text-gray-500">Loading application details...</div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`px-4 py-3 rounded-lg flex items-center justify-between ${config.bg} ${config.color}`}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">{config.label}</span>
              <span className="text-sm opacity-75">
                Applied on {new Date(application.appliedAt).toLocaleDateString()}
              </span>
            </div>
            {userRole === "recruiter" && application.status === "applied" && (
              <div className="flex gap-2">
                <Button variant="outline" size="xs" className="text-green-600 border-green-200">
                  Move to Interview
                </Button>
                <Button variant="outline" size="xs" className="text-red-500 border-red-200">
                  Reject
                </Button>
              </div>
            )}
          </div>

          {/* Candidate Information (for recruiters) */}
          {userRole === "recruiter" && candidate && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" />
                Candidate Information
              </h3>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar src={(candidate as any).avatar} name={candidate.name} size="lg" />
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">{candidate.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{candidate.headline || "No headline"}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {candidate.email || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {candidate.location || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {candidate.experience || 0} years experience
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job Information */}
          {job && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Job Information
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.company?.name || "Unknown Company"}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {job.type}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Cover Letter
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Resume */}
          {application.resumeUrl && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(application.resumeUrl, "_blank")}
              >
                View Resume
              </Button>
            </div>
          )}

          {/* Recruiter Notes (recruiter only) */}
          {userRole === "recruiter" && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">Notes</h3>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Add internal notes about this candidate..."
                defaultValue={application.notes || ""}
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm">
                  Save Notes
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="md" onClick={onClose}>
              Close
            </Button>
            {userRole === "candidate" && application.status === "applied" && (
              <Button variant="danger" size="md">
                Withdraw Application
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
