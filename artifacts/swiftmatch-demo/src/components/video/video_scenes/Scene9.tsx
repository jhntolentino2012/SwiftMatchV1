import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene9() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500), // Card 1
      setTimeout(() => setPhase(99), 4000), // Card 2
      setTimeout(() => setPhase(99), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-50 flex items-center justify-center p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-[80vw] flex gap-12">
        
        {/* Jobseekers Card */}
        <motion.div 
          className="flex-1 bg-white rounded-3xl p-12 shadow-xl border border-slate-200 flex flex-col justify-center relative overflow-hidden"
          initial={{ opacity: 0, x: -50 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="text-[var(--color-primary)] text-6xl mb-6">🧑‍🎓</div>
          <h2 className="text-4xl font-display font-black text-slate-800 mb-4">For Jobseekers</h2>
          <p className="text-2xl text-slate-600 font-medium leading-relaxed">
            A fair shot. <br/>
            Graded on what you can actually do, not how well you format a PDF.
          </p>
          
          <motion.div 
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>

        {/* Employers Card */}
        <motion.div 
          className="flex-1 bg-[var(--color-primary)] rounded-3xl p-12 shadow-xl border border-blue-900 flex flex-col justify-center relative overflow-hidden"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="text-accent text-6xl mb-6">🏢</div>
          <h2 className="text-4xl font-display font-black text-white mb-4">For Employers</h2>
          <p className="text-2xl text-blue-100 font-medium leading-relaxed">
            Pre-screened candidates. <br/>
            Backed by hard scores, not buzzword bingo.
          </p>

          <motion.div 
            className="absolute -top-20 -left-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 pointer-events-none"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />
        </motion.div>

      </div>
    </motion.div>
  );
}