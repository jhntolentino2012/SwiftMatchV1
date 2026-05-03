import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const TESTS = [
  { name: "Knowledge", color: "bg-blue-500", icon: "🧠" },
  { name: "Personality", color: "bg-purple-500", icon: "👤" },
  { name: "Cultural Fit", color: "bg-emerald-500", icon: "🤝" },
  { name: "Critical Thinking", color: "bg-orange-500", icon: "⚡" },
  { name: "AI Readiness", color: "bg-cyan-500", icon: "🤖" },
];

export function Scene3() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500),
      setTimeout(() => setPhase(99), 1500),
      setTimeout(() => setPhase(99), 13500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-white"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      >
        <h2 className="text-[3vw] font-sans font-bold text-[var(--color-primary)]">The 5-Dimension</h2>
        <h1 className="text-[6vw] font-display font-black text-slate-900 leading-none">Assessment Engine</h1>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6 w-full max-w-[80vw]">
        {TESTS.map((test, i) => (
          <motion.div
            key={test.name}
            className="bg-white border-2 border-slate-100 shadow-xl rounded-2xl p-8 flex flex-col items-center justify-center w-[14vw] h-[14vw]"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20, 
              delay: phase >= 2 ? i * 0.2 : 0 
            }}
          >
            <div className={`w-16 h-16 rounded-full ${test.color} flex items-center justify-center text-3xl text-white mb-4 shadow-lg`}>
              {test.icon}
            </div>
            <h3 className="text-[1.5vw] font-bold text-center leading-tight text-slate-800">{test.name}</h3>
            
            <motion.div 
              className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: i * 0.2 + 0.5 }}
            >
              <motion.div 
                className={`h-full ${test.color}`}
                initial={{ width: 0 }}
                animate={phase >= 2 ? { width: `${60 + Math.random() * 40}%` } : { width: 0 }}
                transition={{ duration: 1.5, delay: i * 0.2 + 0.8, ease: "easeOut" }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className="absolute w-full h-[30vh] bottom-0 left-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(242, 106, 27, 0.05), transparent)' }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 2 }}
      />
    </motion.div>
  );
}