import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export default function EmailConfirmed() {
  const token = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  ).get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("No confirmation token found."); return; }

    fetch(`${BASE}/api/auth/confirm-email?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const data = await r.json();
        if (r.ok) { setStatus("success"); setMessage(data.message); }
        else { setStatus("error"); setMessage(data.error || "Confirmation failed."); }
      })
      .catch(() => { setStatus("error"); setMessage("Something went wrong. Please try again."); });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-md w-full text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-display font-bold text-primary">Confirming your email…</h2>
            </>
          )}

          {status === "success" && (() => {
            const isEmployer = typeof window !== "undefined" && localStorage.getItem("sm_pending_role") === "employer";
            return (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-primary mb-2">Email Confirmed!</h2>
                <p className="text-slate-500 text-sm mb-2">{message || "Your account is now active."}</p>
                {isEmployer ? (
                  <>
                    <p className="text-slate-400 text-xs mb-6">Sign in to complete your employer profile and post your first job.</p>
                    <Link href="/signin?next=/employer/onboarding"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors">
                      Sign In & Set Up Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-slate-400 text-xs mb-6">You can sign in right away.</p>
                    <Link href="/signin" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                      Sign In Now
                    </Link>
                  </>
                )}
              </>
            );
          })()}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary mb-2">Confirmation Failed</h2>
              <p className="text-slate-500 text-sm mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/signup" className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
                  Sign Up Again
                </Link>
                <Link href="/signin" className="text-sm text-accent hover:underline">
                  Try to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
