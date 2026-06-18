import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext';

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
    </svg>
  );
}

function CommandIcon({ type }: { type: string }) {
  switch (type) {
    case 'action': return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'nav':    return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
    case 'search': return <SearchIcon />;
    default:       return <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />;
  }
}

interface CommandItem {
  id: string;
  label: string;
  cat: string;
  type: 'nav' | 'action' | 'search';
  path?: string;
  action?: () => void;
  keywords?: string[];
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const HR_COMMANDS: CommandItem[] = [
    { id: 'nav-hr-dash', label: 'HR Dashboard', cat: 'Navigation', type: 'nav', path: '/hr-dashboard' },
    { id: 'nav-emp', label: 'Employees', cat: 'Navigation', type: 'nav', path: '/employees' },
    { id: 'nav-pay', label: 'Payroll', cat: 'Navigation', type: 'nav', path: '/payroll' },
    { id: 'nav-rep', label: 'Reports', cat: 'Navigation', type: 'nav', path: '/reports' },
    { id: 'nav-att', label: 'Attendance', cat: 'Navigation', type: 'nav', path: '/attendance' },
    { id: 'nav-leave', label: 'Leave Management', cat: 'Navigation', type: 'nav', path: '/leave' },
    { id: 'nav-set', label: 'Settings', cat: 'Navigation', type: 'nav', path: '/settings' },
    
    { id: 'act-pay', label: 'Run Payroll', cat: 'Actions', type: 'action', path: '/payroll', keywords: ['process', 'salary'] },
    { id: 'act-leave', label: 'Approve Leave', cat: 'Actions', type: 'action', path: '/leave', keywords: ['time off', 'holiday'] },
    { id: 'act-add-emp', label: 'Add Employee', cat: 'Actions', type: 'action', path: '/employees', keywords: ['hire', 'new'] },
    
    // Mocks for Priority 4: Global Search
    { id: 'search-emp-1', label: 'Aisha Verma', cat: 'Employees', type: 'search', path: '/employees', keywords: ['engineering', 'senior'] },
    { id: 'search-emp-2', label: 'Marcus Lee', cat: 'Employees', type: 'search', path: '/employees', keywords: ['design'] },
    { id: 'search-dept-1', label: 'Engineering Department', cat: 'Departments', type: 'search', path: '/employees' },
    { id: 'search-rep-1', label: 'Q2 Attendance Report', cat: 'Reports', type: 'search', path: '/reports' },
  ];

  const EMPLOYEE_COMMANDS: CommandItem[] = [
    { id: 'nav-emp-dash', label: 'Employee Dashboard', cat: 'Navigation', type: 'nav', path: '/employee-dashboard' },
    { id: 'nav-att', label: 'My Attendance', cat: 'Navigation', type: 'nav', path: '/attendance' },
    { id: 'nav-leave', label: 'My Leave', cat: 'Navigation', type: 'nav', path: '/leave' },
    { id: 'nav-pay', label: 'My Payroll', cat: 'Navigation', type: 'nav', path: '/payroll' },
    { id: 'nav-doc', label: 'My Documents', cat: 'Navigation', type: 'nav', path: '/documents' },
    { id: 'act-prof', label: 'My Profile', cat: 'Actions', type: 'action', path: '#profile' },
    { id: 'nav-set', label: 'Settings', cat: 'Navigation', type: 'nav', path: '/settings' },
    { id: 'act-leave', label: 'Apply Leave', cat: 'Actions', type: 'action', path: '/leave' },
    { id: 'act-payslip', label: 'Download Payslip', cat: 'Actions', type: 'action', path: '/payroll' },
    { id: 'act-rep', label: 'Attendance Report', cat: 'Reports', type: 'action', path: '/attendance' },
  ];

  const normalizedRole = user?.role?.toLowerCase() || '';
  const isHr = ['hr-manager', 'hr manager', 'hr', 'manager'].includes(normalizedRole);
  const ALL_COMMANDS = isHr ? HR_COMMANDS : EMPLOYEE_COMMANDS;

  const filtered = query
    ? ALL_COMMANDS.filter((c) => {
        const q = query.toLowerCase();
        if (c.label.toLowerCase().includes(q)) return true;
        if (c.cat.toLowerCase().includes(q)) return true;
        if (c.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
        return false;
      })
    : ALL_COMMANDS;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          if (selected.path) navigate(selected.path);
          if (selected.action) selected.action();
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filtered, selectedIndex, navigate, onClose]);

  // Auto-scroll to selected
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
          style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
              <span className="text-slate-400"><SearchIcon /></span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search employees, payroll, reports, or type a command..."
                className="flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-400 sm:block">ESC</kbd>
            </div>
            
            {/* Results */}
            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 sm:max-h-[400px]">
              {filtered.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-white">No results found</p>
                  <p className="mt-1 text-xs text-slate-500">Try searching for employees, reports, or actions.</p>
                </div>
              ) : (
                filtered.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        if (cmd.path) navigate(cmd.path);
                        if (cmd.action) cmd.action();
                        onClose();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors ${
                        isSelected ? 'bg-blue-600/15 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                        isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        <CommandIcon type={cmd.type} />
                      </span>
                      <span className="flex-1 truncate">{cmd.label}</span>
                      <span className={`text-[11px] font-semibold tracking-wide ${isSelected ? 'text-blue-300/70' : 'text-slate-600'}`}>
                        {cmd.cat}
                      </span>
                      {isSelected && (
                        <span className="hidden items-center gap-1 sm:flex">
                          <kbd className="rounded border border-blue-500/30 bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400">↵</kbd>
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            <div className="hidden items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-3 sm:flex">
              <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-sans">↑</kbd>
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-sans">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-sans">↵</kbd>
                  to select
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-600">HRMSPro Command Palette</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
