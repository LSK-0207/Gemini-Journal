import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquareHeart,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Lightbulb,
  Compass,
} from 'lucide-react';
import type { ChatMessage } from '../types';

interface AiChatJournalCompanionProps {
  onJournalSummarized: (rawJournal: string, chatTranscript: ChatMessage[]) => Promise<void>;
  isProcessing: boolean;
  onSwitchToCanvas: () => void;
}

const INITIAL_GREETINGS = [
  "Hello! I'm your reflective companion. How are you feeling today, or what has been lingering on your mind?",
  "Welcome. Whether it was a busy day, a quiet realization, or something new you're curious about, I'm here to listen. Where would you like to begin?",
  "Hi there. Take a deep breath. No need for polished sentences here—tell me about a moment from today that stood out to you.",
];

const CHAT_PROMPT_PILLS = [
  "I'm feeling a mix of grateful and overwhelmed today...",
  "I learned something interesting about myself recently...",
  "Today was quiet, but a few small moments felt special...",
  "I'm feeling stuck on a decision and need to unpack it...",
  "I noticed a kind gesture from someone today...",
];

export const AiChatJournalCompanion: React.FC<AiChatJournalCompanionProps> = ({
  onJournalSummarized,
  isProcessing,
  onSwitchToCanvas,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: INITIAL_GREETINGS[Math.floor(Math.random() * INITIAL_GREETINGS.length)],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  // Handle sending a user message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isAiThinking || isProcessing) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsAiThinking(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${response.status}: Failed to reach companion.`);
      }

      const data = await response.json();
      const replyText = data.reply || "I'm listening closely. Tell me more about how that felt.";

      const aiMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Unable to connect to AI companion. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  // Handle summarize chat into a raw journal and create memory flashcard
  const handleSummarizeToCard = async () => {
    if (messages.length < 2 || isProcessing) return;
    setChatError(null);

    try {
      const response = await fetch('/api/gemini/summarize-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${response.status}: Failed to summarize chat.`);
      }

      const data = await response.json();
      const rawJournal = data.rawJournal;
      if (!rawJournal) {
        throw new Error('No raw journal was returned from synthesis.');
      }

      await onJournalSummarized(rawJournal, messages);
    } catch (err: any) {
      console.error('Summarize chat error:', err);
      setChatError(err.message || 'Failed to synthesize journal from chat. Please try again.');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: INITIAL_GREETINGS[Math.floor(Math.random() * INITIAL_GREETINGS.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatError(null);
  };

  const userMessageCount = messages.filter((m) => m.sender === 'user').length;

  return (
    <motion.div
      id="ai-chat-companion-container"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8"
    >
      {/* Companion Header Banner */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/90 dark:bg-indigo-950/80 border border-indigo-300/80 dark:border-indigo-700/80 text-indigo-950 dark:text-indigo-200 text-xs font-semibold tracking-wide uppercase mb-3 shadow-2xs backdrop-blur-xs">
          <MessageSquareHeart className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Interactive Chat &bull; Multi-Turn Journaling Companion</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
          Reflect Through Conversation
        </h2>
        <p className="mt-3 text-stone-600 dark:text-stone-300 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          Don't know where to start or prefer talking? Chat freely about your feelings, wins, or curiosities.
          When ready, click <span className="font-semibold text-stone-900 dark:text-stone-100">"Synthesize into Memory Flash Card"</span> to generate an authentic raw journal and an archival card.
        </p>
      </div>

      {/* Error alert banner */}
      <AnimatePresence>
        {chatError && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="p-4 rounded-2xl bg-rose-50/95 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-950 dark:text-rose-200 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-semibold block">Companion Note:</span>
              <p className="mt-0.5 text-rose-800 dark:text-rose-300">{chatError}</p>
            </div>
            <button
              type="button"
              onClick={() => setChatError(null)}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold underline px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Container Box (Cream Paper Aesthetic) */}
      <div className="relative rounded-3xl cream-textured-paper border border-amber-300/80 shadow-2xl overflow-hidden flex flex-col h-[620px] sm:h-[680px]">
        {/* Top Chat Bar */}
        <div className="p-4 sm:p-5 border-b border-amber-300/70 bg-[#efe4d2]/85 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-200/90 text-amber-950 flex items-center justify-center border border-amber-300/80 shadow-2xs shrink-0">
              <Bot className="w-5 h-5 text-amber-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base text-amber-950 truncate">
                  Gemini Reflective Guide
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Online
                </span>
              </div>
              <p className="text-xs text-amber-900/80 truncate">
                {userMessageCount === 0 ? 'Ask or share anything on your mind' : `${userMessageCount} user reflection ${userMessageCount === 1 ? 'exchange' : 'exchanges'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-700 text-xs font-medium border border-stone-300/70 transition-colors shadow-2xs cursor-pointer min-h-[34px]"
              title="Start a fresh conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToCanvas}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 text-xs font-semibold border border-amber-300 transition-colors shadow-2xs cursor-pointer min-h-[34px]"
              title="Switch to direct spatial text dump"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Direct Canvas</span>
            </button>
          </div>
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-200/90 text-amber-950 flex items-center justify-center border border-amber-300 shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4 text-amber-900" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#35271c] text-amber-50 rounded-tr-xs border border-amber-900/40'
                      : 'bg-[#faf5eb] text-stone-900 rounded-tl-xs border border-amber-300/80'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 font-medium ${
                      isUser ? 'text-amber-200/60 text-right' : 'text-stone-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-800 text-amber-100 flex items-center justify-center border border-amber-700 shrink-0 mt-1 shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-stone-600"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-200/90 text-amber-950 flex items-center justify-center border border-amber-300 shrink-0 shadow-2xs">
                <Bot className="w-4 h-4 text-amber-900" />
              </div>
              <div className="bg-[#faf5eb] rounded-2xl rounded-tl-xs px-4 py-3 border border-amber-300/80 shadow-xs flex items-center gap-2">
                <span className="text-xs font-serif italic text-amber-950">Reflecting with you</span>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Starters Pills (Only when starting or low message count) */}
        {userMessageCount < 2 && (
          <div className="px-4 py-2 border-t border-amber-200/60 bg-[#f7f0e3] shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-950 uppercase tracking-wider mb-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-800" />
              <span>Inspiration Starters</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CHAT_PROMPT_PILLS.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(pill)}
                  disabled={isAiThinking || isProcessing}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#f0e6d2] hover:bg-amber-100 text-stone-900 border border-amber-300/70 hover:border-amber-400 transition-colors cursor-pointer shadow-2xs whitespace-nowrap min-h-[32px] flex items-center"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input & Synthesis Action Bar */}
        <div className="p-4 sm:p-5 border-t border-amber-300/80 bg-[#efe4d2]/90 space-y-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="ai-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Express a thought, feeling, or curiosity..."
              disabled={isAiThinking || isProcessing}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#faf5eb] border border-amber-300/80 focus:border-amber-700 focus:ring-2 focus:ring-amber-400/40 text-stone-900 text-sm placeholder:text-stone-500 placeholder:italic outline-none transition-all shadow-inner"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              id="ai-chat-send-btn"
              disabled={!input.trim() || isAiThinking || isProcessing}
              className="p-3 rounded-2xl bg-[#35271c] hover:bg-[#261c14] text-amber-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 border border-amber-900/40"
              title="Send message"
            >
              <Send className="w-4 h-4 text-amber-200" />
            </motion.button>
          </form>

          {/* Primary Action Button: Summarize into Memory Flash Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>
                {userMessageCount >= 1
                  ? 'Ready to capture! Click synthesize whenever you feel satisfied.'
                  : 'Chat a little first, then synthesize into a scrapbook memory card.'}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              id="synthesize-chat-btn"
              onClick={handleSummarizeToCard}
              disabled={userMessageCount === 0 || isProcessing || isAiThinking}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm text-amber-100 bg-[#35271c] hover:bg-[#261c14] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer min-h-[44px] whitespace-nowrap border border-amber-900/40"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Flash Card...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Synthesize into Memory Flash Card</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
