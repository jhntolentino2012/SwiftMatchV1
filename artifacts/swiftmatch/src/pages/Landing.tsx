import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Sparkles, Target, Zap, FileText, ChevronLeft, ChevronRight, Users, Award } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const HERO_SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=85",
    alt: "Confident professional candidate ready for success",
    caption: "Match Score",
    stat: "98% Fit Found",
    badge: "Top Candidate",
  },
  {
    url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=900&q=85",
    alt: "Recruiter and candidate sharing a warm handshake",
    caption: "Placement Rate",
    stat: "4× Faster Hiring",
    badge: "Hired!",
  },
  {
    url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=85",
    alt: "Happy diverse team collaborating in a modern office",
    caption: "Team Matches",
    stat: "2,400+ Placed",
    badge: "Perfect Team",
  },
  {
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=85",
    alt: "Recruiter reviewing a strong applicant profile",
    caption: "Profile Views",
    stat: "12× More Visible",
    badge: "Top Profile",
  },
  {
    url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900&q=85",
    alt: "Professionals celebrating a successful hire",
    caption: "Success Stories",
    stat: "97% Satisfied",
    badge: "Great Match",
  },
  {
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=85",
    alt: "Smooth digital application process on laptop",
    caption: "Avg. Apply Time",
    stat: "Under 15 mins",
    badge: "Seamless",
  },
  {
    url: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=900&q=85",
    alt: "Employer delighted reviewing matched candidates",
    caption: "Employer Rating",
    stat: "4.9 / 5 Stars",
    badge: "Top Employer",
  },
  {
    url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85",
    alt: "Energetic team in a bright modern workplace",
    caption: "Active Jobs",
    stat: "8,500+ Live Roles",
    badge: "Now Hiring",
  },
  {
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85",
    alt: "Professional sitting confidently after acing an assessment",
    caption: "Assessment Score",
    stat: "Passed with 95%",
    badge: "Assessment Ace",
  },
  {
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85",
    alt: "Successful professional man ready for new opportunities",
    caption: "Interview Invites",
    stat: "3 Offers in 1 Week",
    badge: "In Demand",
  },
];

// Animation variants
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.75, ease: [0.32, 0.72, 0, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
  }),
};

const overlayVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { delay: 0.55, duration: 0.45, type: "spring", stiffness: 240 } },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function StatItem({ label, value, suffix = "" }: { label: string; value: number | string; suffix?: string }) {
  const isNumeric = typeof value === "number";
  const animated = useCountUp(isNumeric ? value : 0);
  const display = isNumeric
    ? animated.toLocaleString() + suffix
    : value;

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-extrabold" style={{ color: "hsl(214 80% 34%)" }}>
        {display}
      </span>
      <span>{label}</span>
    </div>
  );
}

function LiveStatsStrip() {
  const [stats, setStats] = useState<{ applicantsCount: number; companiesCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {/* silently fall back to static display */});
  }, []);

  const applicants = stats?.applicantsCount ?? 0;
  const companies  = stats?.companiesCount ?? 0;

  return (
    <div className="border-y border-border bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-semibold text-muted-foreground">
          <StatItem label="Active Applicants"   value={applicants} suffix="+" />
          <StatItem label="Partner Companies"   value={companies}  suffix="+" />
          <StatItem label="Successful Placements" value="18,000+" />
          <StatItem label="Avg. Time to Hire"   value="7 Days" />
        </div>
      </div>
    </div>
  );
}

function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(next);
  }, []);

  const prev = () => {
    const next = (index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    goTo(next, -1);
  };

  const next = () => {
    const next = (index + 1) % HERO_SLIDES.length;
    goTo(next, 1);
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/3]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide images */}
      <AnimatePresence custom={direction} mode="popLayout" initial={false}>
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.url}
            alt={slide.alt}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay — deep at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(214_80%_16%)] via-[hsl(214_80%_20%/0.35)] to-transparent" />
          {/* Subtle blue shimmer left edge */}
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[hsl(214_80%_34%/0.25)] to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Badge — top right */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`badge-${index}`}
          variants={badgeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-4 right-4"
        >
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, hsl(24 95% 52%), hsl(24 95% 42%))" }}
          >
            <Award className="h-3.5 w-3.5" />
            {slide.badge}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Bottom stat card */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={`stat-${index}`}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass-panel p-4 rounded-xl flex items-center gap-4"
          >
            <div
              className="h-12 w-12 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(24 95% 52% / 0.2), hsl(24 95% 52% / 0.08))", border: "1px solid hsl(24 95% 52% / 0.3)" }}
            >
              <Target className="h-6 w-6" style={{ color: "hsl(24 95% 52%)" }} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{slide.caption}</p>
              <p className="text-xl font-bold text-slate-900">{slide.stat}</p>
            </div>
            {/* Dot indicator */}
            <div className="ml-auto flex items-center gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === index ? "20px" : "6px",
                    height: "6px",
                    background: i === index ? "hsl(24 95% 52%)" : "hsl(214 30% 80%)",
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/35 transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide counter */}
      <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-xs font-semibold">
        {index + 1} / {HERO_SLIDES.length}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/8 to-transparent blur-3xl" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40"
            style={{ background: "hsl(24 95% 52% / 0.15)" }} />
          <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: "hsl(214 80% 34% / 0.12)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            {/* Left: copy */}
            <div className="max-w-2xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6 border border-accent/20">
                <Sparkles className="h-4 w-4" />
                The Future of Recruitment
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-primary leading-tight mb-6">
                Don't search.<br />
                <span className="text-gradient">Get spotted.</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 leading-relaxed">
                Build your comprehensive profile once. Complete our smart pre-assessments. Let the best employers in the industry come directly to you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/apply"
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  style={{ background: "hsl(24 95% 52%)", boxShadow: "0 8px 24px hsl(24 95% 52% / 0.3)" }}
                >
                  Create Applicant Profile
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/employer"
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg bg-white text-primary border-2 border-border shadow-sm hover:border-primary/20 hover:bg-slate-50 transition-all"
                >
                  I'm an Employer
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm font-medium text-muted-foreground">
                {["Free forever", "Smart matching", "Privacy first"].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: slideshow */}
            <div className="relative animate-slide-up stagger-2 hidden lg:block">
              <HeroSlideshow />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <LiveStatsStrip />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">How SwiftMatch Works</h2>
            <p className="text-lg text-muted-foreground">We reverse the hiring process. You showcase your abilities, and our automated system matches you with employers looking for your exact skill set.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Comprehensive Profile",
                description: "Highlight your skills, employment history, certifications, and expected salary all in one beautiful portfolio.",
              },
              {
                icon: Zap,
                title: "Pre-Assessment Screening",
                description: "Prove your knowledge and personality fit upfront through our tailored situational and expertise assessments.",
              },
              {
                icon: Target,
                title: "Automated Placement",
                description: "Skip the applications. If you match an employer's criteria and pass the assessments, you get the interview invite directly.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-border hover-card-effect group">
                <div className="h-14 w-14 rounded-xl bg-white shadow-sm border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
