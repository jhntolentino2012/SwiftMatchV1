import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene7() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500),
      setTimeout(() => setPhase(99), 1500),
      setTimeout(() => setPhase(99), 2500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const candidates = [
    { name: "Maria Santos", role: "Frontend Dev", score: 87, match: "High Match", color: "text-emerald-500 bg-emerald-50" },
    { name: "Juan Dela Cruz", role: "Fullstack Eng", score: 82, match: "Good Match", color: "text-emerald-500 bg-emerald-50" },
    { name: "Ana Reyes", role: "UI Designer", score: 76, match: "Potential", color: "text-amber-500 bg-amber-50" },
    { name: "Carlos Garcia", role: "Backend Dev", score: 64, match: "Low Match", color: "text-rose-500 bg-rose-50" },
  ];

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute top-12 left-12">
        <motion.h2 
          className="text-[2.5vw] font-display font-black text-[var(--color-primary)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          4. The Employer Shortlist
        </motion.h2>
      </div>

      <div className="w-[80vw] max-w-5xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-12">
        {/* Table Header */}
        <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex text-slate-500 font-bold uppercase text-sm tracking-wider">
          <div className="w-1/3">Candidate</div>
          <div className="w-1/4">Role</div>
          <div className="w-1/6 text-center">Fit Score</div>
          <div className="w-1/4 text-right">Status</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {candidates.map((c, i) => (
            <motion.div 
              key={c.name}
              className={`px-8 py-6 flex items-center transition-colors hover:bg-slate-50 ${phase >= 3 && i === 0 ? 'bg-blue-50' : ''}`}
              initial={{ opacity: 0, x: -50 }}
              animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="w-1/3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {c.name.charAt(0)}
                </div>
                <span className="font-bold text-slate-800 text-lg">{c.name}</span>
              </div>
              <div className="w-1/4 text-slate-600">{c.role}</div>
              <div className="w-1/6 flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center font-bold text-[var(--color-primary)]">
                  {c.score}
                </div>
              </div>
              <div className="w-1/4 flex justify-end">
                <span className={`px-4 py-2 rounded-full font-bold text-sm ${c.color}`}>
                  {c.match}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.p 
        className="mt-8 text-2xl font-bold text-slate-600"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
      >
        No more guessing. Just hard data.
      </motion.p>
    </motion.div>
  );
}