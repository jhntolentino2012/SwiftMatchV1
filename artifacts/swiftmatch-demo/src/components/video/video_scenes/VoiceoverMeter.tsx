import { motion } from 'framer-motion';

export function VoiceoverMeter({ currentScene }: { currentScene: number }) {
  return (
    <motion.div 
      className="absolute bottom-12 left-12 flex items-end gap-1 h-8 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-accent rounded-full"
          animate={{
            height: ['20%', '80%', '40%', '100%', '30%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
      <span className="ml-4 font-mono text-[1vw] text-muted-foreground font-semibold">NARRATION</span>
    </motion.div>
  );
}