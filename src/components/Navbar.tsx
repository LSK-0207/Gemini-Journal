import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookMarked, Feather, Library, LogIn, LogOut, Sun, Moon, User as UserIcon, MessageSquareHeart } from 'lucide-react';
import type { UserProfile, AppTheme } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeView: 'canvas' | 'chat' | 'review' | 'library';
  onNavigate: (view: 'canvas' | 'chat' | 'library') => void;
  onSignIn: () => void;
  onSignOut: () => void;
  savedCount: number;
  theme?: AppTheme | 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onSignIn,
  onSignOut,
  savedCount,
  theme = 'two-tone-dark',
  onToggleTheme,
}) => {
  const [logoLoadError, setLogoLoadError] = useState(false);
  const isDark = theme === 'two-tone-dark' || theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f4eee5]/95 dark:bg-[#29241f]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-[#3e342c] shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-4 w-full">
        {/* Logo & Title */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('canvas')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group shrink-0 min-w-0"
        >
          {/* Changeable Logo via /logo.png */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl overflow-hidden bg-linear-to-br from-amber-800 to-amber-950 text-amber-100 flex items-center justify-center shadow-xs group-hover:shadow-md border border-amber-300/60 dark:border-amber-500/30 transition-all shrink-0">
            {!logoLoadError ? (
              <img
                src="/logo.png"
                alt="Personal Gemini Journal"
                className="w-full h-full object-cover"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif font-bold text-xs sm:text-base lg:text-lg text-stone-900 dark:text-stone-100 tracking-tight leading-tight truncate">
              <span className="inline sm:hidden">Gemini</span>
              <span className="hidden sm:inline xl:hidden">Gemini Journal</span>
              <span className="hidden xl:inline">Personal Gemini Journal</span>
            </h1>
            <p className="hidden xl:block text-[11px] text-stone-500 dark:text-stone-400 font-medium tracking-wide uppercase truncate">
              Journal to Memory Flash Cards
            </p>
          </div>
        </motion.div>

        {/* Navigation Tabs (Available if authenticated) */}
        {user && (
          <nav className="flex items-center bg-stone-200/60 dark:bg-[#342c25] p-0.5 sm:p-1 rounded-xl border border-stone-200/80 dark:border-[#473c33] text-xs sm:text-sm font-medium shrink-0 shadow-2xs backdrop-blur-xs gap-0.5 sm:gap-1">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('canvas')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[34px] sm:min-h-[38px] ${
                activeView === 'canvas' || activeView === 'review'
                  ? 'bg-white dark:bg-[#201c18] text-stone-900 dark:text-amber-200 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-stone-700/50'
              }`}
              title="Spatial Canvas"
            >
              <Feather className="w-3.5 h-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
              <span className="hidden lg:inline">Spatial </span>
              <span>Canvas</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('chat')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[34px] sm:min-h-[38px] ${
                activeView === 'chat'
                  ? 'bg-white dark:bg-[#201c18] text-stone-900 dark:text-amber-200 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-stone-700/50'
              }`}
              title="AI Reflective Companion Chat"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden lg:inline">AI </span>
              <span>Companion</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('library')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap min-h-[34px] sm:min-h-[38px] ${
                activeView === 'library'
                  ? 'bg-white dark:bg-[#201c18] text-stone-900 dark:text-amber-200 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-stone-700/50'
              }`}
              title="Memory Library"
            >
              <Library className="w-3.5 h-3.5 shrink-0 text-indigo-700 dark:text-indigo-400" />
              <span className="hidden lg:inline">Memory </span>
              <span>Library</span>
              {savedCount > 0 && (
                <span className="ml-0.5 sm:ml-1 px-1.5 py-0.2 bg-amber-200/70 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-[10px] font-bold rounded-full">
                  {savedCount}
                </span>
              )}
            </motion.button>
          </nav>
        )}

        {/* User Profile, Theme Toggle & Auth State */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
          {/* 2-Tone Theme Toggle Button */}
          {onToggleTheme && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={
                isDark ? 'Switch to 2-tone light theme' : 'Switch to 2-tone dark theme'
              }
              className={`inline-flex items-center justify-center gap-1.5 p-2 lg:px-3 lg:py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-all cursor-pointer min-h-[34px] sm:min-h-[38px] min-w-[34px] sm:min-w-[38px] ${
                isDark
                  ? 'border-amber-400/40 bg-[#352e27] text-amber-200 hover:bg-[#3f372f] hover:border-amber-300'
                  : 'border-amber-300/80 bg-white/90 text-amber-950 hover:bg-white hover:border-amber-400'
              }`}
              title={
                isDark ? 'Switch to 2-Tone Light Theme' : 'Switch to 2-Tone Dark Theme'
              }
            >
              {isDark ? (
                <>
                  <Moon className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="hidden xl:inline">2-Tone Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="hidden xl:inline">2-Tone Light</span>
                </>
              )}
            </motion.button>
          )}

          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3">
              {/* User name: Strictly hidden on mobile and tablet, only displayed on desktop (xl) */}
              <div className="hidden xl:flex flex-col text-right max-w-[130px]">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {user.displayName || user.email?.split('@')[0] || 'Journalist'}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                  {user.email}
                </span>
              </div>

              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User profile avatar'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-300 dark:border-amber-600/70 object-cover shrink-0 shadow-2xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs border border-amber-200/50">
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={onSignOut}
                className="p-1.5 sm:p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer min-h-[34px] min-w-[34px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer min-h-[34px] sm:min-h-[38px]"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span className="hidden xl:inline">Sign In with Google</span>
              <span className="inline xl:hidden">Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

