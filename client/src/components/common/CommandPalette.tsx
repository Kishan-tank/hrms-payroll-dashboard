import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext';
import { useEmployeeDrawer } from '../../context/EmployeeDrawerContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ArrowRight } from 'lucide-react';
import { employeeService, ApiEmployee } from '../../services/hrmsApi';

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
    case 'search': 
      return (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
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
  const { openDrawer } = useEmployeeDrawer();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const lastFocusedRef = useRef<Element | null>(null);

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 80);
    return () => clearTimeout(timer);
  }, [query]);

  useFocusTrap(open, onClose, paletteRef, { initialFocusRef: inputRef });

  const HR_COMMANDS: CommandItem[] = [
    { id: 'nav-hr-dash', label: 'HR Dashboard', cat: 'Navigation', type: 'nav', path: '/hr-dashboard' },
    { id: 'nav-emp', label: 'Employees', cat: 'Navigation', type: 'nav', path: '/employees' },
    { id: 'nav-att', label: 'Attendance', cat: 'Navigation', type: 'nav', path: '/attendance' },
    { id: 'nav-leave', label: 'Leave Management', cat: 'Navigation', type: 'nav', path: '/leave' },
    { id: 'nav-pay', label: 'Payroll', cat: 'Navigation', type: 'nav', path: '/payroll' },
    { id: 'nav-rep', label: 'Reports', cat: 'Navigation', type: 'nav', path: '/reports' },
    { id: 'nav-set', label: 'Settings', cat: 'Navigation', type: 'nav', path: '/settings' },
    
    { id: 'act-rev-leave', label: 'Review Pending Leaves', cat: 'Actions', type: 'action', path: '/leave', keywords: ['approve', 'time off'] },
    { id: 'act-open-pay', label: 'Open Payroll Center', cat: 'Actions', type: 'action', path: '/payroll', keywords: ['run', 'salary'] },
    { id: 'act-view-rep', label: 'View Reports', cat: 'Actions', type: 'action', path: '/reports', keywords: ['analytics', 'metrics'] },
    { id: 'act-man-emp', label: 'Manage Employees', cat: 'Actions', type: 'action', path: '/employees', keywords: ['add', 'directory'] },
  ];

  const EMPLOYEE_COMMANDS: CommandItem[] = [
    { id: 'nav-emp-dash', label: 'Employee Dashboard', cat: 'Navigation', type: 'nav', path: '/employee-dashboard' },
    { id: 'nav-att', label: 'Attendance', cat: 'Navigation', type: 'nav', path: '/attendance' },
    { id: 'nav-leave', label: 'Leave Management', cat: 'Navigation', type: 'nav', path: '/leave' },
    { id: 'nav-pay', label: 'Payroll', cat: 'Navigation', type: 'nav', path: '/payroll' },
    { id: 'nav-doc', label: 'Documents', cat: 'Navigation', type: 'nav', path: '/documents' },
    { id: 'nav-prof', label: 'Profile', cat: 'Navigation', type: 'nav', path: '/profile' },
    { id: 'nav-help', label: 'Help Center', cat: 'Navigation', type: 'nav', path: '/help' },
    { id: 'nav-onboarding', label: 'Onboarding', cat: 'Navigation', type: 'nav', path: '/onboarding' },
    { id: 'nav-set', label: 'Settings', cat: 'Navigation', type: 'nav', path: '/settings' },
    
    { id: 'act-req-leave', label: 'Request Leave', cat: 'Actions', type: 'action', path: '/leave', keywords: ['apply', 'time off'] },
    { id: 'act-view-pay', label: 'View Payslip', cat: 'Actions', type: 'action', path: '/payroll', keywords: ['download', 'salary'] },
    { id: 'act-my-att', label: 'Open My Attendance', cat: 'Actions', type: 'action', path: '/attendance', keywords: ['time', 'clock'] },
    { id: 'act-my-doc', label: 'Open My Documents', cat: 'Actions', type: 'action', path: '/documents', keywords: ['files', 'upload'] },
    { id: 'act-my-prof', label: 'Open My Profile', cat: 'Actions', type: 'action', path: '/profile', keywords: ['edit', 'personal'] },
    { id: 'act-onboarding', label: 'Complete Onboarding Steps', cat: 'Actions', type: 'action', path: '/onboarding', keywords: ['setup', 'profile', 'documents', 'bank'] },
  ];

  const normalizedRole = user?.role?.toLowerCase() || '';
  const isHr = ['hr-manager', 'hr manager', 'hr', 'manager'].includes(normalizedRole);
  const ALL_COMMANDS = isHr ? HR_COMMANDS : EMPLOYEE_COMMANDS;

  const RECENT_KEY = 'command-palette-recent';
  const [recentIds, setRecentIds] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(RECENT_KEY);
      if (stored) setRecentIds(JSON.parse(stored));
    } catch (e) {}
  }, []);

  const saveRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const updated = [id, ...prev.filter(x => x !== id)].slice(0, 3);
      try { sessionStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  }, []);

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentIds([]);
    try { sessionStorage.removeItem(RECENT_KEY); } catch (e) {}
  };

  let groups: { title: string, items: CommandItem[] }[] = [];
  if (debouncedQuery) {
    const q = debouncedQuery.toLowerCase();
    
    const empMatched = employees.filter(e => {
      return (e.name && e.name.toLowerCase().includes(q)) || 
             (e.department && e.department.toLowerCase().includes(q)) || 
             (e.role && e.role.toLowerCase().includes(q));
    }).slice(0, 5).map(e => ({
      id: `emp-${e._id}`,
      label: e.name,
      cat: e.department || 'Employee',
      type: 'search' as const,
      action: () => openDrawer(e),
    }));

    if (empMatched.length > 0) groups.push({ title: 'Employees', items: empMatched });

    const matched = ALL_COMMANDS.filter(c => {
      return c.label.toLowerCase().includes(q) || c.cat.toLowerCase().includes(q) || c.keywords?.some(k => k.toLowerCase().includes(q));
    });
    if (matched.length > 0) groups.push({ title: 'Pages & Actions', items: matched });
  } else {
    const recents = recentIds.map(id => ALL_COMMANDS.find(c => c.id === id)).filter(Boolean) as CommandItem[];
    if (recents.length > 0) {
      groups.push({ title: 'Recent', items: recents });
    }
    const navs = ALL_COMMANDS.filter(c => !recentIds.includes(c.id) && c.type === 'nav');
    if (navs.length > 0) groups.push({ title: 'Navigation', items: navs });
    const actions = ALL_COMMANDS.filter(c => !recentIds.includes(c.id) && c.type === 'action');
    if (actions.length > 0) groups.push({ title: 'Actions', items: actions });
  }

  const flattened = groups.flatMap(g => g.items);

  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement;
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      employeeService.getAll({ limit: 1000 }).then(res => {
        if (res.success) setEmployees(res.employees || []);
      }).catch(() => {});
    } else {
      setEmployees([]);
      if (lastFocusedRef.current instanceof HTMLElement) {
        lastFocusedRef.current.focus();
      }
      lastFocusedRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (flattened.length > 0) {
          setSelectedIndex((i) => (i + 1) % flattened.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (flattened.length > 0) {
          setSelectedIndex((i) => (i - 1 + flattened.length) % flattened.length);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flattened[selectedIndex];
        if (selected) {
          saveRecent(selected.id);
          if (selected.path) navigate(selected.path);
          if (selected.action) selected.action();
          onClose();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, flattened, selectedIndex, navigate, onClose, saveRecent]);

  // Auto-scroll to selected
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
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
          className="fixed inset-0 z-[200] flex items-start justify-center pt-0 sm:pt-[20vh]"
          style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            ref={paletteRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cmd-palette-title"
            tabIndex={-1}
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : -20 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
            className="flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-none shadow-[0_32px_80px_rgba(0,0,0,0.6)] outline-none sm:h-auto sm:rounded-2xl"
            style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="cmd-palette-title" className="sr-only">Command Palette</h2>
            {/* Input */}
            <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-4 sm:py-4 mt-2 sm:mt-0">
              <span className="text-slate-400"><SearchIcon /></span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, payroll, reports, or type a command..."
                aria-label="Search pages and actions"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-results"
                aria-autocomplete="list"
                aria-activedescendant={flattened[selectedIndex]?.id}
                className="flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-500"
              />
              <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-slate-400 sm:block">ESC</kbd>
            </div>
            
            {/* Results */}
            <div id="command-palette-results" role="listbox" ref={listRef} className="flex-1 overflow-y-auto p-2 sm:max-h-[400px]">
              {flattened.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-white">No matching pages or actions</p>
                  <p className="mt-1 text-xs text-slate-500">Try searching for different keywords or features.</p>
                </div>
              ) : (
                groups.map((group, groupIdx) => {
                  // Calculate global offset for data-index
                  const offset = groups.slice(0, groupIdx).reduce((acc, g) => acc + g.items.length, 0);
                  
                  return (
                    <div key={group.title} className="mb-4 last:mb-0">
                      <div className="mb-1 flex items-center justify-between px-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {group.title}
                        </span>
                        {group.title === 'Recent' && (
                          <button
                            type="button"
                            onClick={clearRecent}
                            className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Clear recent
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((cmd, idx) => {
                          const globalIndex = offset + idx;
                          const isSelected = globalIndex === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              id={cmd.id}
                              type="button"
                              role="option"
                              data-index={globalIndex}
                              aria-selected={isSelected}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              onClick={() => {
                                saveRecent(cmd.id);
                                if (cmd.path) navigate(cmd.path);
                                if (cmd.action) cmd.action();
                                onClose();
                              }}
                              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 sm:py-2.5 text-left text-sm font-medium transition-colors ${
                                isSelected 
                                  ? 'bg-blue-600/15 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]' 
                                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                              }`}
                            >
                              <span className={`flex h-7 w-7 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md ${
                                isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-400 group-hover:bg-white/10'
                              }`}>
                                <CommandIcon type={cmd.type} />
                              </span>
                              <span className="flex-1 truncate">{cmd.label}</span>
                              {isSelected && (
                                <span className="flex items-center text-blue-400 gap-1.5 opacity-80">
                                  <span className="text-[11px] font-semibold tracking-wide">
                                    {cmd.type === 'search' ? 'View' : 'Jump'}
                                  </span>
                                  <ArrowRight size={14} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            <div className="hidden shrink-0 items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-3 sm:flex">
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
