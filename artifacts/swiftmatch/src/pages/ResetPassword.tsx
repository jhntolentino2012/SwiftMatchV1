import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/hooks/useAuth";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [location] = useLocation();
  const token = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  ).get("token") || "";

  const { toast } = useToast();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    try {
      setLoading(true);
      await apiPost("/reset-password", { token, ...form });
      setDone(true);
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 max-w-md w-full text-center">
            <p className="text-red-500 font-semibold mb-4">Invalid or missing reset token.</p>
            <Link href="/forgot-password" className="text-accent font-semibold hover:underline text-sm">Request a new reset link</Link>
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

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary mb-2">Password updated!</h2>
              <p className="text-slate-500 text-sm mb-6">Your password has been changed. You can now sign in with your new password.</p>
              <Link href="/signin" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-primary mb-1">Set new password</h2>
                <p className="text-sm text-slate-500">Choose a strong password with at least 8 characters.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { k: "password",        label: "New Password",     placeholder: "Min. 8 characters" },
                  { k: "confirmPassword", label: "Confirm Password", placeholder: "Repeat your password" },
                ].map(({ k, label, placeholder }) => (
                  <div key={k} className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={form[k as keyof typeof form]}
                        onChange={set(k as keyof typeof form)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
