import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(99);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(99), 500),
      setTimeout(() => setPhase(99), 2000),
      setTimeout(() => setPhase(99), 4000),
      setTimeout(() => setPhase(99), 6000),
      setTimeout(() => setPhase(99), 8500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-slate-50 flex items-center justify-center p-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute top-12 left-12">
        <motion.h2 
          className="text-[2.5vw] font-display font-black text-[var(--color-primary)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          1. The Jobseeker Experience
        </motion.h2>
      </div>

      <div className="w-[60vw] h-[40vw] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col">
        {/* Mockup Header */}
        <div className="h-12 border-b border-slate-100 flex items-center px-6 gap-2 bg-slate-50">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <div className="ml-4 h-6 w-48 bg-slate-200 rounded-md" />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-12 flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {phase < 3 ? (
              <motion.div 
                key="signup"
                className="w-full max-w-md mx-auto flex flex-col gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-800">Complete your profile</h3>
                  <p className="text-slate-500">Apply for Frontend Developer</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-12 w-full border-2 border-slate-200 rounded-lg flex items-center px-4">
                    <motion.div 
                      className="h-4 bg-slate-800 rounded"
                      initial={{ width: 0 }}
                      animate={phase >= 1 ? { width: "60%" } : { width: 0 }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                <motion.div 
                  className="h-12 w-full bg-[var(--color-primary)] rounded-lg mt-4 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  animate={phase >= 2 ? { scale: [1, 1.05, 1], backgroundColor: "var(--color-accent)" } : {}}
                >
                  <span className="text-white font-bold">Start Assessment</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                key="assessments"
                className="w-full h-full flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-3xl font-bold text-slate-800">Your Assessments</h3>
                    <p className="text-slate-500 text-lg">5 sections remaining</p>
                  </div>
                  <div className="text-[var(--color-accent)] font-bold text-xl">45 mins total</div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {["Knowledge", "Personality", "Cultural Fit", "Critical Thinking"].map((test, i) => (
                    <motion.div 
                      key={test}
                      className="border-2 border-slate-100 rounded-xl p-6 flex justify-between items-center"
                      initial={{ opacity: 0, x: 20 }}
                      animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-400">{i+1}</div>
                        <span className="text-xl font-bold text-slate-700">{test} Test</span>
                      </div>
                      <div className="px-6 py-2 bg-slate-100 text-slate-500 rounded-full font-bold">10 mins</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mouse Cursor */}
          <motion.div 
            className="absolute w-6 h-6 border-2 border-white rounded-full bg-black/50 z-50 pointer-events-none"
            initial={{ x: "80%", y: "80%" }}
            animate={
              phase === 1 ? { x: "50%", y: "45%" } :
              phase === 2 ? { x: "50%", y: "75%", scale: 0.8 } :
              phase >= 3 ? { x: "80%", y: "30%" } :
              { x: "80%", y: "80%" }
            }
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

        </div>
      </div>
    </motion.div>
  );
}

