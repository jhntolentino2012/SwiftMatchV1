import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 1000), // Question appears
      setTimeout(() => setPhase(99), 2500), // Timer ticks
      setTimeout(() => setPhase(99), 5000), // Selects option
      setTimeout(() => setPhase(99), 6500), // Next question
      setTimeout(() => setPhase(99), 10500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-900 flex items-center justify-center p-12"
      initial={{ opacity: 0, clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ opacity: 1, clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute top-12 left-12">
        <motion.h2 
          className="text-[2.5vw] font-display font-black text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          2. The Assessment
        </motion.h2>
      </div>

      <div className="w-[70vw] h-[45vw] bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative flex flex-col p-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={`h-2 w-12 rounded-full ${i===1 ? 'bg-accent' : 'bg-slate-700'}`} />
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-slate-700 px-6 py-3 rounded-full">
            <span className="text-slate-400">⏱️ Time left</span>
            <motion.span 
              className="text-white font-mono font-bold text-xl"
              animate={phase >= 2 ? { color: ["#fff", "#EF4444", "#fff"] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              01:42
            </motion.span>
          </div>
        </div>

        {/* Question */}
        <motion.div 
          className="max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <span className="text-accent font-bold text-xl mb-4 block">Knowledge Section • Q1/15</span>
          <h3 className="text-4xl text-white font-bold leading-tight mb-12">
            In React, what is the primary purpose of the useEffect hook's dependency array?
          </h3>

          <div className="flex flex-col gap-4">
            {[
              "To force the component to re-render when dependencies change.",
              "To control when the effect function should execute.",
              "To store state variables that shouldn't trigger re-renders.",
              "To automatically fetch data from the server."
            ].map((opt, i) => (
              <motion.div
                key={i}
                className={`p-6 border-2 rounded-xl text-xl font-medium transition-colors ${
                  phase >= 3 && i === 1 
                    ? 'border-accent bg-accent/20 text-white' 
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 ${phase >= 3 && i === 1 ? 'border-accent bg-accent' : 'border-slate-500'}`} />
                  {opt}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Button */}
        <motion.div 
          className="absolute bottom-12 right-12 px-10 py-4 bg-[var(--color-primary)] rounded-lg text-white font-bold text-xl flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Next Question <span>→</span>
        </motion.div>

        {/* Simulated wipe for next question */}
        {phase >= 4 && (
          <motion.div 
            className="absolute inset-0 bg-slate-900 z-10"
            initial={{ left: "100%" }}
            animate={{ left: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>
    </motion.div>
  );
}