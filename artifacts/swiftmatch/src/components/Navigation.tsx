import { Link, useLocation } from "wouter";
import { ChevronRight, LogIn, ClipboardList, BarChart2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "For Applicants", href: "/apply" },
  { label: "For Employers",  href: "/employer" },
  { label: "Assessment",     href: "/assessment", icon: ClipboardList },
  { label: "Results",        href: "/results",    icon: BarChart2 },
];

export function Navigation() {
  const [location] = useLocation();
  const isHome = location === "/";

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b",
      isHome ? "bg-white/85 backdrop-blur-md border-transparent hover:border-border" : "bg-white border-border"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-11 h-11 flex-shrink-0" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
              <img
                src="/images/swiftmatch-logo.png"
                alt="SwiftMatch logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight" style={{ color: "hsl(214 80% 34%)" }}>
              Swift<span style={{ color: "hsl(24 95% 52%)" }}>Match</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = location === href || (href === "/apply" && location === "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary/8 font-semibold"
                      : "text-muted-foreground hover:text-primary hover:bg-slate-100"
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/signin"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              style={{
                background: "linear-gradient(135deg, hsl(24 95% 52%), hsl(24 95% 44%))",
                clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                boxShadow: "0 4px 14px hsl(24 95% 52% / 0.35)",
              }}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
