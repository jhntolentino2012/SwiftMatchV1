import { motion } from 'framer-motion';

const INDUSTRIES = [
  "BPO", "Healthcare", "IT/Software", "Retail", "Hospitality", 
  "Construction", "Manufacturing", "Education", "Finance", "Logistics", 
  "Agriculture", "Government", "Maritime", "Creative & Media", "F&B", 
  "Real Estate", "Energy", "Telecom", "Legal", "Public Safety"
];

export function Scene8() {
  // We duplicate the array to create a seamless marquee loop
  const marqueeItems1 = [...INDUSTRIES.slice(0, 10), ...INDUSTRIES.slice(0, 10)];
  const marqueeItems2 = [...INDUSTRIES.slice(10, 20), ...INDUSTRIES.slice(10, 20)];

  return (
    <motion.div 
      className="absolute inset-0 bg-[var(--color-primary)] flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>

      <motion.div 
        className="text-center z-10 mb-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <h2 className="text-[4vw] font-display font-black text-white">20 Industries.</h2>
        <h3 className="text-[3vw] font-sans font-medium text-accent mt-2">One Unified Platform.</h3>
      </motion.div>

      {/* Marquee 1 (Moves Left) */}
      <div className="w-full overflow-hidden flex whitespace-nowrap mb-6 py-4">
        <motion.div 
          className="flex gap-6 px-3"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {marqueeItems1.map((item, i) => (
            <div key={i} className="px-8 py-4 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-2xl whitespace-nowrap">
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee 2 (Moves Right) */}
      <div className="w-full overflow-hidden flex whitespace-nowrap py-4">
        <motion.div 
          className="flex gap-6 px-3"
          initial={{ x: "-50%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {marqueeItems2.map((item, i) => (
            <div key={i} className="px-8 py-4 rounded-full border-2 border-accent/40 bg-accent/10 backdrop-blur-sm text-white font-bold text-2xl whitespace-nowrap">
              {item}
            </div>
          ))}
        </motion.div>
      </div>

    </motion.div>
  );
}