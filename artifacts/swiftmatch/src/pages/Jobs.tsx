import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { JobSearchWidget } from "@/components/JobSearchWidget";
import { useListJobs } from "@workspace/api-client-react";
import { MapPin, Briefcase, Building2, ChevronRight, Search } from "lucide-react";

export default function JobsPage() {
  const { data: jobs = [], isLoading } = useListJobs();

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const filterIndustry = params.get("industry") || "";
  const filterLocation = params.get("location") || "";

  const filtered = jobs.filter(j => {
    const matchIndustry = filterIndustry
      ? (j.industry ?? "").toLowerCase().includes(filterIndustry.toLowerCase()) ||
        filterIndustry.toLowerCase().includes((j.industry ?? "").toLowerCase()) ||
        (j.title ?? "").toLowerCase().includes(filterIndustry.toLowerCase())
      : true;
    const matchLocation = filterLocation
      ? (j.location ?? "").toLowerCase().includes(filterLocation.toLowerCase())
      : true;
    return matchIndustry && matchLocation;
  });

  const activeFilters = [filterIndustry, filterLocation].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Search bar */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-primary mb-1">
            {activeFilters.length > 0 ? "Search Results" : "Browse Jobs in the Philippines"}
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            {activeFilters.length > 0
              ? `Showing results for ${activeFilters.join(" · ")}`
              : "Discover opportunities across industries and locations"}
          </p>
          <JobSearchWidget />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-primary mb-1">No exact matches found</h3>
            <p className="text-slate-500 text-sm mb-4">Try a broader search or clear a filter.</p>
            <Link href="/jobs" className="text-accent font-semibold text-sm hover:underline">Clear filters</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-medium">{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/12">
                        {job.industry}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-primary group-hover:text-accent transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      {job.salaryRange && <span className="flex items-center gap-1.5">{job.salaryRange}</span>}
                    </div>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">{job.description}</p>
                  </div>
                  <Link
                    href="/signup"
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Apply <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA if not filtered */}
        {!filterIndustry && !filterLocation && (
          <div className="mt-10 p-6 bg-gradient-to-r from-primary to-blue-700 rounded-2xl text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-bold text-lg">Build your profile once. Get found by top employers.</p>
              <p className="text-blue-200 text-sm mt-0.5">Create a free profile and let employers come to you.</p>
            </div>
            <Link href="/signup" className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shrink-0">
              Create Free Profile <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
