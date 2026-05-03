import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

function Field({ label, id, type, value, onChange, placeholder, icon: Icon, right }: any) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all py-3",
            Icon ? "pl-10 pr-4" : "px-4",
            right ? "pr-10" : ""
          )}
        />
        {right}
      </div>
    </div>
  );
}

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const nextPath = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("next") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await apiPost("/login", form);
      localStorage.setItem("sm_auth_token", data.token);
      toast({ title: "Welcome back!", description: `Signed in as ${data.user.email}` });
      setLocation(nextPath);
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 w-full max-w-md">

          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 mb-3">
              <LogIn className="w-6 h-6 text-accent" />
              <span className="font-display font-extrabold text-xl text-primary">Sign in to SwiftMatch</span>
            </div>
            <p className="text-sm text-slate-500">Access your profile, assessments, and matches.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email Address"
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              icon={Mail}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Your password"
                  className="w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all py-3 pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accent font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
