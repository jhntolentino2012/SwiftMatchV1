import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500),
      setTimeout(() => setPhase(99), 2500),
      setTimeout(() => setPhase(99), 5000),
      setTimeout(() => setPhase(99), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F172A]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 overflow-hidden flex justify-center opacity-10">
         <motion.div 
           className="w-full flex flex-wrap gap-4 p-8 blur-sm pointer-events-none"
           initial={{ y: "0%" }}
           animate={{ y: "-50%" }}
           transition={{ duration: 20, ease: "linear", repeat: Infinity }}
         >
           {[...Array(50)].map((_, i) => (
             <div key={i} className="h-8 w-48 bg-white/20 rounded-md"></div>
           ))}
         </motion.div>
      </div>

      <div className="text-center z-10">
        <motion.h1 
          className="text-[8vw] font-display font-black text-white leading-tight"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          Resumes lie.
        </motion.h1>
        
        <motion.div
          className="overflow-hidden mt-4"
        >
          <motion.h2 
            className="text-[3vw] font-sans font-bold text-slate-300"
            initial={{ opacity: 0, y: "100%" }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            Keyword filters are broken.
          </motion.h2>
        </motion.div>

        <motion.p 
          className="text-[2vw] font-sans text-slate-400 mt-8 max-w-[60vw] mx-auto"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={phase >= 3 ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8 }}
        >
          Great candidates are ghosted every day because they didn't stuff their CV with the right buzzwords.
        </motion.p>
      </div>
      
      <motion.div
        className="absolute bottom-32 text-[2vw] font-mono text-accent font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: 1 }}
      >
        <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          It's time for a better way.
        </motion.span>
      </motion.div>
    </motion.div>
  );
}