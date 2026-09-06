import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Feather, BookOpen, ArrowRight } from 'lucide-react';

interface LandingHeroProps {
  onSignIn: () => void;
  isSigningIn: boolean;
  authError: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSignIn,
  isSigningIn,
  authError,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 overflow-hidden">
      {/* Gentle Floating Atmospheric Washi & Paper Accents */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [-5, -7, -5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-12 left-6 sm:left-16 w-36 sm:w-48 h-8 sm:h-10 bg-rose-200/40 rounded-xs border border-rose-300/40 shadow-xs pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 8, 0], rotate: [4, 6, 4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-16 right-6 sm:right-20 w-40 sm:w-52 h-8 sm:h-10 bg-amber-200/40 rounded-xs border border-amber-300/40 shadow-xs pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-linear-to-br from-amber-200/30 to-rose-200/20 blur-3xl pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-700/80 text-amber-950 dark:text-amber-200 text-xs font-semibold tracking-wider uppercase shadow-2xs backdrop-blur-xs transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>Semantic Memory Archivist &bull; Zero-Cost Local Compositor</span>
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.15] mb-6"
        >
          From Journal to{' '}
          <span className="relative inline-block text-amber-950 dark:text-amber-200 italic">
            Memory Flash Cards
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-amber-500/70"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
            >
              <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="3.5" fill="none" />
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-stone-700 dark:text-stone-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-sans font-normal"
        >
          Pour your unstructured raw thoughts onto an intuitive spatial canvas.
          Gemini extracts emotional motifs, and our zero-cost deterministic compositor renders
          tactile memory flash cards with pressed florals, torn textures, and mindful prompts.
        </motion.p>

        {/* Auth Error Banner */}
        {authError && (
          <motion.div
            variants={itemVariants}
            className="mb-6 p-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs sm:text-sm max-w-md mx-auto shadow-xs"
          >
            {authError}
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <motion.button
            id="google-signin-btn"
            type="button"
            onClick={onSignIn}
            disabled={isSigningIn}
            whileHover={{ scale: 1.025, boxShadow: '0 20px 30px -10px rgba(28, 25, 23, 0.25)' }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3.5 px-8 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-base shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-50 min-h-[52px]"
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isSigningIn ? 'Opening Vault...' : 'Sign In with Google to Open Journal'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300 shrink-0" />
          </motion.button>
        </motion.div>

        {/* Feature Highlights / Security Pillars with Staggered Entrance */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-left"
        >
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl cream-textured-paper border border-amber-300/80 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm sm:text-base mb-1.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Private &amp; User Isolated</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              Every thought, design spec, and memory flash card is strictly isolated in Firestore. Nobody else can ever view your memories.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl cream-textured-paper border border-amber-300/80 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm sm:text-base mb-1.5">
              <div className="p-1.5 rounded-lg bg-amber-200/90 text-amber-950 border border-amber-300/80">
                <Feather className="w-4 h-4" />
              </div>
              <span>Zero-Cost Compositor</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              Bundled physical memory templates with measured slots composited locally at zero marginal cost with no billed image-gen.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="p-5 rounded-2xl cream-textured-paper border border-amber-300/80 shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm sm:text-base mb-1.5">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-300/60">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Revisit Origin Thoughts</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              Flip seamlessly between the artistic memory flash card and the archival Thought Codex with full fragment lineage.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

