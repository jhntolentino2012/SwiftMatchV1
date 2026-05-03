import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  BrainCircuit, 
  Users, 
  Cpu, 
  BriefcaseBusiness 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroNetwork from "@/assets/images/hero-network.png";
import manilaSkyline from "@/assets/images/manila-skyline.png";
import assessmentArt from "@/assets/images/assessment-art.png";

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const STAGGER = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const industries = [
  "BPO", "Healthcare", "IT/Software", "Retail", "Hospitality", 
  "Construction", "Manufacturing", "Education", "Finance", 
  "Logistics", "Agriculture", "Government", "Maritime", 
  "Creative & Media", "F&B", "Real Estate", "Energy", 
  "Telecom", "Legal", "Public Safety"
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background selection:bg-accent selection:text-white overflow-x-hidden flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold tracking-tighter">
              SM
            </div>
            <span className="font-semibold text-lg tracking-tight">SwiftMatch</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden sm:inline-flex bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">
              Replit · 10Y Buildathon 2026
            </Badge>
            <a href={import.meta.env.VITE_TRY_URL ?? "/"} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Try SwiftMatch
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-primary/5">
            <img 
              src={heroNetwork} 
              alt="Abstract network visualization" 
              className="w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background"></div>
          </div>
          
          <div className="container mx-auto px-4">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={STAGGER}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={FADE_UP} className="mb-6 flex justify-center">
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">
                  Built in under 30 days entirely on Replit
                </Badge>
              </motion.div>
              
              <motion.h1 variants={FADE_UP} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground mb-6 leading-[1.1]">
                The Philippine hiring engine, <br className="hidden md:block"/>
                <span className="text-accent">rebuilt on proof.</span>
              </motion.h1>
              
              <motion.p variants={FADE_UP} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Resumes lie. SwiftMatch tests. We match Filipino jobseekers with employers using AI-graded pre-assessments instead of keyword filters. 
              </motion.p>
              
              <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={import.meta.env.VITE_TRY_URL ?? "/"} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-12 px-8 py-2 w-full sm:w-auto group">
                  Try SwiftMatch
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8" onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Play className="mr-2 w-4 h-4 text-accent fill-accent" />
                  Watch the demo
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The Problem & Solution */}
        <section className="py-24 bg-muted/50 border-y border-border/50">
          <div className="container mx-auto px-4">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={STAGGER}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-8">
                <motion.div variants={FADE_UP}>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                    Hire on merit, <br/>not on margins.
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    The traditional hiring pipeline is broken. Millions of talented Filipinos submit resumes into a black hole, while employers drown in buzzword-stuffed PDFs that tell them nothing about actual competence.
                  </p>
                </motion.div>

                <motion.div variants={STAGGER} className="space-y-4">
                  <motion.div variants={FADE_UP} className="flex items-start gap-4 p-4 rounded-xl bg-background border shadow-sm">
                    <div className="mt-1 bg-accent/10 p-2 rounded-lg">
                      <BriefcaseBusiness className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">For Employers</h3>
                      <p className="text-sm text-muted-foreground">Get pre-screened candidates with hard, verifiable scores across 5 dimensions before you even look at a CV.</p>
                    </div>
                  </motion.div>

                  <motion.div variants={FADE_UP} className="flex items-start gap-4 p-4 rounded-xl bg-background border shadow-sm">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">For Jobseekers</h3>
                      <p className="text-sm text-muted-foreground">Get a fair shot. Stand out based on what you can actually do, graded objectively by an unbiased AI engine.</p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div variants={FADE_UP} className="relative rounded-2xl overflow-hidden aspect-square md:aspect-auto md:h-full border border-border shadow-xl">
                <img 
                  src={manilaSkyline} 
                  alt="Manila skyline abstract" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-multiply"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* The 5-Test Engine */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Five-Test Engine</h2>
              <p className="text-xl text-muted-foreground">
                We replaced the resume filter with a multi-dimensional assessment pipeline that scores what actually matters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">1. Knowledge Test</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Industry-specific competency questions dynamically generated for 20+ Philippine industries to establish a baseline of hard skills.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">2. Personality Test</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Combined MBTI and DOPE profiling auto-routed by role to ensure the candidate's natural working style matches the job requirements.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">3. Cultural Fit</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    25 situational questions per industry. Anti-repeat logic reshuffles scenarios per applicant to prevent cheating and gauge true alignment.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                      <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">4. Critical Thinking</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      50 complex scenario questions per industry. Entirely AI-graded with detailed rationale feedback to evaluate how candidates reason through problems, not just what they know.
                    </p>
                  </div>
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-lg overflow-hidden relative">
                    <img src={assessmentArt} alt="AI Grading" className="w-full h-full object-cover" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Cpu className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">5. AI Readiness</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A modern necessity. Measures candidate comfort, capability, and ethical understanding of modern AI tooling in their daily workflow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        <section id="demo" className="py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">See SwiftMatch in Action</h2>
                <p className="text-primary-foreground/80">A complete walkthrough of the assessment pipeline and employer dashboard.</p>
              </div>
              
              <div className="aspect-video bg-black rounded-2xl border border-primary-foreground/10 overflow-hidden shadow-2xl">
                <video
                  src={`${import.meta.env.BASE_URL}swiftmatch-demo.mp4`}
                  poster={`${import.meta.env.BASE_URL}opengraph.jpg`}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Industries Marquee */}
        <section className="py-20 overflow-hidden border-b border-border/50">
          <div className="container mx-auto px-4 mb-10 text-center">
            <h2 className="text-2xl font-bold">Supporting 20 Philippine Industries</h2>
          </div>
          <div className="flex w-full">
            <div className="flex animate-[marquee_40s_linear_infinite] whitespace-nowrap">
              {[...industries, ...industries].map((industry, i) => (
                <div key={i} className="mx-3 px-6 py-3 rounded-full bg-muted border border-border text-sm font-medium">
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-3xl bg-gradient-to-br from-muted to-background border shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
              
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">
                Ready to hire better?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto relative z-10">
                Stop guessing. Start measuring. Join the next generation of Philippine recruitment.
              </p>
              <div className="relative z-10">
                <a href={import.meta.env.VITE_TRY_URL ?? "/"} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-accent text-accent-foreground shadow hover:bg-accent/90 h-14 px-10 group">
                  Try SwiftMatch Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              SM
            </div>
            <span className="font-semibold text-foreground">SwiftMatch</span>
          </div>
          
          <div className="text-center md:text-left">
            Built solo on Replit with React, Express, PostgreSQL, Drizzle & OpenAI.<br/>
            Replit 10-Year Buildathon 2026 · Manila, Philippines.
          </div>
          
          <div>
            <a href="mailto:jhn.tolentino2012@gmail.com" className="hover:text-foreground transition-colors">
              jhn.tolentino2012@gmail.com
            </a>
          </div>
        </div>
      </footer>
      
      {/* Add Marquee animation if not natively supported by tailwind class */}
      <style dangerouslySetInlineStyle={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
}
