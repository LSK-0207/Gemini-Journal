import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Eye,
  Trash2,
  FileText,
  Search,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  LayoutGrid,
  RotateCcw,
  X,
} from 'lucide-react';
import type { SavedInteraction } from '../types';
import { StackedDeckView } from './StackedDeckView';
import { FlippableScrapbookCard } from './FlippableScrapbookCard';
import { DownloadImageMenu } from './DownloadImageMenu';
import { getSafeMemorySvg } from '../utils/svgRenderer';

interface MemoryLibraryProps {
  interactions: SavedInteraction[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onDeleteInteraction: (id: string) => Promise<void>;
  onNavigateToCanvas: () => void;
}

export const MemoryLibrary: React.FC<MemoryLibraryProps> = ({
  interactions,
  isLoading,
  onRefresh,
  onDeleteInteraction,
  onNavigateToCanvas,
}) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'grid'>('stacked');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInteraction, setSelectedInteraction] = useState<SavedInteraction | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SavedInteraction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = interactions.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (item.designSpec?.title && item.designSpec.title.toLowerCase().includes(q)) ||
      (item.rawFragments && item.rawFragments.toLowerCase().includes(q)) ||
      (item.templateId && item.templateId.toLowerCase().includes(q)) ||
      (item.mood && item.mood.toLowerCase().includes(q))
    );
  });

  const promptDelete = (item: SavedInteraction, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteInteraction(itemToDelete.id);
      if (selectedInteraction?.id === itemToDelete.id) {
        setSelectedInteraction(null);
      }
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadSvg = (interaction: SavedInteraction) => {
    const svgContent = interaction.renderedSvg || '';
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${interaction.designSpec?.title || 'sunlit-scrapbook'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="memory-library-view" className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full mb-2 border border-amber-300/80 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-800" />
            <span>Private Archive &bull; Firestore Isolated</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#461901] dark:text-[#fde68a] transition-colors">
            Memory Library
          </h2>
          <p className="text-sm text-[#777373] dark:text-stone-300 mt-1 transition-colors">
            Browse and revisit your past memory flash cards and raw thought origins.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-800/80 bg-[#f0e6d4] dark:bg-[#342a22] hover:bg-[#e7dabf] dark:hover:bg-[#3f332a] text-stone-800 dark:text-amber-200 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer shadow-2xs"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-800 dark:text-amber-300' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onNavigateToCanvas}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35271c] hover:bg-[#261c14] text-amber-100 text-sm font-semibold shadow-md transition-all min-h-[42px] cursor-pointer border border-amber-900/40"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>New Memory Flash Card</span>
          </button>
        </div>
      </div>

      {/* Search & View Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, thoughts, or mood..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-amber-300/80 dark:border-amber-800/80 bg-[#faf5eb] dark:bg-[#2c241d] text-stone-900 dark:text-amber-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-500 focus:border-amber-700 outline-none shadow-2xs"
          />
        </div>

        {/* View Switcher: Stacked Deck vs Gallery Grid */}
        <div className="flex items-center gap-2 p-1 bg-[#eee3cf] dark:bg-[#342a22] rounded-xl self-start sm:self-auto border border-amber-300/70 dark:border-amber-900/60 shadow-2xs">
          <button
            type="button"
            id="view-mode-stacked"
            onClick={() => setViewMode('stacked')}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
              viewMode === 'stacked'
                ? 'bg-[#faf6ee] dark:bg-[#221c16] text-stone-900 dark:text-amber-200 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>Stacked Deck</span>
          </button>
          <button
            type="button"
            id="view-mode-grid"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all cursor-pointer min-h-[36px] ${
              viewMode === 'grid'
                ? 'bg-[#faf6ee] dark:bg-[#221c16] text-stone-900 dark:text-amber-200 shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
            <span>Gallery Grid</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid, Stacked Deck, or Empty State */}
      {isLoading && interactions.length === 0 ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-3" />
          <p className="text-stone-600 dark:text-stone-300 text-sm">Loading your private memories from Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl cream-textured-paper border-2 border-dashed border-amber-300/80 shadow-md">
          <BookOpen className="w-12 h-12 text-amber-700/60 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-stone-900">No Memories Found</h3>
          <p className="text-sm text-stone-600 max-w-sm mx-auto mt-1 mb-6">
            {searchQuery
              ? 'No memories matched your search criteria.'
              : 'Your library is empty. Head to the Spatial Canvas to dump your thoughts and composite your first memory flash card!'}
          </p>
          <button
            type="button"
            onClick={onNavigateToCanvas}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#35271c] hover:bg-[#261c14] text-amber-100 text-sm font-semibold shadow-md cursor-pointer border border-amber-900/40"
          >
            <Plus className="w-4 h-4 text-amber-300" /> Create First Memory Flash Card
          </button>
        </div>
      ) : viewMode === 'stacked' ? (
        <StackedDeckView
          interactions={filtered}
          onSelectInteraction={setSelectedInteraction}
          onPromptDelete={promptDelete}
          onDownloadSvg={downloadSvg}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'Recent';

            const svgContent = getSafeMemorySvg(item);

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedInteraction(item);
                  setShowRawText(false);
                }}
                className="group cursor-pointer rounded-2xl cream-textured-paper border border-amber-300/80 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Visual Thumbnail */}
                <div className="relative h-56 bg-[#fcfaf4] border-b border-amber-300/60 overflow-hidden p-2 flex items-center justify-center">
                  <div
                    className="w-full h-full flex items-center justify-center transform scale-95 group-hover:scale-100 transition-transform duration-300 drop-shadow-sm pointer-events-none [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain [&>svg]:max-h-full [&>svg]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />

                  <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#faf5eb] text-stone-900 text-xs font-semibold shadow-md border border-amber-300/70">
                      <Eye className="w-3.5 h-3.5 text-amber-800" /> Inspect Memory Flash Card
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-500" /> {formattedDate}
                      </span>
                      <span className="capitalize font-medium text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-md text-[11px] border border-amber-300/70">
                        {item.templateId || item.designSpec?.template_id || 'sunlit-botanical-01'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-amber-950 transition-colors line-clamp-1">
                      {item.designSpec?.title || 'Untitled Memory Flash Card'}
                    </h3>

                    <p className="text-xs text-stone-700 line-clamp-2 mt-1 italic">
                      "{item.rawFragments}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-300/60 flex items-center justify-between text-xs text-stone-600">
                    <span className="font-medium text-stone-800">Click to flip &amp; inspect</span>
                    <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <DownloadImageMenu memory={item} compact />
                      <button
                        type="button"
                        id={`delete-card-${item.id}`}
                        onClick={(e) => promptDelete(item, e)}
                        className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-100/60 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Size Detail Modal */}
      {selectedInteraction && (
        <div
          id="detail-card-modal"
          className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={() => setSelectedInteraction(null)}
        >
          <div
            className="relative w-full max-w-6xl h-[92vh] sm:h-[94vh] max-h-[96vh] bg-stone-900 rounded-2xl shadow-2xl p-3 sm:p-5 text-stone-100 flex flex-col border border-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dedicated Top-Right Close Button: Always visible, fixed to corner, easily tappable on mobile without overflowing */}
            <button
              type="button"
              id="library-modal-close-btn"
              onClick={() => setSelectedInteraction(null)}
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
                  {selectedInteraction.designSpec?.title || 'Memory Flash Card'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5 truncate">
                  Saved on {new Date(selectedInteraction.createdAt).toLocaleDateString()} &bull; Mood:{' '}
                  {selectedInteraction.designSpec?.mood || selectedInteraction.mood}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  id="library-modal-flip-btn"
                  onClick={() => setShowRawText(!showRawText)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer min-h-[36px] ${
                    showRawText
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border border-stone-700'
                  }`}
                  title="Flip between Memory Flash Card artwork and Thought Codex"
                >
                  <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${showRawText ? 'rotate-180' : ''}`} />
                  <span className="hidden sm:inline">{showRawText ? 'Flip to Memory Flash Card' : 'Flip to Thought Codex'}</span>
                  <span className="inline sm:hidden">{showRawText ? 'Card' : 'Codex'}</span>
                </button>

                <DownloadImageMenu memory={selectedInteraction} />

                <button
                  type="button"
                  id="modal-delete-btn"
                  onClick={() => promptDelete(selectedInteraction)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-stone-800 hover:bg-rose-950/70 border border-stone-700 text-rose-300 text-xs font-semibold transition-colors min-h-[36px] cursor-pointer"
                  title="Delete memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>

            {/* 3D Flippable Card Canvas / Notion Page (Full-Size & Scrollable) */}
            <div className="flex-1 min-h-0 w-full overflow-hidden relative rounded-2xl bg-stone-950/75 border border-stone-800 flex flex-col">
              <FlippableScrapbookCard
                memory={selectedInteraction}
                isFlipped={showRawText}
                onFlipChange={setShowRawText}
                showToggleInHeader={false}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* In-UI Confirmation Modal for Safe Iframe Deletions */}
      {itemToDelete && (
        <div
          id="delete-confirmation-dialog"
          className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isDeleting && setItemToDelete(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
                  Delete Memory Flash Card?
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-stone-900 dark:text-amber-200">
                    "{itemToDelete.designSpec?.title || 'this memory card'}"
                  </span>
                  ? This will permanently remove it from your private Firestore collection.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3.5">
              <button
                type="button"
                id="cancel-delete-action-btn"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4.5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-action-btn"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition-colors disabled:opacity-50 min-h-[42px] cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Memory</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
