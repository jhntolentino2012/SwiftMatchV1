import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useListJobs, useListCourses } from "@workspace/api-client-react";
import { Briefcase, Building2, MapPin, ExternalLink, GraduationCap, ChevronRight } from "lucide-react";

export default function ApplicantDashboard() {
  const { data: jobs, isLoading: loadingJobs } = useListJobs();
  const { data: courses, isLoading: loadingCourses } = useListCourses();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-primary">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back. Here are your personalized recommendations based on your profile.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Column: Jobs */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-accent" />
                Recommended Jobs
              </h2>
              <button className="text-sm font-medium text-accent hover:underline">View all</button>
            </div>

            {loadingJobs ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs?.map((job) => (
                  <div key={job.id} className="glass-panel p-6 rounded-2xl hover-card-effect group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-primary group-hover:text-accent transition-colors">{job.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                          <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                        95% Match
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">{job.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                        {job.salaryRange}
                      </span>
                      <button className="text-accent font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Apply Now <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Profile & Courses */}
          <div className="space-y-8">
            
            {/* Profile Card */}
            <div className="bg-primary text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <h3 className="font-display font-bold text-lg mb-2 relative z-10">Profile Status</h3>
              <div className="flex items-end gap-3 mb-6 relative z-10">
                <span className="text-4xl font-bold">100%</span>
                <span className="text-white/70 text-sm mb-1">Complete</span>
              </div>
              
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Assessments</span>
                  <span className="font-medium">2/4 Passed</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full w-1/2" />
                </div>
              </div>
            </div>

            {/* Courses */}
            <div>
              <h2 className="text-xl font-bold text-primary flex items-center gap-2 mb-6">
                <GraduationCap className="w-5 h-5 text-accent" />
                Skill Enhancement
              </h2>
              
              {loadingCourses ? (
                <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
              ) : (
                <div className="grid gap-4">
                  {courses?.map(course => (
                    <a key={course.id} href={course.url || "#"} target="_blank" className="block bg-white p-5 rounded-2xl border border-border shadow-sm hover:border-accent/30 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">{course.provider}</span>
                        {course.status === 'sponsored' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase font-bold">Sponsored</span>
                        )}
                      </div>
                      <h3 className="font-bold text-primary mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        {course.skillsGained.slice(0, 2).map(s => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{s}</span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
