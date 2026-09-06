import React, { useState } from 'react';
import { Download, RefreshCw, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';
import type { SavedInteraction } from '../types';
import { exportMemoryCardAsImage, type ImageFormat } from '../utils/imageExport';

interface DownloadImageMenuProps {
  memory: SavedInteraction;
  buttonClassName?: string;
  compact?: boolean;
}

export const DownloadImageMenu: React.FC<DownloadImageMenuProps> = ({
  memory,
  buttonClassName = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportedFormat, setLastExportedFormat] = useState<string | null>(null);

  const handleExport = async (format: ImageFormat) => {
    try {
      setIsExporting(true);
      await exportMemoryCardAsImage(memory, format);
      setLastExportedFormat(format);
      setTimeout(() => {
        setLastExportedFormat(null);
        setIsOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center rounded-xl bg-stone-800 border border-stone-700 p-0.5 shadow-xs">
        <button
          type="button"
          disabled={isExporting}
          onClick={(e) => {
            e.stopPropagation();
            handleExport('png');
          }}
          className="px-2.5 py-1.5 min-h-[34px] text-xs font-semibold text-stone-200 hover:text-white hover:bg-stone-700/80 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          title="Download high-resolution PNG"
        >
          {isExporting ? (
            <RefreshCw className="w-3 h-3 animate-spin text-amber-300" />
          ) : (
            <Download className="w-3 h-3 text-amber-300" />
          )}
          <span>PNG</span>
        </button>

        <span className="w-px h-3.5 bg-stone-700" />

        <button
          type="button"
          disabled={isExporting}
          onClick={(e) => {
            e.stopPropagation();
            handleExport('jpeg');
          }}
          className="px-2.5 py-1.5 min-h-[34px] text-xs font-semibold text-stone-200 hover:text-white hover:bg-stone-700/80 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          title="Download high-resolution JPG"
        >
          <span>JPG</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <div className="inline-flex items-center rounded-xl shadow-xs">
        {/* Default Quick Download PNG */}
        <button
          type="button"
          disabled={isExporting}
          onClick={() => handleExport('png')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-l-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50 border-r border-stone-700 cursor-pointer ${buttonClassName}`}
          title="Download as high-res PNG"
        >
          {isExporting ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
          ) : lastExportedFormat === 'png' ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Download className="w-3.5 h-3.5 text-amber-300" />
          )}
          <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
        </button>

        {/* Dropdown Toggle for JPG/JPEG */}
        <button
          type="button"
          disabled={isExporting}
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2.5 py-2 min-h-[36px] rounded-r-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${buttonClassName}`}
          title="More download formats"
          aria-expanded={isOpen}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Format Selector Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-stone-900 border border-stone-700 shadow-xl z-50 py-1 text-xs text-stone-200 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-stone-800 text-[11px] font-serif uppercase tracking-wider text-stone-400">
            Export Image Format
          </div>

          <button
            type="button"
            onClick={() => handleExport('png')}
            className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-300">PNG</span>
              <span className="text-[11px] text-stone-400">Lossless Retina</span>
            </div>
            {lastExportedFormat === 'png' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleExport('jpeg')}
            className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-300">JPG / JPEG</span>
              <span className="text-[11px] text-stone-400">Compressed Photo</span>
            </div>
            {lastExportedFormat === 'jpeg' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
