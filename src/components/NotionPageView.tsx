import React from 'react';
import {
  Calendar,
  Sparkles,
  Layers,
  Lock,
  Quote,
  Lightbulb,
  FileText,
  RotateCcw,
  MessageSquareHeart,
  Bot,
} from 'lucide-react';
import type { SavedInteraction } from '../types';

interface NotionPageViewProps {
  memory: SavedInteraction;
  maxHeightClass?: string;
  onFlipBack?: () => void;
}

function getMoodEmoji(mood?: string): string {
  const m = (mood || '').toLowerCase();
  if (m.includes('sunlit') || m.includes('warm') || m.includes('summer')) return '☀️';
  if (m.includes('grateful') || m.includes('content')) return '🌻';
  if (m.includes('sage') || m.includes('calm') || m.includes('gentle')) return '🌿';
  if (m.includes('hopeful') || m.includes('encourag')) return '🌱';
  if (m.includes('rose') || m.includes('tender') || m.includes('romantic')) return '🌸';
  if (m.includes('cozy') || m.includes('sentimental')) return '☕';
  if (m.includes('dark') || m.includes('academia') || m.includes('literary')) return '📖';
  if (m.includes('moody') || m.includes('introspective')) return '🕯️';
  if (m.includes('kraft') || m.includes('vintage') || m.includes('nostalgic')) return '📜';
  return '📝';
}

function getMoodBannerGradient(mood?: string): string {
  const m = (mood || '').toLowerCase();
  if (m.includes('dark') || m.includes('academia')) {
    return 'from-stone-800 via-stone-700 to-amber-950/70';
  }
  if (m.includes('sage') || m.includes('calm')) {
    return 'from-[#d8e2dc] via-[#e8ede9] to-[#c7d5cb]';
  }
  if (m.includes('rose') || m.includes('tender')) {
    return 'from-[#f2d8d8] via-[#faeeee] to-[#eed0d0]';
  }
  if (m.includes('kraft') || m.includes('vintage')) {
    return 'from-[#e8dec8] via-[#f2ece0] to-[#dfd2b5]';
  }
  // Default sunlit botanical
  return 'from-[#fcedcc] via-[#faebd7] to-[#f5dfb8]';
}

interface ParsedBlock {
  type: 'heading' | 'subheading' | 'bullet' | 'quote' | 'callout' | 'divider' | 'paragraph';
  content: string;
}

function parseRawFragmentsToNotionBlocks(rawText: string): ParsedBlock[] {
  if (!rawText || !rawText.trim()) {
    return [{ type: 'paragraph', content: 'No thoughts entered.' }];
  }

  const lines = rawText.split('\n');
  const blocks: ParsedBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Divider
    if (line === '---' || line === '***' || line === '___') {
      blocks.push({ type: 'divider', content: '' });
      continue;
    }

    // Heading 1 (# Heading or Heading:)
    if (line.startsWith('# ')) {
      blocks.push({ type: 'heading', content: line.replace(/^#\s+/, '') });
      continue;
    }

    // Heading 2 / 3 (## Heading)
    if (line.startsWith('## ') || line.startsWith('### ')) {
      blocks.push({ type: 'subheading', content: line.replace(/^#{2,3}\s+/, '') });
      continue;
    }

    // Bullets (- item, * item, • item)
    if (/^[-*•]\s+/.test(line)) {
      blocks.push({ type: 'bullet', content: line.replace(/^[-*•]\s+/, '') });
      continue;
    }

    // Numbered list items (1. item)
    if (/^\d+\.\s+/.test(line)) {
      blocks.push({ type: 'bullet', content: line.replace(/^\d+\.\s+/, '') });
      continue;
    }

    // Quotes
    if (line.toLowerCase().startsWith('quote:') || (line.startsWith('"') && line.endsWith('"'))) {
      blocks.push({
        type: 'quote',
        content: line.replace(/^quote:\s*/i, '').replace(/^"|"$/g, ''),
      });
      continue;
    }

    // Callouts (Reminder:, Note:, Takeaway:)
    if (
      line.toLowerCase().startsWith('reminder:') ||
      line.toLowerCase().startsWith('note:') ||
      line.toLowerCase().startsWith('note to self:') ||
      line.toLowerCase().startsWith('takeaway:')
    ) {
      blocks.push({
        type: 'callout',
        content: line.replace(/^(reminder|note to self|note|takeaway):\s*/i, ''),
      });
      continue;
    }

    // Paragraph
    blocks.push({ type: 'paragraph', content: line });
  }

  return blocks;
}

export const NotionPageView: React.FC<NotionPageViewProps> = ({
  memory,
  maxHeightClass = 'max-h-[65vh]',
  onFlipBack,
}) => {
  const title = memory.designSpec?.title || 'Thought Stream Notes';
  const mood = memory.designSpec?.mood || memory.mood || 'warm';
  const templateId = memory.templateId || memory.designSpec?.template_id || 'sunlit-botanical-horizontal';
  const formattedDate = memory.createdAt
    ? new Date(memory.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent Reflection';

  const rawText = memory.rawFragments || '';
  const blocks = parseRawFragmentsToNotionBlocks(rawText);
  const moodEmoji = getMoodEmoji(mood);
  const bannerGradient = getMoodBannerGradient(mood);

  return (
    <div
      id={`thought-codex-view-${memory.id || 'current'}`}
      onClick={(e) => {
        // Prevent card from flipping when user clicks, selects text, or scrolls inside the raw input / Thought Codex
        e.stopPropagation();
      }}
      className="w-full h-full cream-textured-paper cream-lined-codex text-stone-900 rounded-2xl shadow-xl border border-amber-300/80 overflow-hidden flex flex-col select-text font-sans cursor-default"
    >
      {/* Thought Codex Top Cover Banner */}
      <div className={`relative h-14 sm:h-16 w-full bg-linear-to-r ${bannerGradient} shrink-0`}>
        <div className="absolute top-2.5 left-3.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-950/70 backdrop-blur-xs text-amber-100 text-[11px] font-medium tracking-wide shadow-xs">
          <span>Thought Codex</span>
          <span className="opacity-60">&bull;</span>
          <span className="opacity-90">Raw Transcript</span>
          {memory.creationSource === 'ai_chat' && (
            <>
              <span className="opacity-60">&bull;</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                <Bot className="w-3 h-3" />
                Created by Chatting with AI
              </span>
            </>
          )}
        </div>

        {onFlipBack && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFlipBack();
            }}
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-[#faf5eb]/95 hover:bg-white text-stone-900 shadow-sm border border-amber-300/80 font-semibold transition-all cursor-pointer hover:shadow min-h-[32px]"
            title="Flip back to Memory Flash Card artwork"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-800" />
            <span>Flip to Memory Flash Card</span>
          </button>
        )}
      </div>

      {/* Thought Codex Scrollable Body */}
      <div className={`px-4 sm:px-8 pb-8 pt-0 flex-1 overflow-y-auto ${maxHeightClass || ''} scrollbar-thin`}>
        {/* Page Icon */}
        <div className="-mt-7 mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#faf5eb] border border-amber-300/80 shadow-md text-2xl select-none">
          {moodEmoji}
        </div>

        {/* Page Title (H1) */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-stone-950 tracking-tight leading-tight mb-4">
          {title}
        </h1>

        {/* Properties Grid (Read-Only Archival - Structured 4-column responsive grid) */}
        <div className="bg-[#f2e7d3]/85 rounded-2xl p-3 sm:p-4 border border-amber-300/70 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
          <div className="flex flex-col gap-1 min-w-0 bg-[#faf5eb] p-2.5 rounded-xl border border-amber-300/60 shadow-2xs">
            <span className="text-stone-500 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-stone-600" /> Date
            </span>
            <span className="font-semibold text-stone-900 truncate" title={formattedDate}>
              {formattedDate}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-0 bg-[#faf5eb] p-2.5 rounded-xl border border-amber-300/60 shadow-2xs">
            <span className="text-stone-500 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Vibe
            </span>
            <span className="font-semibold text-amber-950 capitalize truncate">
              {mood}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-0 bg-[#faf5eb] p-2.5 rounded-xl border border-amber-300/60 shadow-2xs">
            <span className="text-stone-500 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-700" /> Template
            </span>
            <span className="font-mono text-[11px] text-stone-800 truncate" title={templateId}>
              {templateId}
            </span>
          </div>

          <div className="flex flex-col gap-1 min-w-0 bg-[#faf5eb] p-2.5 rounded-xl border border-amber-300/60 shadow-2xs">
            <span className="text-stone-500 font-medium flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              {memory.creationSource === 'ai_chat' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-emerald-700" /> Origin
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-700" /> Storage
                </>
              )}
            </span>
            <span className="font-semibold text-emerald-950 flex items-center gap-1 truncate">
              {memory.creationSource === 'ai_chat' ? 'Chatting with AI' : 'Direct Canvas'}
            </span>
          </div>
        </div>

        {/* Highlight & Synthesized Memory Flash Card Core */}
        {(memory.designSpec?.feeling_block || memory.designSpec?.quote || (memory.designSpec?.gratitude_list && memory.designSpec.gratitude_list.length > 0)) && (
          <div className="mb-6 space-y-3">
            {/* Core Feeling */}
            {memory.designSpec?.feeling_block && (
              <div className="p-4 rounded-xl bg-[#f5ecdc] border border-amber-300/80 flex items-start gap-3 shadow-2xs">
                <div className="p-1.5 rounded-lg bg-amber-200/90 text-amber-900 shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4 text-amber-800" />
                </div>
                <div className="space-y-1 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 block">
                    Core Feeling &amp; Mood Note
                  </span>
                  <p className="text-xs sm:text-sm text-stone-900 leading-relaxed font-sans">
                    {memory.designSpec.feeling_block}
                  </p>
                </div>
              </div>
            )}

            {/* Gratitude Items */}
            {memory.designSpec?.gratitude_list && memory.designSpec.gratitude_list.length > 0 && (
              <div className="p-4 rounded-xl bg-[#edf6ed] border border-emerald-300/80 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 block mb-2">
                  Things I'm Grateful For
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {memory.designSpec.gratitude_list.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-[#faf7ef] px-3 py-2 rounded-lg border border-emerald-200 text-xs text-stone-900">
                      <span className="text-emerald-700 font-bold select-none">♥</span>
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Quote / Takeaway */}
            {memory.designSpec?.quote && (
              <div className="p-3.5 rounded-xl bg-[#f6eee0] border border-amber-300/70 text-xs sm:text-sm text-stone-900 italic font-serif flex items-start gap-2.5 shadow-2xs">
                <Quote className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                <span className="leading-relaxed">"{memory.designSpec.quote}"</span>
              </div>
            )}
          </div>
        )}

        {/* Subtle Section Divider */}
        <div className="border-b border-amber-300/50 my-6" />

        {/* Structured Document Blocks */}
        <div className="space-y-3.5 text-stone-900">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Raw Input Stream</span>
          </div>

          {blocks.map((block, idx) => {
            switch (block.type) {
              case 'heading':
                return (
                  <h2
                    key={idx}
                    className="text-lg sm:text-xl font-bold font-serif text-stone-950 tracking-tight pt-3 border-b border-amber-200/60 pb-1"
                  >
                    {block.content}
                  </h2>
                );
              case 'subheading':
                return (
                  <h3
                    key={idx}
                    className="text-sm sm:text-base font-bold text-stone-900 tracking-tight pt-2"
                  >
                    {block.content}
                  </h3>
                );
              case 'bullet':
                return (
                  <div key={idx} className="flex items-start gap-2.5 pl-2 leading-relaxed">
                    <span className="text-amber-800 font-bold mt-1 text-xs select-none">•</span>
                    <span className="text-xs sm:text-sm text-stone-800">{block.content}</span>
                  </div>
                );
              case 'quote':
                return (
                  <div
                    key={idx}
                    className="border-l-3 border-amber-700 pl-3.5 py-1 text-xs sm:text-sm italic text-stone-900 font-serif bg-[#f5ede0] rounded-r-lg my-2 flex items-start gap-2"
                  >
                    <Quote className="w-3 h-3 text-amber-800 shrink-0 mt-1" />
                    <span>"{block.content}"</span>
                  </div>
                );
              case 'callout':
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#f4ebd9] border border-amber-300/80 text-xs sm:text-sm text-stone-900 flex items-start gap-2"
                  >
                    <span className="text-base select-none text-amber-800">✦</span>
                    <span className="leading-relaxed">{block.content}</span>
                  </div>
                );
              case 'divider':
                return <hr key={idx} className="border-t border-amber-300/60 my-4" />;
              case 'paragraph':
              default:
                return (
                  <p key={idx} className="text-xs sm:text-sm leading-relaxed text-stone-800">
                    {block.content}
                  </p>
                );
            }
          })}
        </div>

        {/* Chat Transcript Section (If created via multi-turn chat) */}
        {memory.chatTranscript && memory.chatTranscript.length > 0 && (
          <div className="mt-8 p-4 rounded-2xl bg-[#efe4d2]/70 border border-amber-300/70">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquareHeart className="w-4 h-4 text-indigo-700" />
              <span className="font-serif font-bold text-sm text-stone-900">
                Original Conversation Transcript ({memory.chatTranscript.length} messages)
              </span>
            </div>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin text-xs">
              {memory.chatTranscript.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`p-2.5 rounded-xl border ${
                    msg.sender === 'user'
                      ? 'bg-[#35271c] text-amber-50 border-amber-900/40 ml-4'
                      : 'bg-[#faf5eb] text-stone-900 border-amber-300/70 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-semibold">
                    <span>{msg.sender === 'user' ? 'You' : 'Companion'}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Read-Only Archival Note */}
        <div className="mt-8 pt-4 border-t border-amber-300/50 flex items-center justify-between text-[11px] text-stone-500">
          <span>Thought Codex &bull; Read-Only Archival</span>
          <span>{blocks.length} blocks parsed</span>
        </div>
      </div>
    </div>
  );
};
