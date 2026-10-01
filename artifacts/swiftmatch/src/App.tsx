import React, { useState } from "react";
import "./index.css";

export default function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("applicant");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView("landing")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-xl shadow-lg shadow-orange-500/20">
              SM
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-orange-400 bg-clip-text text-transparent">
              SwiftMatch
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 font-medium text-sm text-slate-300">
            <button onClick={() => setCurrentView("landing")} className="hover:text-orange-400 transition">Home</button>
            <button onClick={() => setCurrentView("jobs")} className="hover:text-orange-400 transition">Browse Jobs</button>
            <button onClick={() => setCurrentView("apply")} className="hover:text-orange-400 transition">For Applicants</button>
            <button onClick={() => setCurrentView("employer")} className="hover:text-orange-400 transition">For Employers</button>
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView("signin")} 
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 transition"
            >
              Sign In
            </button>
            <button 
              onClick={() => setCurrentView("signup")} 
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Router View */}
      <main className="pt-28 pb-16">
        {currentView === "landing" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <span className="inline-block py-1 px-4 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-6">
              The Future of Recruitment in the Philippines
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-8">
              Don't search. <br/>
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">Get spotted.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Build your profile once, complete smart AI assessments, and let top Philippine employers come directly to you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => setCurrentView("apply")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-8 py-4 rounded-xl shadow-xl shadow-orange-500/20 transition"
              >
                Create Applicant Profile →
              </button>
              <button 
                onClick={() => setCurrentView("jobs")}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-base px-8 py-4 rounded-xl transition"
              >
                Browse Available Jobs
              </button>
            </div>
          </div>
        )}

        {currentView === "jobs" && (
          <div className="max-w-5xl mx-auto px-4 py-10">
            <h2 className="text-3xl font-bold mb-6">Explore Top Job Openings</h2>
            <div className="space-y-4">
              {['BPO Operations Manager', 'Senior React Developer', 'Customer Success Lead', 'Financial Analyst'].map((job, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{job}</h3>
                    <p className="text-sm text-slate-400">Taguig / Manila (Hybrid) • Competitive Salary + BPO Benefits</p>
                  </div>
                  <button onClick={() => setCurrentView("apply")} className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-orange-500 hover:text-white transition">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(currentView === "signup" || currentView === "signin") && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl mt-10">
            <h2 className="text-2xl font-bold mb-2">{currentView === "signup" ? "Create Your Account" : "Welcome Back"}</h2>
            <p className="text-sm text-slate-400 mb-6">Enter your details to access SwiftMatch.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Password</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
              </div>
              <button onClick={() => alert("Successfully authenticated!")} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 mt-2">
                {currentView === "signup" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        )}

        {currentView === "apply" && (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4">Applicant Quick Onboarding</h2>
            <p className="text-slate-400 text-sm mb-6">Fill in your professional background to let AI match you with top roles.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white" />
              <input type="text" placeholder="Primary Role / Expertise (e.g. BPO Operations Manager)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white" />
              <textarea placeholder="Brief Professional Summary..." rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"></textarea>
              <button onClick={() => alert("Profile submitted successfully!")} className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-3 rounded-xl text-white">
                Submit & Find Matches
              </button>
            </div>
          </div>
        )}

        {currentView === "employer" && (
          <div className="max-w-4xl mx-auto px-4 py-10 text-center">
            <h2 className="text-3xl font-bold mb-4">Employer Recruitment Portal</h2>
            <p className="text-slate-400 mb-8">Access pre-screened, verified top-tier talent in the Philippines instantly.</p>
            <button onClick={() => setCurrentView("signup")} className="bg-orange-500 text-white font-bold px-8 py-3 rounded-xl">
              Register Company Account
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
