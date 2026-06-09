"use client"
import { useState } from "react";
import { Bell, Lock, Shield, User, CreditCard, Eye, Trash2, Upload, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { SUBSCRIPTION_PLANS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateProfile, addSkill, removeSkill, uploadAvatar } from "@/store/slices/candidateSlice";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { profile, error } = useAppSelector((s) => s.candidate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (updates: any) => {
    setSaving(true);
    setSaved(false);
    try {
      await dispatch(updateProfile(updates)).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await dispatch(uploadAvatar(file)).unwrap();
      alert("Avatar uploaded successfully!");
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload avatar";
      alert(errorMessage);
    }
  };

  const name = profile?.name || user?.name || "User";
  const email = profile?.email || user?.email || "user@example.com";

  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
      content: <ProfileTab profile={profile} onSave={handleSave} saving={saving} saved={saved} error={error} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      content: <NotificationsTab />,
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: <Shield className="w-4 h-4" />,
      content: <PrivacyTab />,
    },
    {
      id: "security",
      label: "Security",
      icon: <Lock className="w-4 h-4" />,
      content: <SecurityTab />,
    },
    {
      id: "subscription",
      label: "Subscription",
      icon: <CreditCard className="w-4 h-4" />,
      content: <SubscriptionTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar name={name} size="xl" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <button
                onClick={() => document.getElementById("avatar-upload")?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-500">{email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 font-medium capitalize">
                  {user?.role || "candidate"}
                </span>
                <span className="text-xs text-gray-400">Member since Jan 2024</span>
              </div>
            </div>
          </div>
        </Card>

        <Tabs tabs={tabs} defaultTab="profile" variant="underline" />
      </div>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────

function ProfileTab({ profile, onSave, saving, saved, error }: {
  profile: any;
  onSave: (updates: any) => void;
  saving: boolean;
  saved: boolean;
  error: string | null;
}) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    location: profile?.location || "",
    headline: profile?.headline || "",
    skills: profile?.skills?.join(", ") || "",
  });
  const [newSkill, setNewSkill] = useState("");

  const handleSubmit = () => {
    const updates = {
      name: formData.name,
      location: formData.location,
      headline: formData.headline,
      skills: formData.skills.split(",").map((s:string) => s.trim()).filter((s:string) => s),
    };
    onSave(updates);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await dispatch(addSkill(newSkill.trim())).unwrap();
      setNewSkill("");
    } catch (err) {
      console.error("Failed to add skill:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to add skill";
      alert(errorMessage);
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    try {
      await dispatch(removeSkill(skill)).unwrap();
    } catch (err) {
      console.error("Failed to remove skill:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to remove skill";
      alert(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" /> Changes saved!
          </span>
        )}
        {error && (
          <span className="flex items-center gap-1.5 text-sm text-red-600">
            {error}
          </span>
        )}
      </CardHeader>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input label="Email Address" type="email" value={profile?.email || ""} disabled />
          <Input label="Location" placeholder="City, Country" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Professional Headline</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile?.skills?.map((skill: string) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
            />
            <Button onClick={handleAddSkill} size="sm">Add</Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="md">Discard Changes</Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    emailJobAlerts: true, emailApplications: true, emailMessages: false,
    pushJobAlerts: true, pushApplications: true, pushMessages: true,
    weeklyDigest: true, profileViews: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const sections = [
    {
      title: "Email Notifications",
      settings: [
        { key: "emailJobAlerts" as const, label: "Job Alerts", desc: "Get notified about new jobs matching your profile" },
        { key: "emailApplications" as const, label: "Application Updates", desc: "Updates on your submitted applications" },
        { key: "emailMessages" as const, label: "New Messages", desc: "When a recruiter sends you a message" },
        { key: "weeklyDigest" as const, label: "Weekly Job Digest", desc: "A weekly summary of top matching jobs" },
      ],
    },
    {
      title: "Push Notifications",
      settings: [
        { key: "pushJobAlerts" as const, label: "Job Alerts", desc: "Real-time alerts for new matching jobs" },
        { key: "pushApplications" as const, label: "Application Updates", desc: "Real-time status updates" },
        { key: "pushMessages" as const, label: "Messages", desc: "Instant notification for new messages" },
        { key: "profileViews" as const, label: "Profile Views", desc: "When someone views your profile" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <Card key={section.title}>
          <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
          <div className="space-y-4">
            {section.settings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-gray-800">{setting.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
                </div>
                <div
                  onClick={() => toggle(setting.key)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                    prefs[setting.key] ? "bg-blue-600" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    prefs[setting.key] ? "translate-x-6" : "translate-x-1"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Privacy Tab ───────────────────────────────────────────────────────────────

function PrivacyTab() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Profile Visibility</CardTitle></CardHeader>
        <div className="space-y-4">
          {[
            { label: "Public profile", desc: "Anyone can find and view your profile", icon: Eye },
            { label: "Resume visible to recruiters", desc: "Recruiters with active subscriptions can view your resume", icon: Eye },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
              <select className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Everyone</option>
                <option>Recruiters Only</option>
                <option>Hidden</option>
              </select>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
        </CardHeader>
        <p className="text-sm text-red-600 mb-4">
          Deleting your account will permanently remove all your data and cannot be undone.
        </p>
        <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>
          Delete Account
        </Button>
      </Card>
    </div>
  );
}

// ── Security Tab ──────────────────────────────────────────────────────────────

function SecurityTab() {
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="Min. 8 characters" />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password" />
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Password Strength</p>
            <ProgressBar value={75} color="green" size="sm" />
            <p className="text-xs text-green-600 mt-1">Strong password</p>
          </div>
          <Button variant="primary" size="md">Update Password</Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
        <p className="text-sm text-gray-600 mb-4">
          Add an extra layer of security to your account using 2FA.
        </p>
        <Button variant="outline" size="sm" icon={<Shield className="w-4 h-4" />}>
          Enable 2FA
        </Button>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
        <div className="space-y-3">
          {[
            { device: "Chrome on MacOS", location: "Bengaluru, India", time: "Current session", current: true },
            { device: "Safari on iPhone", location: "Bengaluru, India", time: "2 hours ago", current: false },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{session.device}</p>
                <p className="text-xs text-gray-500">{session.location} · {session.time}</p>
              </div>
              {session.current ? (
                <Badge variant="success" size="sm">Current</Badge>
              ) : (
                <Button variant="ghost" size="xs" className="text-red-500 hover:bg-red-50">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Subscription Tab ───────────────────────────────────────────────────────────

function SubscriptionTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan._id}
            className={cn(
              "relative bg-white rounded-2xl border-2 p-6",
              plan.highlighted
                ? "border-blue-500 shadow-lg shadow-blue-100"
                : "border-gray-200"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 mb-5">
              {plan.price === 0 ? (
                <p className="text-3xl font-bold text-gray-900">Free</p>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-gray-900">₹{plan.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">per month</p>
                </div>
              )}
            </div>

            <ul className="space-y-2.5 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? "primary" : "outline"}
              size="md"
              fullWidth
            >
              {plan.price === 0 ? "Current Plan" : `Upgrade to ${plan.name}`}
            </Button>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Billing History</CardTitle></CardHeader>
        <div className="space-y-3">
          {[
            { date: "Jan 1, 2024", amount: "₹4,999", status: "Paid", plan: "Pro" },
            { date: "Dec 1, 2023", amount: "₹4,999", status: "Paid", plan: "Pro" },
          ].map((invoice) => (
            <div key={invoice.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{invoice.plan} Plan</p>
                <p className="text-xs text-gray-400">{invoice.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{invoice.amount}</span>
                <Badge variant="success" size="sm">{invoice.status}</Badge>
                <button className="text-xs text-blue-600 hover:underline">Download</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Import Badge - needs to exist
function Badge({ children, variant, size }: { children: React.ReactNode; variant?: string; size?: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-50 text-green-700",
    info: "bg-blue-50 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", colors[variant || "default"])}>
      {children}
    </span>
  );
}
