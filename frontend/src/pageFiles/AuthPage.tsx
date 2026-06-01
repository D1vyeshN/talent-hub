"use client";
import { useState } from "react";
import { Briefcase, CheckCircle, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, register } from "@/features/auth/store/authSlice";
import { redirect } from "next/navigation";

interface AuthPageProps {
  mode: "login" | "register";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);

  // Start in the mode the URL dictates; user can toggle between them
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      const result = await dispatch(
        login({ email: formData.email, password: formData.password })
      );
      if (login.fulfilled.match(result)) {
        redirect("jobs");
      }
    } else {
      const result = await dispatch(
        register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
        })
      );
      if (register.fulfilled.match(result)) {
        redirect(role === "recruiter" ? "recruiter-dashboard" : "candidate-dashboard");
      }
    }
  };

  const handleDemoLogin = async (demoRole: "candidate" | "recruiter") => {
    // Demo login — uses mock data directly (works without backend)
    const { setUser } = await import("@/store/slices/authSlice");
    const { MOCK_CANDIDATE, MOCK_RECRUITER } = await import("@/lib/mockData");
    if (demoRole === "recruiter") {
      dispatch(setUser(MOCK_RECRUITER));
    } else {
      dispatch(setUser(MOCK_CANDIDATE));
    }
    redirect(demoRole === "recruiter" ? "recruiter-dashboard" : "candidate-dashboard");
  };

  const BENEFITS = [
    "Access 50,000+ active job listings",
    "AI-powered job matching",
    "Resume builder & optimizer",
    "Direct recruiter messaging",
    "Salary insights & benchmarks",
    "Application tracking dashboard",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Left Panel (Desktop) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 flex-col justify-between p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">TalentHub</span>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your next great<br />opportunity awaits
          </h2>
          <p className="text-blue-200 text-lg mb-10 leading-relaxed">
            Join 2 million+ professionals who use TalentHub to advance their careers.
          </p>

          <div className="space-y-3">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                <span className="text-sm text-blue-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-sm text-blue-100 italic mb-3">
            "TalentHub helped me land a 40% salary hike at Google. The AI matching is eerily accurate."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">RM</div>
            <div>
              <p className="text-xs font-semibold text-white">Rahul Mehta</p>
              <p className="text-xs text-blue-300">Software Engineer, Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TalentHub</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-500 mt-1.5">
              {isLogin
                ? "Sign in to access your dashboard."
                : "Start your journey to your dream job today."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Role Selector (Register only) */}
          {!isLogin && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">I am a...</p>
              <div className="grid grid-cols-2 gap-3">
                {(["candidate", "recruiter"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === r ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{r === "candidate" ? "🙋" : "🏢"}</div>
                    <p className={`text-sm font-semibold capitalize ${role === r ? "text-blue-700" : "text-gray-700"}`}>
                      {r}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r === "candidate" ? "Looking for jobs" : "Hiring talent"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isLoading}
              className="mt-2"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-4 text-sm text-gray-400">or continue with demo</span>
            </div>
          </div>

          {/* Demo Quick Login */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("candidate")}
              disabled={isLoading}
            >
              🙋 Demo Candidate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDemoLogin("recruiter")}
              disabled={isLoading}
            >
              🏢 Demo Recruiter
            </Button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              {isLogin ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {/* ToS */}
          {!isLogin && (
            <p className="text-xs text-gray-400 text-center mt-4">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>{" "}
              and{" "}
              <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
