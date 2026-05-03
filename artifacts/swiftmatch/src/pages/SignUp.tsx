import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/hooks/useAuth";
import { Eye, EyeOff, Mail, Lock, Phone, UserPlus, CheckCircle, ShieldCheck, Building2 } from "lucide-react";
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

export default function SignUp() {
  const { toast } = useToast();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const isEmployer = params.get("role") === "employer";
  const prefillEmail = params.get("email") || "";

  const [form, setForm] = useState({ email: prefillEmail, password: "", confirmPassword: "", phone: "" });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<false | "pending" | "owner">(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 8) {
      toast({ title: "Password too short", description: "At least 8 characters required.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const resp = await apiPost("/signup", form) as { confirmed?: boolean };
      if (isEmployer) localStorage.setItem("sm_pending_role", "employer");
      setDone(resp?.confirmed ? "owner" : "pending");
    } catch (err: any) {
      toast({ title: "Sign up failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done === "owner") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">Owner account ready</h2>
            <p className="text-slate-500 text-sm mb-2">
              <strong className="text-primary">{form.email}</strong> has been auto-activated as an owner account.
            </p>
            <p className="text-slate-400 text-xs mb-6">Email confirmation was skipped. You can sign in right away.</p>
            <Link href="/signin" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (done === "pending") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">Check your inbox!</h2>
            <p className="text-slate-500 text-sm mb-2">
              We've sent a confirmation email to <strong className="text-primary">{form.email}</strong>.
            </p>
            <p className="text-slate-400 text-xs mb-6">Click the link in the email to activate your account. Check your spam folder if you don't see it.</p>
            <Link href="/signin" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 w-full max-w-md">

          {/* Logo mark */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 mb-3">
              {isEmployer
                ? <Building2 className="w-6 h-6 text-accent" />
                : <UserPlus className="w-6 h-6 text-accent" />}
              <span className="font-display font-extrabold text-xl text-primary">
                {isEmployer ? "Create employer account" : "Create your account"}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {isEmployer
                ? "Post jobs and discover pre-assessed Filipino talent."
                : "Join SwiftMatch — get spotted by top employers."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Business or Personal Email"
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              icon={Mail}
            />

            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 555 000 0000"
              icon={Phone}
            />

            <Field
              label="Password"
              id="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Min. 8 characters"
              icon={Lock}
              right={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Field
              label="Confirm Password"
              id="confirmPassword"
              type={showCpw ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Repeat your password"
              icon={Lock}
              right={
                <button type="button" onClick={() => setShowCpw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showCpw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <p className="text-xs text-slate-400">
              By signing up you agree to SwiftMatch's <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all text-sm"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{" "}
            <Link href="/signin" className="text-accent font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
