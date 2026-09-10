import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookmarkCheck, Download, RefreshCw, AlertCircle, Sparkles, FileText, Bot } from 'lucide-react';
import type { JournalDesignSpec } from '../types';
import { TemplateCompositor, type TemplateCompositorRef } from './compositor/TemplateCompositor';

interface RenderedPageReviewProps {
  spec: JournalDesignSpec;
  rawFragments: string;
  onSaveToLibrary: (renderedSvg: string) => Promise<void>;
  onBackToCanvas: () => void;
  isSaving: boolean;
  saveError: string | null;
  creationSource?: 'canvas' | 'ai_chat';
}

export const RenderedPageReview: React.FC<RenderedPageReviewProps> = ({
  spec,
  rawFragments,
  onSaveToLibrary,
  onBackToCanvas,
  isSaving,
  saveError,
  creationSource,
}) => {
  const compositorRef = useRef<TemplateCompositorRef | null>(null);
  const [svgString, setSvgString] = useState<string>('');
  const [showSpecDetails, setShowSpecDetails] = useState<boolean>(false);

  const handleSave = async () => {
    if (isSaving) return;
    const finalSvg = svgString || (compositorRef.current ? compositorRef.current.getSvgString() : '');
    await onSaveToLibrary(finalSvg);
  };

  const handleDownloadPng = async () => {
    if (compositorRef.current) {
      await compositorRef.current.exportAsPng(`journal-${spec.template_id}.png`);
    }
  };

  return (
    <motion.div
      id="rendered-page-review-container"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
    >
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <motion.button
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onBackToCanvas}
          className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 text-sm font-semibold transition-colors py-2 px-1 cursor-pointer min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Spatial Canvas</span>
        </motion.button>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDownloadPng}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#f0e6d4] hover:bg-[#e7dabf] border border-amber-300/80 text-stone-900 text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer min-h-[44px] whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-stone-700" />
            <span>Export PNG</span>
          </motion.button>

          <motion.button
            id="save-rendered-page-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-amber-100 bg-[#35271c] hover:bg-[#261c14] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[44px] whitespace-nowrap border border-amber-900/40"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Saving to Firestore...</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4 text-amber-200" />
                <span>Save to Memory Library</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Save Error Alert */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-rose-50/95 border border-rose-200 flex items-center justify-between gap-3 text-rose-950 shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-sm font-semibold">Failed to save: {saveError}</span>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl min-h-[36px] shadow-xs cursor-pointer"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Composited Canvas */}
      <div className="mb-8">
        <TemplateCompositor
          ref={compositorRef}
          spec={spec}
          onRenderReady={(markup) => setSvgString(markup)}
        />
      </div>

      {/* Bottom Info Bar & Inspector (Important Section: Cream paper) */}
      <div className="rounded-3xl cream-textured-paper border border-amber-300/80 p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-stone-900">
            <span className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900">
              <Sparkles className="w-4 h-4" />
            </span>
            <h4 className="font-serif font-bold text-sm sm:text-base text-stone-950 flex flex-wrap items-center gap-2">
              <span>Template: "{spec.template_id}"</span>
              <span>&bull;</span>
              <span>Mood: <span className="capitalize">{spec.mood}</span></span>
              {creationSource === 'ai_chat' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <Bot className="w-3 h-3 text-emerald-700" />
                  Created by Chatting with AI
                </span>
              )}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowSpecDetails(!showSpecDetails)}
            className="text-xs sm:text-sm font-semibold text-amber-950 hover:text-amber-800 underline flex items-center gap-1.5 cursor-pointer min-h-[36px]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showSpecDetails ? 'Hide Details' : 'View Raw Fragments & Semantic Spec'}</span>
          </button>
        </div>

        <AnimatePresence>
          {showSpecDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-amber-300/60 overflow-hidden"
            >
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 font-serif">
                  Original Raw Thought Fragments:
                </span>
                <pre className="text-xs sm:text-sm text-stone-900 whitespace-pre-wrap font-sans bg-[#f6efe1] p-4 rounded-2xl border border-amber-300/70 max-h-56 overflow-y-auto leading-relaxed shadow-inner">
                  {rawFragments}
                </pre>
              </div>
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5 font-serif">
                  Semantic Design Spec (JSON):
                </span>
                <pre className="text-xs sm:text-sm text-emerald-950 font-mono bg-[#edf6ed] p-4 rounded-2xl border border-emerald-300/80 max-h-56 overflow-y-auto leading-relaxed shadow-inner">
                  {JSON.stringify(spec, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

