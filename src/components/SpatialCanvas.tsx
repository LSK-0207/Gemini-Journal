import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Feather, AlertCircle, LayoutTemplate, Dices } from 'lucide-react';
import { getRandomPlaceholder } from '../data/fragmentPool';
import { LoopingStarters } from './LoopingStarters';

interface SpatialCanvasProps {
  onGenerate: (rawFragments: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onSwitchToChat?: () => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  onGenerate,
  isLoading,
  errorMessage,
  onClearError,
  onSwitchToChat,
}) => {
  // Empty initial text as requested, with a soft faded placeholder
  const [fragments, setFragments] = useState<string>('');
  const [placeholderText, setPlaceholderText] = useState<string>(() => getRandomPlaceholder());

  const handleShufflePlaceholder = () => {
    setPlaceholderText(getRandomPlaceholder());
  };

  const lineCount = fragments
    .split('\n')
    .filter((line) => line.trim().length > 0).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fragments.trim() || isLoading) return;
    onClearError();
    await onGenerate(fragments);
  };

  const addStarter = (starterText: string) => {
    setFragments((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n- ${starterText}` : `- ${starterText}`;
    });
  };

  const useSampleAsInput = () => {
    setFragments(placeholderText);
  };

  return (
    <motion.div
      id="spatial-canvas-container"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Intro Header */}
      <div className="text-center mb-8 sm:mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-700/80 text-amber-950 dark:text-amber-200 text-xs font-semibold tracking-wide uppercase mb-3 shadow-2xs backdrop-blur-xs transition-colors"
        >
          <Feather className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span>Spatial Canvas &bull; Unstructured Thought Dump</span>
        </motion.div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          Pour Your Mind Onto Paper
        </h2>
        <p className="mt-3 text-stone-600 dark:text-stone-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          No prose or grammar required — just dump raw thoughts.
          Gemini extracts emotional motifs into a template-constrained spec, composited deterministically
          at zero marginal cost into tactile memory flash cards.
        </p>
      </div>

      {/* Error Banner with Retry */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            id="error-banner"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-rose-50/95 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 flex items-start gap-3.5 text-rose-950 dark:text-rose-200 shadow-xs overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Something went wrong</h4>
              <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1">{errorMessage}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => onGenerate(fragments)}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer min-h-[38px]"
            >
              Retry
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Box (Important Section: Cream-colored with paper texture) */}
      <div className="relative rounded-3xl cream-textured-paper border border-amber-300/80 shadow-2xl overflow-hidden p-6 sm:p-10">
        {/* Decorative Washi Tapes */}
        <div className="absolute top-2.5 left-4 w-32 h-6 bg-amber-200/80 -rotate-2 rounded-xs border border-amber-300/70 shadow-xs pointer-events-none" />
        <div className="absolute top-2.5 right-4 w-32 h-6 bg-yellow-200/80 rotate-2 rounded-xs border border-yellow-300/70 shadow-xs pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Target Template Info Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#efe4d2]/85 border border-amber-300/70 text-amber-950 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold font-serif uppercase tracking-wider block text-amber-950">
                  Template Library: 5 Aesthetic Vibes &bull; Auto-Orientation
                </span>
                <span className="text-xs text-amber-900/85 block mt-0.5">
                  Sunlit Botanical, Sage Affirmation, Dusty Rose, Dark Academia, Kraft Vintage
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs font-semibold bg-stone-200/90 text-stone-900 px-3 py-1 rounded-full shadow-2xs">
                {fragments.length < 350 ? 'Horizontal (<350 ch)' : 'Vertical (350+ ch)'}
              </span>
              <span className="text-xs font-semibold bg-amber-300/80 text-amber-950 px-3 py-1 rounded-full shadow-2xs">
                Zero-Cost Compositor
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-stone-700 mb-2.5 font-medium">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-stone-900">Raw Thought Stream</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#eee5d3] text-stone-800 text-xs font-medium">
                  {lineCount} {lineCount === 1 ? 'fragment' : 'fragments'}
                </span>
                {!fragments && (
                  <button
                    type="button"
                    onClick={handleShufflePlaceholder}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-900 hover:text-amber-950 font-medium hover:underline cursor-pointer min-h-[34px] px-1"
                    title="Change placeholder inspiration"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Change Prompt</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                {!fragments && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={useSampleAsInput}
                    className="text-xs text-amber-950 font-semibold px-3 py-1.5 rounded-lg bg-amber-200/90 hover:bg-amber-300/90 transition-colors shadow-2xs cursor-pointer min-h-[34px] flex items-center"
                  >
                    Insert Sample
                  </motion.button>
                )}
                <span className="text-xs text-stone-600 font-medium">{fragments.length} / 8000</span>
              </div>
            </div>
            <div className="relative rounded-2xl border border-amber-300/80 bg-[#f6efe1] focus-within:border-amber-700 focus-within:ring-3 focus-within:ring-amber-300/50 transition-all shadow-inner">
              <textarea
                id="spatial-canvas-textarea"
                value={fragments}
                onChange={(e) => setFragments(e.target.value)}
                rows={9}
                placeholder={placeholderText}
                className="w-full p-4 sm:p-6 text-stone-900 text-base leading-relaxed bg-transparent resize-y outline-none font-sans placeholder:text-stone-500 placeholder:italic placeholder:font-sans transition-all"
              />
            </div>
          </div>

          {/* Quick Starters & Prompt Inspiration (Fading 4-item Looping Sets across all Vibes) */}
          <div className="pt-2">
            <LoopingStarters onAddStarter={addStarter} />
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-amber-200/80">
            {onSwitchToChat ? (
              <button
                type="button"
                onClick={onSwitchToChat}
                className="inline-flex items-center gap-2 text-xs font-semibold text-stone-700 hover:text-stone-950 underline decoration-amber-400 underline-offset-4 cursor-pointer"
              >
                <span>Prefer a guided conversation? Chat with AI companion &rarr;</span>
              </button>
            ) : <div />}

            <motion.button
              id="compose-scrapbook-btn"
              type="submit"
              disabled={isLoading || !fragments.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-semibold text-base text-amber-50 bg-[#35271c] hover:bg-[#261c14] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl transition-all cursor-pointer min-h-[50px] whitespace-nowrap border border-amber-900/40"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Formatting Memory Flash Card...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Compose Memory Flash Card</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

