import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  FileText,
  Quote,
  Filter,
} from 'lucide-react';
import type { SavedInteraction } from '../types';
import { NotionPageView } from './NotionPageView';
import { DownloadImageMenu } from './DownloadImageMenu';
import { getSafeMemorySvg } from '../utils/svgRenderer';

interface StackedDeckViewProps {
  interactions: SavedInteraction[];
  onSelectInteraction: (interaction: SavedInteraction) => void;
  onPromptDelete: (interaction: SavedInteraction, e: React.MouseEvent) => void;
  onDownloadSvg?: (interaction: SavedInteraction) => void;
}

type CategoryType = 'all' | 'mood' | 'date';

export const StackedDeckView: React.FC<StackedDeckViewProps> = ({
  interactions,
  onSelectInteraction,
  onPromptDelete,
  onDownloadSvg,
}) => {
  const [categoryType, setCategoryType] = useState<CategoryType>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // Derive available categories
  const moodList = useMemo(() => {
    const set = new Set<string>();
    interactions.forEach((item) => {
      if (item.mood) set.add(item.mood.toLowerCase());
    });
    return Array.from(set);
  }, [interactions]);

  // Filter interactions based on selected categories
  const deck = useMemo(() => {
    let list = [...interactions];

    if (categoryType === 'mood' && selectedSubCategory !== 'all') {
      list = list.filter((item) => (item.mood || '').toLowerCase() === selectedSubCategory.toLowerCase());
    } else if (categoryType === 'date') {
      const now = new Date();
      if (selectedSubCategory === 'this_month') {
        list = list.filter((item) => {
          if (!item.createdAt) return false;
          const d = new Date(item.createdAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      } else if (selectedSubCategory === 'recent_7') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        list = list.filter((item) => item.createdAt && new Date(item.createdAt) >= sevenDaysAgo);
      }
    }

    return list;
  }, [interactions, categoryType, selectedSubCategory]);

  // Reset index when sub-category changes
  const handleCategoryChange = (cat: CategoryType, sub: string = 'all') => {
    setCategoryType(cat);
    setSelectedSubCategory(sub);
    setCurrentIndex(0);
    setFlippedCardId(null);
  };

  const total = deck.length;
  const isEnd = currentIndex >= total;
  const currentCard = deck[currentIndex];

  const handleNext = () => {
    if (currentIndex < total) {
      setCurrentIndex((prev) => prev + 1);
      setFlippedCardId(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setFlippedCardId(null);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setFlippedCardId(null);
  };

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="stacked-deck-view" className="w-full flex flex-col items-center">
      {/* Category Selection Bar (Important: Cream Textured Paper) */}
      <div className="w-full max-w-2xl cream-textured-paper border border-amber-300/80 rounded-2xl p-3 sm:p-4 mb-8 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300/60 pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider text-amber-950">
            <Filter className="w-3.5 h-3.5 text-amber-800" />
            <span>Deck Sorting &amp; Categories</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#eee3cf] p-1 rounded-xl border border-amber-300/60">
            <button
              type="button"
              onClick={() => handleCategoryChange('all', 'all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer min-h-[32px] ${
                categoryType === 'all'
                  ? 'bg-[#faf6ee] text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              All ({interactions.length})
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('mood', moodList[0] || 'all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer min-h-[32px] ${
                categoryType === 'mood'
                  ? 'bg-[#faf6ee] text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              By Mood &amp; Vibe
            </button>
            <button
              type="button"
              onClick={() => handleCategoryChange('date', 'this_month')}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer min-h-[32px] ${
                categoryType === 'date'
                  ? 'bg-[#faf6ee] text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              By Date
            </button>
          </div>
        </div>

        {/* Sub Category Pills */}
        {categoryType === 'mood' && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSelectedSubCategory('all')}
              className={`text-xs px-3 py-1 rounded-lg capitalize transition-all cursor-pointer min-h-[30px] ${
                selectedSubCategory === 'all'
                  ? 'bg-amber-900 text-amber-100 font-semibold shadow-xs'
                  : 'bg-[#f4ebd9] text-stone-800 hover:bg-[#ebdcc4] border border-amber-200'
              }`}
            >
              All Moods
            </button>
            {moodList.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setSelectedSubCategory(m);
                  setCurrentIndex(0);
                }}
                className={`text-xs px-3 py-1 rounded-lg capitalize transition-all cursor-pointer min-h-[30px] ${
                  selectedSubCategory === m
                    ? 'bg-amber-900 text-amber-100 font-semibold shadow-xs'
                    : 'bg-[#f4ebd9] text-stone-800 hover:bg-[#ebdcc4] border border-amber-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {categoryType === 'date' && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setSelectedSubCategory('this_month');
                setCurrentIndex(0);
              }}
              className={`text-xs px-3 py-1 rounded-lg transition-all cursor-pointer min-h-[30px] ${
                selectedSubCategory === 'this_month'
                  ? 'bg-amber-900 text-amber-100 font-semibold shadow-xs'
                  : 'bg-[#f4ebd9] text-stone-800 hover:bg-[#ebdcc4] border border-amber-200'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSubCategory('recent_7');
                setCurrentIndex(0);
              }}
              className={`text-xs px-3 py-1 rounded-lg transition-all cursor-pointer min-h-[30px] ${
                selectedSubCategory === 'recent_7'
                  ? 'bg-amber-900 text-amber-100 font-semibold shadow-xs'
                  : 'bg-[#f4ebd9] text-stone-800 hover:bg-[#ebdcc4] border border-amber-200'
              }`}
            >
              Past 7 Days
            </button>
          </div>
        )}
      </div>

      {/* Main Deck Container */}
      <div className="relative w-full max-w-md h-[490px] sm:h-[510px] flex items-center justify-center select-none">
        {total === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-stone-200 shadow-sm">
            <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-stone-800 text-lg">No Cards in this Category</h4>
            <p className="text-xs text-stone-500 mt-1">Try switching to another mood category or view all memories.</p>
          </div>
        ) : isEnd ? (
          /* End of Deck Card */
          <div className="w-full h-full rounded-3xl bg-linear-to-b from-[#fdfbf7] to-[#f4ede1] border-2 border-dashed border-amber-300 p-8 flex flex-col items-center justify-center text-center shadow-lg animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4 shadow-xs">
              <Sparkles className="w-7 h-7 text-amber-700" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-stone-900">
              You've Revisited All Cards!
            </h3>
            <p className="text-sm text-stone-600 max-w-xs mt-2 leading-relaxed">
              You reviewed all {total} memories in this deck. Take a breath, smile at your journey, or shuffle the pack again.
            </p>
            <button
              type="button"
              id="deck-replay-btn"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium shadow-md transition-all"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              <span>Shuffle &amp; Revisit Deck</span>
            </button>
          </div>
        ) : (
          /* Stacked Cards Visualization (Top 3 Cards) */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Card 3 (Bottom) */}
            {deck[currentIndex + 2] && (
              <div
                className="absolute w-full h-full rounded-3xl bg-white border border-stone-200/70 shadow-sm pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(24px) scale(0.90) rotate(-2deg)',
                  zIndex: 10,
                  opacity: 0.5,
                }}
              />
            )}

            {/* Card 2 (Middle) */}
            {deck[currentIndex + 1] && (
              <div
                className="absolute w-full h-full rounded-3xl bg-[#fbf7ee] border border-amber-300/70 shadow-md pointer-events-none transition-all duration-300"
                style={{
                  transform: 'translateY(12px) scale(0.95) rotate(2deg)',
                  zIndex: 20,
                  opacity: 0.85,
                }}
              />
            )}

            {/* Card 1 (Top Active Card with Drag & Swipe) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -90) {
                    // Swiped left: Next card
                    handleNext();
                  } else if (info.offset.x > 90) {
                    // Swiped right: Next card (cherish / revisit next)
                    handleNext();
                  }
                }}
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ x: 250, opacity: 0, rotate: 12, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute w-full h-full rounded-3xl cream-textured-paper border-2 border-amber-300/90 shadow-2xl overflow-hidden flex flex-col cursor-grab active:cursor-grabbing z-30"
              >
                {/* Washi Tape Header Decal */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-amber-300/70 -rotate-1 rounded-xs border border-amber-400/40 pointer-events-none z-20 shadow-2xs" />

                {/* Card Top Info Bar */}
                <div className="pt-7 px-5 pb-2.5 flex items-center justify-between border-b border-amber-300/60 bg-[#fbf6ed]">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#eee3cf] text-stone-900 flex items-center gap-1 border border-amber-200">
                      <Calendar className="w-3 h-3 text-stone-600" />
                      {currentCard.createdAt
                        ? new Date(currentCard.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                    {currentCard.mood && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-200/90 text-amber-950 border border-amber-300 capitalize">
                        {currentCard.mood}
                      </span>
                    )}
                  </div>

                  {/* Flip between Memory Flash Card & Thought Codex */}
                  <button
                    type="button"
                    onClick={(e) => toggleFlip(currentCard.id, e)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#efe4d0] hover:bg-[#e4d6bf] text-stone-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer min-h-[32px] border border-amber-300/60"
                  >
                    <RotateCcw className={`w-3 h-3 text-amber-800 transition-transform duration-500 ${flippedCardId === currentCard.id ? 'rotate-180' : ''}`} />
                    <span>{flippedCardId === currentCard.id ? 'Memory Card' : 'Thought Codex'}</span>
                  </button>
                </div>

                {/* Card Body with 3D Flip (Front: SVG, Back: Thought Codex) */}
                <div
                  className="flex-1 p-2 sm:p-3 bg-[#fdfaf3] overflow-hidden flex flex-col items-center justify-center relative w-full"
                  style={{ perspective: 1200 }}
                >
                  <motion.div
                    className="w-full h-full relative"
                    animate={{ rotateY: flippedCardId === currentCard.id ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: [0.35, 0.15, 0.15, 1] }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* FRONT FACE: Memory Flash Card - Click to flip to Thought Codex */}
                    <div
                      onClick={() => setFlippedCardId(currentCard.id)}
                      className={`absolute inset-0 w-full h-full rounded-2xl bg-[#fefcf8] border border-amber-200/80 shadow-inner flex items-center justify-center p-2 overflow-hidden ${
                        flippedCardId === currentCard.id ? 'pointer-events-none' : 'cursor-pointer group'
                      }`}
                      style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      title="Click card to flip to Thought Codex"
                    >
                      <div
                        className="w-full h-full drop-shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01] [&>svg]:max-h-[360px] [&>svg]:w-auto [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:object-contain pointer-events-none"
                        dangerouslySetInnerHTML={{ __html: getSafeMemorySvg(currentCard) }}
                      />

                      {/* Flip Hint Badge */}
                      <div className="absolute bottom-2.5 right-3 opacity-80 group-hover:opacity-100 transition-opacity bg-stone-950/70 backdrop-blur-xs text-amber-200 text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 pointer-events-none">
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Click to flip</span>
                      </div>
                    </div>

                    {/* BACK FACE: Clean Read-Only Thought Codex Page */}
                    <div
                      onClick={(e) => {
                        // Clicking inside raw input / Thought Codex does NOT flip the card
                        e.stopPropagation();
                      }}
                      className={`absolute inset-0 w-full h-full cursor-default ${
                        flippedCardId !== currentCard.id ? 'pointer-events-none' : ''
                      }`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <NotionPageView
                        memory={currentCard}
                        maxHeightClass="max-h-[360px]"
                        onFlipBack={() => setFlippedCardId(null)}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-[#fbf6ed] border-t border-amber-300/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id={`deck-inspect-${currentCard.id}`}
                      onClick={() => onSelectInteraction(currentCard)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#35271c] hover:bg-[#261c14] text-amber-100 text-xs font-semibold shadow-xs transition-colors min-h-[36px] cursor-pointer border border-amber-900/40"
                      title="Inspect Full Screen"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Inspect</span>
                    </button>

                    <DownloadImageMenu memory={currentCard} compact />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-600 font-medium">
                      {currentIndex + 1} / {total}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => onPromptDelete(currentCard, e)}
                      className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-100/60 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Selector Controls Bar (Dating App Style Prev / Swipe / Next) */}
      {total > 0 && !isEnd && (
        <div className="mt-8 flex items-center gap-5 sm:gap-6">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            id="deck-prev-btn"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3.5 rounded-full bg-[#f2e7d5] dark:bg-[#342a22] hover:bg-[#e7dabf] dark:hover:bg-[#3f332a] text-stone-800 dark:text-amber-200 disabled:opacity-35 disabled:cursor-not-allowed border border-amber-300/80 dark:border-amber-800/80 shadow-md transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            title="Previous Card"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-linear-to-r from-amber-900 to-stone-900 hover:from-amber-950 hover:to-black text-amber-100 font-semibold shadow-lg hover:shadow-xl transition-all text-sm min-h-[48px] cursor-pointer whitespace-nowrap border border-amber-800/40"
          >
            <Heart className="w-4 h-4 text-rose-300 fill-rose-300 shrink-0" />
            <span>Revisit Next Memory</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            id="deck-reset-btn"
            onClick={handleReset}
            className="p-3.5 rounded-full bg-[#f2e7d5] dark:bg-[#342a22] hover:bg-[#e7dabf] dark:hover:bg-[#3f332a] text-stone-800 dark:text-amber-200 border border-amber-300/80 dark:border-amber-800/80 shadow-md transition-all min-h-[48px] min-w-[48px] flex items-center justify-center cursor-pointer"
            title="Start from Beginning"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      {/* Swipe Hint Helper */}
      {total > 0 && !isEnd && (
        <p className="text-xs text-stone-500 dark:text-stone-300 mt-3.5 flex items-center gap-1 font-medium transition-colors">
          <span>Tip: Drag or swipe card horizontally or use next button</span>
        </p>
      )}
    </div>
  );
};
