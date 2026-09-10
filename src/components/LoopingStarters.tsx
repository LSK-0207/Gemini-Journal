import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, RefreshCw, Sparkles, Compass } from 'lucide-react';
import { getStarterQuads, type StarterQuad } from '../data/fragmentPool';

interface LoopingStartersProps {
  onAddStarter: (starterText: string) => void;
}

export const LoopingStarters: React.FC<LoopingStartersProps> = ({ onAddStarter }) => {
  const [quads] = useState<StarterQuad[]>(() => getStarterQuads());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance loop every 4.5 seconds unless paused on user hover/interaction
  useEffect(() => {
    if (isPaused || quads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quads.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, quads.length]);

  const currentQuad = quads[currentIndex] || quads[0];

  const handleNextQuad = () => {
    setCurrentIndex((prev) => (prev + 1) % quads.length);
  };

  return (
    <div
      className="space-y-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header bar with vibe indicator, loop counter, and manual next */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-900 uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Fragment Starters</span>
          <span className="text-stone-400 font-normal">|</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${currentQuad.badgeColor}`}>
            {currentQuad.moodLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Visual dot indicator for pagination across vibes */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-200/50">
            {quads.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'bg-amber-900 scale-125'
                    : 'bg-amber-400/80 hover:bg-amber-600'
                }`}
                title={`Vibe: ${q.moodLabel}`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            id="shuffle-starters-btn"
            onClick={handleNextQuad}
            className="inline-flex items-center gap-1.5 text-xs text-amber-950 font-semibold px-3.5 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 border border-amber-300/80 transition-colors cursor-pointer min-h-[36px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next Vibe</span>
          </motion.button>
        </div>
      </div>

      {/* Animated 4-Starter Deck with Fade Transition */}
      <div className="relative min-h-[96px] sm:min-h-[88px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuad.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
          >
            {currentQuad.starters.map((starter, i) => (
              <motion.button
                key={`${currentQuad.id}-${starter}-${i}`}
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onAddStarter(starter)}
                className="text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-[#f3ebd9] hover:bg-amber-100 hover:border-amber-400 hover:text-amber-950 text-stone-900 transition-all border border-amber-200/90 text-left shadow-2xs cursor-pointer flex items-center gap-2 group min-h-[42px]"
              >
                <span className="text-amber-700 font-bold group-hover:scale-125 transition-transform shrink-0">
                  +
                </span>
                <span className="line-clamp-2">{starter}</span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Auto-cycling through all 5 mood vibes &bull; Hover to pause
        </span>
        <span>
          Vibe {currentIndex + 1} of {quads.length}
        </span>
      </div>
    </div>
  );
};
