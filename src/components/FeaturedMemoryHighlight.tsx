import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Calendar, Heart, ChevronLeft, ChevronRight, BookOpen, Quote } from 'lucide-react';
import type { SavedInteraction } from '../types';
import { getSafeMemorySvg } from '../utils/svgRenderer';

interface FeaturedMemoryHighlightProps {
  interactions: SavedInteraction[];
  onSelectMemory: (memory: SavedInteraction) => void;
}

export const FeaturedMemoryHighlight: React.FC<FeaturedMemoryHighlightProps> = ({
  interactions,
  onSelectMemory,
}) => {
  // If user has no cards, strictly do not render at all
  if (!interactions || interactions.length === 0) {
    return null;
  }

  // Filter or prioritize memories for "Best Memory of the Month / Week"
  const candidates = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. First attempt: memories created in the current month
    const thisMonth = interactions.filter((item) => {
      if (!item.createdAt) return false;
      const d = new Date(item.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (thisMonth.length > 0) {
      // Sort by richness (content length of raw thoughts or gratitude list items) then recency
      return [...thisMonth].sort((a, b) => {
        const scoreA = (a.rawFragments?.length || 0) + (a.designSpec?.gratitude_list?.length || 0) * 40;
        const scoreB = (b.rawFragments?.length || 0) + (b.designSpec?.gratitude_list?.length || 0) * 40;
        return scoreB - scoreA;
      });
    }

    // 2. Second attempt: past 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recent = interactions.filter((item) => {
      if (!item.createdAt) return false;
      return new Date(item.createdAt) >= thirtyDaysAgo;
    });

    if (recent.length > 0) {
      return recent;
    }

    // 3. Fallback: all available interactions sorted by date descending
    return [...interactions].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [interactions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = candidates.length;

  // Slideshow auto-advance every 6 seconds when 2 or more cards exist and not paused
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  // Safe boundary check
  const activeMemory = candidates[currentIndex] || candidates[0];
  if (!activeMemory) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Determine period label
  const formattedDate = activeMemory.createdAt
    ? new Date(activeMemory.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Memory';

  const isCurrentMonth = activeMemory.createdAt
    ? new Date(activeMemory.createdAt).getMonth() === new Date().getMonth()
    : false;

  const periodBadge = isCurrentMonth ? 'Best Memory of the Month' : 'Featured Highlight';

  return (
    <motion.div
      id="featured-memory-highlight"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-8 sm:mb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl cream-textured-paper border border-amber-300/80 shadow-md hover:shadow-lg p-6 sm:p-8 overflow-hidden transition-all">
        {/* Subtle Decorative Paper Accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-rose-200/25 rounded-full blur-2xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-200/80 text-amber-900 border border-amber-300/80 shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 text-amber-800" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-amber-950">
                  {periodBadge}
                </span>
                {total > 1 && (
                  <span className="text-[11px] font-semibold bg-amber-200/90 text-amber-950 px-2.5 py-0.5 rounded-full">
                    {currentIndex + 1} of {total} highlights
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-sans">
                Revisit your most evocative reflection and mindful moments
              </p>
            </div>
          </div>

          {/* Slideshow Controls (only if 2+ cards) */}
          {total > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                id="featured-slideshow-prev"
                onClick={handlePrev}
                aria-label="Previous Highlight"
                className="p-2 rounded-xl bg-[#f2e7d5] hover:bg-[#e7dabf] text-stone-800 border border-amber-300/70 shadow-xs transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <div className="flex items-center gap-1.5 px-1.5">
                {candidates.slice(0, Math.min(total, 5)).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 bg-amber-800'
                        : 'w-2 bg-amber-300/80 hover:bg-amber-400'
                    }`}
                  />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                id="featured-slideshow-next"
                onClick={handleNext}
                aria-label="Next Highlight"
                className="p-2 rounded-xl bg-[#f2e7d5] hover:bg-[#e7dabf] text-stone-800 border border-amber-300/70 shadow-xs transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Animated Card Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMemory.id || currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 cursor-pointer group"
            onClick={() => onSelectMemory(activeMemory)}
          >
            {/* Visual SVG Thumbnail */}
            <div className="md:col-span-6 lg:col-span-5 flex items-center justify-center">
              <div className="relative w-full max-w-[340px] h-[220px] sm:h-[240px] bg-[#fdfaf3] rounded-2xl border-2 border-amber-300/80 shadow-md group-hover:shadow-xl p-3 overflow-hidden transition-all duration-300 flex items-center justify-center">
                {/* Washi Tape Decal */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-amber-300/70 -rotate-1 rounded-xs border border-amber-400/50 pointer-events-none z-10 shadow-2xs" />
                <div
                  className="w-full h-full drop-shadow-xs transform group-hover:scale-102 transition-transform duration-300 flex items-center justify-center pointer-events-none [&>svg]:max-h-[200px] [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: getSafeMemorySvg(activeMemory) }}
                />
              </div>
            </div>

            {/* Reflection Details & Excerpt */}
            <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#eee4d2] text-stone-900 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-stone-600" />
                    {formattedDate}
                  </span>
                  {activeMemory.mood && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-200/90 text-amber-950 capitalize border border-amber-300/80 shadow-2xs">
                      Vibe: {activeMemory.mood}
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-amber-950 transition-colors">
                  {activeMemory.designSpec?.title || 'Quiet Moments & Reflections'}
                </h3>

                {activeMemory.designSpec?.feeling_block && (
                  <p className="mt-2.5 text-stone-700 text-sm sm:text-base leading-relaxed line-clamp-3 font-sans">
                    {activeMemory.designSpec.feeling_block}
                  </p>
                )}

                {activeMemory.designSpec?.quote && (
                  <div className="mt-3.5 flex items-start gap-2.5 text-xs sm:text-sm italic text-stone-800 bg-[#f7efe0] border border-amber-300/70 rounded-2xl p-3 shadow-2xs">
                    <Quote className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <span className="font-serif">"{activeMemory.designSpec.quote}"</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-amber-300/60">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-950 font-medium">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
                  <span>Cherished Memory</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  id="featured-inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMemory(activeMemory);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35271c] hover:bg-[#261c14] text-amber-100 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer min-h-[44px] whitespace-nowrap border border-amber-900/40"
                >
                  <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Inspect Memory Card</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
