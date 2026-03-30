import { Link, useLocation } from "wouter";
import { Briefcase, Building, ChevronRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const isHome = location === "/";

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      isHome ? "bg-white/80 backdrop-blur-md border-transparent hover:border-border" : "bg-white border-border"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent p-0.5">
              <div className="h-full w-full rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-transparent transition-colors">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-primary">
              Swift<span className="text-accent">Match</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              For Applicants
            </Link>
            <Link href="/employer" className="text-muted-foreground hover:text-primary transition-colors">
              For Employers
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/employer" 
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <Building className="h-4 w-4" />
              Sign in
            </Link>
            <Link 
              href="/apply" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Create Profile
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
