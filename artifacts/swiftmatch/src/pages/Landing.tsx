import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Sparkles, Target, Zap, FileText } from "lucide-react";
import { Navigation } from "@/components/Navigation";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/10 to-transparent blur-3xl" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
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
                  className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg bg-accent text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:bg-accent/90 hover:-translate-y-0.5 active:translate-y-0 transition-all"
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
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Smart matching
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Privacy first
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up stagger-2 hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                {/* landing page hero professional portrait */}
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80" 
                  alt="Professional candidate"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                
                {/* Floating Cards */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Match Score</p>
                      <p className="text-xl font-bold text-slate-900">98% Fit Found</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                description: "Highlight your skills, employment history, certifications, and expected salary all in one beautiful portfolio."
              },
              {
                icon: Zap,
                title: "Pre-Assessment Screening",
                description: "Prove your knowledge and personality fit upfront through our tailored situational and expertise assessments."
              },
              {
                icon: Target,
                title: "Automated Placement",
                description: "Skip the applications. If you match an employer's criteria and pass the assessments, you get the interview invite directly."
              }
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
