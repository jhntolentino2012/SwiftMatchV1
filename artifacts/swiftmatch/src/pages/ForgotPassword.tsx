import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/hooks/useAuth";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: "Email required", variant: "destructive" }); return; }
    try {
      setLoading(true);
      await apiPost("/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-10">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 w-full max-w-md">

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary mb-2">Check your inbox</h2>
              <p className="text-slate-500 text-sm mb-6">
                If <strong className="text-primary">{email}</strong> is registered, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <Link href="/signin" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <Link href="/signin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-5">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
                <h2 className="text-xl font-display font-bold text-primary mb-1">Forgot your password?</h2>
                <p className="text-sm text-slate-500">Enter your registered email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-all text-sm"
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
