import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import type { SavedInteraction } from '../types';
import { NotionPageView } from './NotionPageView';
import { getTemplate } from '../templates';
import { getSafeMemorySvg } from '../utils/svgRenderer';

interface FlippableScrapbookCardProps {
  memory: SavedInteraction;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  showToggleInHeader?: boolean;
  className?: string;
  maxHeightVh?: number;
}

export const FlippableScrapbookCard: React.FC<FlippableScrapbookCardProps> = ({
  memory,
  isFlipped: controlledFlipped,
  onFlipChange,
  showToggleInHeader = true,
  className = '',
  maxHeightVh = 72,
}) => {
  const [internalFlipped, setInternalFlipped] = useState<boolean>(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleToggleFlip = () => {
    const next = !isFlipped;
    if (onFlipChange) {
      onFlipChange(next);
    } else {
      setInternalFlipped(next);
    }
  };

  const templateId = memory.templateId || memory.designSpec?.template_id || 'sunlit-botanical-horizontal';
  const template = getTemplate(templateId);
  const isVertical = template.orientation === 'vertical';
  const aspectRatio = template.width / template.height;

  const safeSvg = getSafeMemorySvg(memory, {
    className: 'w-full h-full object-contain block',
    style: 'width: 100%; height: 100%; max-width: 100%; max-height: 100%; display: block;',
  });

  return (
    <div
      id={`flippable-card-${memory.id || 'current'}`}
      className={`relative w-full h-full min-h-[300px] sm:min-h-[440px] mx-auto flex flex-col items-center justify-center ${className}`}
      style={{ perspective: 1400 }}
    >
      {/* Flip Bar Controls (optional header if modal doesn't have one) */}
      {showToggleInHeader && (
        <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-3 px-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-semibold text-stone-300">
              {isFlipped ? 'Thought Codex ✦ Archival View' : 'Memory Flash Card View'}
            </span>
          </div>

          <button
            type="button"
            id="toggle-card-flip-btn"
            onClick={handleToggleFlip}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 text-xs font-semibold shadow-xs border border-stone-700 hover:border-amber-400/40 transition-all cursor-pointer min-h-[38px]"
          >
            <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            <span>{isFlipped ? 'Flip to Memory Flash Card' : 'Flip to Thought Codex'}</span>
          </button>
        </div>
      )}

      {/* 3D Rotating Container - Fills the Full Display Window */}
      <div className="w-full h-full relative flex-1 min-h-0">
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.35, 0.15, 0.15, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT FACE: Fully Rendered Scrapbook Page (SVG) - Readable scale with smooth scrolling */}
          <div
            className={`absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin select-none ${
              !isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="min-h-full w-full py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-start">
              <div
                onClick={!isFlipped ? handleToggleFlip : undefined}
                className={`relative w-full ${
                  isVertical ? 'max-w-[620px] sm:max-w-[680px]' : 'max-w-[880px]'
                } rounded-2xl drop-shadow-2xl overflow-hidden bg-[#faf5ea] border border-stone-200/90 transition-transform duration-200 ${
                  !isFlipped ? 'cursor-pointer hover:scale-[1.006]' : ''
                }`}
                style={{
                  aspectRatio: `${template.width} / ${template.height}`,
                }}
                title={!isFlipped ? 'Click card to flip to Thought Codex' : undefined}
              >
                <div
                  className="w-full h-full flex items-center justify-center relative [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain [&>svg]:block"
                  dangerouslySetInnerHTML={{ __html: safeSvg }}
                />

                {/* Floating cue to flip */}
                <div className="absolute bottom-3 right-4 opacity-85 hover:opacity-100 transition-opacity bg-stone-900/80 backdrop-blur-xs text-amber-200 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none z-20">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Click to flip</span>
                </div>
              </div>

              {/* Helpful footer guidance */}
              <p className="mt-3 text-xs text-stone-400 font-sans text-center select-none">
                ✦ Click card to flip between Memory Flash Card &amp; Thought Codex &bull; Scroll to inspect full artwork
              </p>
            </div>
          </div>

          {/* BACK FACE: Clean Read-Only Thought Codex Page - Full Width & Scrollable */}
          <div
            onClick={(e) => {
              // Clicking inside raw input view does not flip the card
              e.stopPropagation();
            }}
            className={`absolute inset-0 w-full h-full overflow-y-auto scrollbar-thin cursor-default ${
              isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="min-h-full w-full py-4 sm:py-6 px-2 sm:px-4 flex items-start justify-center">
              <div className="w-full max-w-4xl mx-auto">
                <NotionPageView
                  memory={memory}
                  onFlipBack={handleToggleFlip}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
