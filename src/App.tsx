import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { SpatialCanvas } from './components/SpatialCanvas';
import { AiChatJournalCompanion } from './components/AiChatJournalCompanion';
import { RenderedPageReview } from './components/RenderedPageReview';
import { MemoryLibrary } from './components/MemoryLibrary';
import { FeaturedMemoryHighlight } from './components/FeaturedMemoryHighlight';
import { FlippableScrapbookCard } from './components/FlippableScrapbookCard';
import { DownloadImageMenu } from './components/DownloadImageMenu';
import { FileText, X, BookOpen, RotateCcw } from 'lucide-react';
import {
  signInWithGoogle,
  signOutUser,
  onAuthUserChanged,
  saveUserInteraction,
  fetchUserInteractions,
  deleteUserInteraction,
} from './firebase';
import type { UserProfile, SavedInteraction, JournalDesignSpec, AppTheme, ChatMessage } from './types';

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // 2-Tone Theme state (default: two-tone-dark)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('personal_gemini_journal_theme');
      if (saved === 'two-tone-light') return 'two-tone-light';
      return 'two-tone-dark';
    } catch {
      return 'two-tone-dark';
    }
  });

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'two-tone-dark' ? 'two-tone-light' : 'two-tone-dark'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'two-tone-dark') {
      root.classList.add('dark');
      root.classList.add('two-tone-dark');
      root.classList.remove('two-tone-light');
    } else {
      root.classList.remove('dark');
      root.classList.remove('two-tone-dark');
      root.classList.add('two-tone-light');
    }
    try {
      localStorage.setItem('personal_gemini_journal_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme preference', e);
    }
  }, [theme]);

  // App Navigation View: 'canvas' | 'chat' | 'review' | 'library'
  const [activeView, setActiveView] = useState<'canvas' | 'chat' | 'review' | 'library'>('canvas');

  // Generation State
  const [rawFragments, setRawFragments] = useState<string>('');
  const [currentSpec, setCurrentSpec] = useState<JournalDesignSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [creationSource, setCreationSource] = useState<'canvas' | 'ai_chat'>('canvas');
  const [activeChatTranscript, setActiveChatTranscript] = useState<ChatMessage[] | undefined>(undefined);

  // Firestore Interactions State
  const [savedInteractions, setSavedInteractions] = useState<SavedInteraction[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Featured Memory Inspection Modal
  const [inspectedMemory, setInspectedMemory] = useState<SavedInteraction | null>(null);
  const [showInspectedRawText, setShowInspectedRawText] = useState<boolean>(false);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthUserChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch User's Saved Interactions whenever user changes
  const loadUserInteractions = useCallback(async () => {
    if (!user?.uid) {
      setSavedInteractions([]);
      return;
    }
    setIsLibraryLoading(true);
    try {
      const items = await fetchUserInteractions(user.uid);
      setSavedInteractions(items);
    } catch (err: any) {
      console.error('Failed to load user interactions:', err);
    } finally {
      setIsLibraryLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadUserInteractions();
    }
  }, [user?.uid, loadUserInteractions]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      setActiveView('canvas');
      showToast('Welcome to Personal Gemini Journal!');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setSavedInteractions([]);
      setActiveView('canvas');
      showToast('Signed out successfully.');
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
  };

  // Two-Stage Generation Pipeline (Custom Instructions Section 8):
  // 1. Semantic Stage: Calls Gemini free-tier text model via backend (/api/gemini/design-spec)
  //    yielding strict JournalDesignSpec JSON with slot limits
  // 2. Rendering Stage: Local compositor renders the page deterministically against
  //    the matching template asset (zero marginal cost)
  const handleGenerateSpec = async (
    fragments: string,
    source: 'canvas' | 'ai_chat' = 'canvas',
    transcript?: ChatMessage[]
  ) => {
    setIsGenerating(true);
    setGenerationError(null);
    setRawFragments(fragments);
    setCreationSource(source);
    setActiveChatTranscript(transcript);

    try {
      const res = await fetch('/api/gemini/design-spec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawFragments: fragments,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const spec: JournalDesignSpec = data.designSpec;

      setCurrentSpec(spec);
      setActiveView('review');
      showToast(
        source === 'ai_chat'
          ? `Synthesized chat into memory flash card "${spec.title}"!`
          : `Composited memory flash card for template "${spec.template_id}"!`
      );
    } catch (err: any) {
      console.error('Generation Error:', err);
      setGenerationError(err.message || 'Failed to analyze thoughts and fit to template.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Callback when AI Chat Companion synthesizes a raw journal from conversation
  const handleJournalSummarizedFromChat = async (
    rawJournal: string,
    chatTranscript: ChatMessage[]
  ) => {
    await handleGenerateSpec(rawJournal, 'ai_chat', chatTranscript);
  };

  // Save rendered page to Firestore isolated to current user
  const handleSaveToLibrary = async (renderedSvg: string) => {
    if (!user?.uid || !currentSpec) {
      setSaveError('You must be signed in to save memories.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const interactionId = `mem-${Date.now()}`;
    const newInteraction: SavedInteraction = {
      id: interactionId,
      userId: user.uid,
      userEmail: user.email,
      rawFragments,
      designSpec: currentSpec,
      renderedSvg,
      templateId: currentSpec.template_id || 'sunlit-botanical-01',
      mood: currentSpec.mood,
      creationSource,
      chatTranscript: activeChatTranscript,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveUserInteraction(user.uid, newInteraction);
      // Refresh list
      await loadUserInteractions();
      setActiveView('library');
      showToast(`Saved "${currentSpec.title}" to your Memory Library!`);
    } catch (err: any) {
      console.error('Save to Firestore Error:', err);
      setSaveError(err.message || 'Failed to save to Firestore. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an interaction from Firestore
  const handleDeleteInteraction = async (interactionId: string) => {
    if (!user?.uid) return;
    try {
      await deleteUserInteraction(user.uid, interactionId);
      setSavedInteractions((prev) => prev.filter((item) => item.id !== interactionId));
      showToast('Memory flash card removed.');
    } catch (err: any) {
      console.error('Delete Error:', err);
      showToast(`Failed to delete: ${err.message || 'Unknown error'}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#24201c] text-[#ede4d8] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg font-medium">Opening your journal...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen soft-multitone-canvas flex flex-col selection:bg-amber-200 dark:selection:bg-amber-900/60 selection:text-amber-900 dark:selection:text-amber-200 transition-colors duration-300 ${
        theme === 'two-tone-dark'
          ? 'dark two-tone-dark bg-[#24201c] text-[#ede4d8]'
          : 'two-tone-light bg-[#f3ede3] text-[#2d241d]'
      }`}
    >
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        savedCount={savedInteractions.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {!user ? (
          /* 1. Landing Hero for Unauthenticated Visitors */
          <LandingHero
            onSignIn={handleSignIn}
            isSigningIn={isSigningIn}
            authError={authError}
          />
        ) : (
          /* 2. Authenticated Dashboard Views */
          <div>
            {activeView === 'canvas' && (
              <div className="py-6">
                {/* Best Memory of the Month / Featured Highlight (only renders if user has saved cards) */}
                <FeaturedMemoryHighlight
                  interactions={savedInteractions}
                  onSelectMemory={(mem) => {
                    setInspectedMemory(mem);
                    setShowInspectedRawText(false);
                  }}
                />

                <SpatialCanvas
                  onGenerate={(fragments) => handleGenerateSpec(fragments, 'canvas')}
                  isLoading={isGenerating}
                  errorMessage={generationError}
                  onClearError={() => setGenerationError(null)}
                  onSwitchToChat={() => setActiveView('chat')}
                />
              </div>
            )}

            {activeView === 'chat' && (
              <div className="py-6">
                <AiChatJournalCompanion
                  onJournalSummarized={handleJournalSummarizedFromChat}
                  isProcessing={isGenerating}
                  onSwitchToCanvas={() => setActiveView('canvas')}
                />
              </div>
            )}

            {activeView === 'review' && currentSpec && (
              <RenderedPageReview
                spec={currentSpec}
                rawFragments={rawFragments}
                onSaveToLibrary={handleSaveToLibrary}
                onBackToCanvas={() => setActiveView(creationSource === 'ai_chat' ? 'chat' : 'canvas')}
                isSaving={isSaving}
                saveError={saveError}
                creationSource={creationSource}
              />
            )}

            {activeView === 'library' && (
              <MemoryLibrary
                interactions={savedInteractions}
                isLoading={isLibraryLoading}
                onRefresh={loadUserInteractions}
                onDeleteInteraction={handleDeleteInteraction}
                onNavigateToCanvas={() => setActiveView('canvas')}
              />
            )}
          </div>
        )}
      </main>

      {/* Featured Memory Full Inspection Modal */}
      {inspectedMemory && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={() => setInspectedMemory(null)}
        >
          <div
            className="relative w-full max-w-6xl h-[92vh] sm:h-[94vh] max-h-[96vh] bg-stone-900 rounded-2xl shadow-2xl p-3 sm:p-5 text-stone-100 flex flex-col border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dedicated Top-Right Close Button: Always visible, fixed to corner, easily tappable on mobile without overflowing */}
            <button
              type="button"
              id="featured-modal-close-btn"
              onClick={() => setInspectedMemory(null)}
              aria-label="Close modal"
              title="Close inspection window"
              className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-40 p-2 sm:p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 shadow-md transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-stone-800 pb-3 mb-3 shrink-0 pr-12 sm:pr-14">
              <div className="min-w-0">
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-amber-200 truncate">
                  {inspectedMemory.designSpec?.title || 'Featured Memory Card'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5 truncate">
                  Saved on {new Date(inspectedMemory.createdAt).toLocaleDateString()} &bull; Mood:{' '}
                  {inspectedMemory.designSpec?.mood || inspectedMemory.mood} &bull; Template:{' '}
                  {inspectedMemory.templateId}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  id="featured-modal-flip-btn"
                  onClick={() => setShowInspectedRawText(!showInspectedRawText)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                    showInspectedRawText
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-amber-300'
                  }`}
                  title="Flip between Memory Flash Card and Thought Codex"
                >
                  <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${showInspectedRawText ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{showInspectedRawText ? 'Flip to Memory Card' : 'Flip to Thought Codex'}</span>
                  <span className="inline sm:hidden">{showInspectedRawText ? 'Card' : 'Codex'}</span>
                </button>

                <DownloadImageMenu memory={inspectedMemory} />

                <button
                  type="button"
                  onClick={() => {
                    setInspectedMemory(null);
                    setActiveView('library');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors cursor-pointer min-h-[36px]"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All Memory Cards</span>
                  <span className="inline sm:hidden">All Cards</span>
                </button>
              </div>
            </div>

            {/* 3D Flippable Card Canvas / Notion Page (Full-Size & Scrollable) */}
            <div className="flex-1 min-h-0 w-full overflow-hidden relative rounded-2xl bg-stone-950/75 border border-stone-800 flex flex-col">
              <FlippableScrapbookCard
                memory={inspectedMemory}
                isFlipped={showInspectedRawText}
                onFlipChange={setShowInspectedRawText}
                showToggleInHeader={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-6 text-center text-xs text-stone-500 dark:text-stone-400 bg-[#fbf8f2] dark:bg-[#181614]">
        <p className="font-serif">
          Personal Gemini Journal &bull; Memory Flash Cards &bull; Gemini Semantic Analysis &bull; Zero-Cost Template Compositor &bull; Secure Cloud Firestore
        </p>
      </footer>
    </div>
  );
}

export default App;
