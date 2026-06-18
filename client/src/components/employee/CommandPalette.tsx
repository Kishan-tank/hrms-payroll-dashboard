import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CalendarDays, FileText, User, Folder, Settings, X, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { id: 'leave', icon: <CalendarDays size={18} className="text-blue-600 dark:text-blue-400" />, label: 'Apply Leave', desc: 'Request time off', path: '#' },
  { id: 'payslip', icon: <Download size={18} className="text-emerald-600 dark:text-emerald-400" />, label: 'Download Payslip', desc: 'Get latest salary slip', path: '#' },
  { id: 'attendance', icon: <FileText size={18} className="text-purple-600 dark:text-purple-400" />, label: 'Attendance Report', desc: 'View monthly report', path: '#' },
  { id: 'profile', icon: <User size={18} className="text-teal-600 dark:text-teal-400" />, label: 'View Profile', desc: 'Update your details', path: '#' },
  { id: 'documents', icon: <Folder size={18} className="text-amber-600 dark:text-amber-400" />, label: 'Documents', desc: 'Access files and policies', path: '#' },
  { id: 'settings', icon: <Settings size={18} className="text-slate-600 dark:text-slate-400" />, label: 'Settings', desc: 'App preferences', path: '#' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase()) || 
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[activeIndex]) {
        navigate(filteredCommands[activeIndex].path);
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm transition-opacity dark:bg-[#020817]/60"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl pointer-events-auto dark:border-white/10 dark:bg-[#0B1121]/95"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <Search size={20} className="text-slate-500 dark:text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-[16px] text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-500"
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
                {filteredCommands.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-[14px]">
                    No results found for "{search}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => (
                    <div
                      key={cmd.id}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        navigate(cmd.path);
                        setIsOpen(false);
                      }}
                      className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors ${
                        activeIndex === idx ? 'bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' : 'border border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 shadow-inner dark:bg-white/5 ${activeIndex === idx ? 'bg-blue-100 dark:bg-blue-500/20' : ''}`}>
                          {cmd.icon}
                        </div>
                        <div>
                          <div className={`text-[14px] font-medium ${activeIndex === idx ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {cmd.label}
                          </div>
                          <div className="text-[12px] text-slate-500">{cmd.desc}</div>
                        </div>
                      </div>
                      {activeIndex === idx && (
                        <span className="flex items-center text-[12px] text-blue-600 dark:text-blue-400">
                          Jump to <ChevronRight size={14} className="ml-1" />
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center gap-4 text-[11px] text-slate-500 dark:border-white/5 dark:bg-white/[0.02]">
                <span className="flex items-center gap-1.5"><kbd className="rounded border border-slate-300 bg-slate-200 px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-white/5">↑</kbd><kbd className="rounded border border-slate-300 bg-slate-200 px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-white/5">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="rounded border border-slate-300 bg-slate-200 px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-white/5">Enter</kbd> to select</span>
                <span className="flex items-center gap-1.5"><kbd className="rounded border border-slate-300 bg-slate-200 px-1.5 py-0.5 font-sans dark:border-white/10 dark:bg-white/5">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
