import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Send, User } from 'lucide-react';
import { aiService } from '../../services/hrmsApi';

const SUGGESTIONS = [
  'How many leaves remaining?',
  'Download latest payslip',
  'Show attendance report',
  'Generate monthly summary',
  'Show payroll status',
];

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI Assistant. Note: This is currently in Demo Mode and responds to specific keywords (like leaves, payslips, or attendance) with simulated answers.' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    
    try {
      const res = await aiService.ask(text);
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: res.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: "I'm sorry, I couldn't process that right now." },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: "I'm having trouble connecting to the server. Please check your API keys and try again." },
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 mb-4 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-[0_20px_80px_rgba(0,0,0,0.15)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#0B1121]/70 dark:shadow-[0_20px_80px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-5 py-4 text-white backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 shadow-inner">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-extrabold tracking-wide">AI Assistant</h3>
                    <span className="rounded-full border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">Demo Mode</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-semibold">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    Online
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide bg-slate-50/50 dark:bg-transparent dark:bg-gradient-to-b dark:from-transparent dark:to-[#0B1121]/50">
              <div className="flex flex-col gap-5">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-md ${
                        msg.role === 'user'
                          ? 'bg-blue-600'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}
                    >
                      {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-[16px] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white dark:bg-blue-600/20 dark:border dark:border-blue-500/30 dark:backdrop-blur-sm'
                          : 'bg-white border border-slate-200 text-slate-700 dark:bg-white/5 dark:text-slate-200 dark:border-white/10 dark:backdrop-blur-sm'
                      } ${msg.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="flex flex-col gap-2 p-5 pt-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 dark:text-slate-400">Suggested prompts</span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-semibold text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300 shadow-sm text-left dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 dark:hover:border-blue-500/50 dark:hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] dark:backdrop-blur-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B1121]/90 dark:backdrop-blur-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Try asking about leaves or payslips..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-5 pr-12 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-inner dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-blue-500/50 dark:focus:bg-white/10 dark:focus:ring-blue-500/10"
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md transition-all disabled:opacity-50 disabled:grayscale hover:scale-105"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="group/btn relative">
        {/* Tooltip */}
        <div className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-[12px] font-bold text-white opacity-0 shadow-xl transition-all duration-300 group-hover/btn:-translate-x-2 group-hover/btn:opacity-100 whitespace-nowrap border border-slate-800 dark:bg-[#0B1121] dark:border-white/10">
          Try AI Assistant (Demo)
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-[#0B1121]" />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_8px_40px_rgba(59,130,246,0.7)] ring-4 ring-white dark:ring-[#0B1121]"
        >
          {isOpen ? (
            <X size={26} className="transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <Sparkles size={26} className="transition-transform duration-300 group-hover:scale-110" />
          )}
        </motion.button>
      </div>
    </div>
  );
}
