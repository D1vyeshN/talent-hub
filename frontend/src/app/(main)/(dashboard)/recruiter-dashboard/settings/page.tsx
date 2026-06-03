"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Lock, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Priya Nair",
    email: "priya.nair@google.com",
    designation: "Senior Technical Recruiter",
    company: "Google",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 max-w-lg">
          <Input
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <Input
            label="Designation"
            value={profile.designation}
            onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
          />
          <Input
            label="Company"
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
          />
          <div className="pt-2">
            <Button variant="primary" onClick={handleSave}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <div className="space-y-4 max-w-lg">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />
          <Button variant="outline">Update Password</Button>
        </div>
      </Card>

      {/* Notifications Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <div className="space-y-3 max-w-lg">
          {[
            { label: "New application received", desc: "Email when someone applies" },
            { label: "Status change notifications", desc: "Candidate accepted or rejected" },
            { label: "Weekly summary", desc: "Aggregated stats every Monday" },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                <p className="text-xs text-gray-500">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}