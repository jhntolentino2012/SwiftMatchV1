import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene6() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500),
      setTimeout(() => setPhase(99), 2000),
      setTimeout(() => setPhase(99), 4500),
      setTimeout(() => setPhase(99), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-50 flex items-center justify-center p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute top-12 left-12">
        <motion.h2 
          className="text-[2.5vw] font-display font-black text-[var(--color-primary)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          3. AI-Graded Results
        </motion.h2>
      </div>

      <div className="w-[75vw] h-[45vw] flex gap-8">
        {/* Left Col: Scores */}
        <motion.div 
          className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 p-10 flex flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        >
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-3xl">👨‍💻</div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">Maria Santos</h3>
              <p className="text-slate-500 text-xl">Frontend Developer</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-5xl font-display font-black text-[var(--color-primary)]">87%</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Overall Fit</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            {[
              { label: "Knowledge", score: 92, color: "bg-blue-500" },
              { label: "Personality", score: 85, color: "bg-purple-500" },
              { label: "Cultural Fit", score: 88, color: "bg-emerald-500" },
              { label: "Critical Thinking", score: 90, color: "bg-orange-500" },
              { label: "AI Readiness", score: 75, color: "bg-cyan-500" },
            ].map((stat, i) => (
              <div key={stat.label}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">{stat.label}</span>
                  <span className="font-mono text-slate-500">{stat.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${stat.color}`}
                    initial={{ width: 0 }}
                    animate={phase >= 2 ? { width: `${stat.score}%` } : { width: 0 }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Col: AI Feedback */}
        <motion.div 
          className="w-[30vw] bg-[var(--color-primary)] rounded-3xl shadow-xl p-10 text-white flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Decorative motif */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          
          <div className="flex items-center gap-3 mb-8 text-accent">
            <span className="text-3xl">✨</span>
            <span className="font-bold tracking-widest uppercase text-sm">AI Analysis</span>
          </div>

          <div className="flex flex-col gap-6 text-lg text-blue-50 leading-relaxed">
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <strong className="text-white">Strong technical foundation.</strong> Maria demonstrates deep knowledge of React rendering cycles and state management patterns.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.5 }}
            >
              <strong className="text-white">Collaborative problem solver.</strong> Cultural fit responses indicate high empathy and preference for cross-functional teams.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 2.5 }}
            >
              <strong className="text-white">Growth area:</strong> AI Readiness score (75%) suggests she could benefit from training on integrating LLM tools into daily workflows.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}