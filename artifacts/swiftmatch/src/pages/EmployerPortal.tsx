import { Navigation } from "@/components/Navigation";
import { Building2, ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

export default function EmployerPortal() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          <div className="mx-auto w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-8">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-6">
            Employer Portal
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            We are fine-tuning our automated matching algorithms for employers. 
            Soon, you will have access to a curated pool of top-tier, pre-assessed candidates.
          </p>

          <div className="bg-white p-2 rounded-xl border border-border shadow-lg flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-10">
            <div className="relative flex-1 flex items-center">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3" />
              <input 
                type="email" 
                placeholder="Enter your work email" 
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-slate-900"
              />
            </div>
            <button className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap">
              Join Waitlist
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
