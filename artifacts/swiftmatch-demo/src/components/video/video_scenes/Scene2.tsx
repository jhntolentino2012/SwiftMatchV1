import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 7000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-primary)] text-white"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, var(--color-accent), transparent 60%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="text-center z-10 flex flex-col items-center">
        <motion.div
          className="w-32 h-32 mb-8 bg-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
          initial={{ rotate: -90, scale: 0, borderRadius: "100%" }}
          animate={phase >= 1 ? { rotate: 0, scale: 1, borderRadius: "16px" } : { rotate: -90, scale: 0, borderRadius: "100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="text-[var(--color-primary)] font-display font-black text-6xl">S</div>
        </motion.div>

        <motion.h1 
          className="text-[8vw] font-display font-black leading-none mb-4"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
        >
          SwiftMatch
        </motion.h1>

        <motion.div className="h-px bg-accent w-0"
          animate={phase >= 2 ? { width: "40vw" } : { width: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.h2 
          className="text-[3vw] font-sans font-medium text-blue-100 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          Hire on merit. Not on margins.
        </motion.h2>

        <motion.p 
          className="text-[2vw] font-sans text-accent font-bold mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          Resumes lie. SwiftMatch tests.
        </motion.p>
      </div>
    </motion.div>
  );
}