import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene10() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 1000), // Logo
      setTimeout(() => setPhase(99), 2500), // Tagline
      setTimeout(() => setPhase(99), 4000), // Credits
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-white flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="flex flex-col items-center">
        {/* Logo Lockup */}
        <motion.div 
          className="flex items-center gap-6 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="w-24 h-24 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-lg">
            <div className="text-white font-display font-black text-5xl">S</div>
          </div>
          <h1 className="text-[7vw] font-display font-black text-slate-900 tracking-tight">SwiftMatch</h1>
        </motion.div>

        {/* Tagline */}
        <motion.h2 
          className="text-[2.5vw] font-sans font-bold text-slate-500 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Hire on merit. Not on margins.
        </motion.h2>

        {/* Credits */}
        <motion.div 
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="text-slate-400 font-mono text-sm tracking-widest uppercase mb-2">Built on Replit</div>
          <div className="text-slate-500 font-medium">10-Year Buildathon 2026</div>
          <div className="text-slate-400">Manila, Philippines 🇵🇭</div>
        </motion.div>
      </div>

    </motion.div>
  );
}