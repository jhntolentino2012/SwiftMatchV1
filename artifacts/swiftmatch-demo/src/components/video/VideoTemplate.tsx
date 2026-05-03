import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { Scene8 } from './video_scenes/Scene8';
import { Scene9 } from './video_scenes/Scene9';
import { Scene10 } from './video_scenes/Scene10';
import { VoiceoverMeter } from './video_scenes/VoiceoverMeter';

export const SCENE_DURATIONS = {
  hook: 10000,
  reveal: 8000,
  fiveTests: 15000,
  demoCards: 10000,
  demoQuestion: 12000,
  demoResults: 12000,
  demoShortlist: 10000,
  industries: 12000,
  benefits: 12000,
  outro: 10000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: Scene1,
  reveal: Scene2,
  fiveTests: Scene3,
  demoCards: Scene4,
  demoQuestion: Scene5,
  demoResults: Scene6,
  demoShortlist: Scene7,
  industries: Scene8,
  benefits: Scene9,
  outro: Scene10,
};

const SCENE_KEYS = Object.keys(SCENE_DURATIONS);

const BG_X = ['-20%', '30%', '-10%', '50%', '-20%', '10%', '-30%', '40%', '0%', '-20%'];
const BG_Y = ['-10%', '20%', '50%', '10%', '-30%', '40%', '-10%', '30%', '50%', '-10%'];
const BG_SCALE = [1, 1.2, 0.8, 1.1, 0.9, 1.3, 0.8, 1.2, 1, 1.1];
const BG2_RIGHT = ['-10%', '20%', '-30%', '10%', '40%', '-10%', '30%', '-20%', '10%', '-10%'];
const BG2_BOTTOM = ['-20%', '10%', '40%', '-10%', '20%', '50%', '-10%', '30%', '-20%', '10%'];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = SCENE_KEYS.indexOf(baseSceneKey);
  const safeIndex = sceneIndex >= 0 ? sceneIndex : 0;
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[#F8FAFC]">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
        animate={{
          background: safeIndex >= 7 ? 'radial-gradient(circle, var(--color-accent), transparent)' : 'radial-gradient(circle, var(--color-primary), transparent)',
          x: BG_X[safeIndex],
          y: BG_Y[safeIndex],
          scale: BG_SCALE[safeIndex],
        }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        animate={{
          background: safeIndex % 2 === 0 ? 'radial-gradient(circle, var(--color-accent), transparent)' : 'radial-gradient(circle, var(--color-primary), transparent)',
          right: BG2_RIGHT[safeIndex],
          bottom: BG2_BOTTOM[safeIndex],
        }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />

      <VoiceoverMeter currentScene={safeIndex} />

      <AnimatePresence initial={false} mode="wait">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
