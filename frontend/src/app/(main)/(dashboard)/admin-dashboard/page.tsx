"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { adminService } from "@/features/admin/admin.service";
import type { DashboardStats, ImportResult } from "@/features/admin/admin.types";
import { Upload, Trash2, BarChart3, Users, Briefcase, Building2, FileText } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadStats();
    };

    fetchData();
  }, []);



  const handleImport = async () => {
    if (!jsonInput.trim()) return;

    try {
      setImporting(true);
      const data = JSON.parse(jsonInput);
      const result = await adminService.importMockData(data);
      setImportResult(result);
      setJsonInput("");
      await loadStats();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import data. Please check the JSON format.");
    } finally {
      setImporting(false);
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      await adminService.clearMockData();
      setClearModalOpen(false);
      await loadStats();
      alert("All data cleared successfully");
    } catch (error) {
      console.error("Clear failed:", error);
      alert("Failed to clear data");
    } finally {
      setClearing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonInput(content);
      };
      reader.readAsText(file);
    }
  };

  // const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
  //   <Card className="p-6">
  //     <div className="flex items-start justify-between">
  //       <div>
  //         <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
  //         <p className="text-3xl font-bold text-gray-900">{value}</p>
  //       </div>
  //       <div className={`p-3 rounded-lg ${color}`}>
  //         <Icon className="w-6 h-6 text-white" />
  //       </div>
  //     </div>
  //   </Card>
  // );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your platform data and settings</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
          <StatCard title="Total Jobs" value={stats.totalJobs} icon={Briefcase} color="bg-green-500" />
          <StatCard title="Total Companies" value={stats.totalCompanies} icon={Building2} color="bg-teal-500" />
          <StatCard title="Applications" value={stats.totalApplications} icon={FileText} color="bg-orange-500" />
          <StatCard title="Active Jobs" value={stats.activeJobs} icon={BarChart3} color="bg-indigo-500" />
          <StatCard title="Verified Companies" value={stats.verifiedCompanies} icon={Building2} color="bg-pink-500" />
        </div>
      )}

      {/* Mock Data Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mock Data Management</h2>
        <p className="text-gray-600 mb-6">
          Import mock data from JSON to quickly populate your database with sample data for testing and development.
        </p>

        <div className="flex gap-4">
          <Button
            variant="primary"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setImportModalOpen(true)}
          >
            Import Mock Data
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setClearModalOpen(true)}
          >
            Clear All Data
          </Button>
        </div>

        {importResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Import Successful!</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-700">
              <div>Companies: {importResult.companies}</div>
              <div>Jobs: {importResult.jobs}</div>
              <div>Users: {importResult.users}</div>
              <div>Applications: {importResult.applications}</div>
              <div>Notifications: {importResult.notifications}</div>
              <div>Messages: {importResult.messages}</div>
            </div>
          </div>
        )}
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Mock Data"
        description="Paste your JSON data below or upload a JSON file to import mock data into the database."
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Paste JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"companies": [...], "jobs": [...], "users": [...]}'
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={importing}
              disabled={!jsonInput.trim()}
            >
              Import Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear All Data"
        description="Are you sure you want to delete all data from the database? This action cannot be undone."
        size="sm"
      >
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => setClearModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClear}
            loading={clearing}
          >
            Clear All Data
          </Button>
        </div>
      </Modal>
    </div>
  );
}
