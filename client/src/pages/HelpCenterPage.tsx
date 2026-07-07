import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Search, Mail, Clock, MessageCircle, Rocket, Calendar, Coins, Lock, HelpCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { helpCenterService, type ApiFAQCategory, type ApiFAQItem } from '../services/hrmsApi';
import { useToast } from '../context/ToastContext';
import { useAuthContext } from '../context/AuthContext';

// ─── Helper to map string icon names to Lucide components ──────────
function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'Rocket': return Rocket;
    case 'Calendar': return Calendar;
    case 'Coins': return Coins;
    case 'Lock': return Lock;
    default: return HelpCircle;
  }
}

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({ item, isOpen, onToggle }: {
  item: ApiFAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`border-b border-slate-100 last:border-0 dark:border-white/5`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]"
      >
        <span className={`text-sm font-semibold leading-snug transition-colors ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
          {item.question}
        </span>
        <span className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HelpCenterPage() {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<ApiFAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  
  const toast = useToast();
  const { user } = useAuthContext();
  
  const isHRManager = user?.role === 'hr-manager' || user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await helpCenterService.getFAQs();
      if (res.success && res.categories) {
        setCategories(res.categories);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('This will seed the default FAQs. Continue?')) return;
    try {
      setSeeding(true);
      const res = await helpCenterService.seedFAQs();
      if (res.success) {
        toast.success(res.message);
        if (res.categories) {
          setCategories(res.categories);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to seed FAQs');
    } finally {
      setSeeding(false);
    }
  };

  // Search: flatten all items across categories and filter
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return categories.flatMap((cat) =>
      cat.items
        .filter((item) =>
          item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
        )
        .map((item) => ({ ...item, categoryLabel: cat.label, categoryIcon: cat.icon }))
    );
  }, [search, categories]);

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  if (loading) {
    return (
      <DashboardLayout title="Help Center">
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Help Center">
      {/* Ambient glows — dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">
        {/* ── Header + Search ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Help Center</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Find answers to common questions about HRMSPro.
            </p>
          </div>
          {isHRManager && categories.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : 'Seed FAQs'}
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0B1121] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500/50"
          />
        </div>

        {/* ── Search Results ── */}
        {searchResults !== null ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="font-bold text-slate-950 dark:text-white">Search Results</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </span>
            </div>
            {searchResults.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">No questions matched "<span className="font-semibold">{search}</span>". Try different keywords or browse the categories below.</p>
              </div>
            ) : (
              searchResults.map((item) => {
                const IconComponent = getIconComponent(item.categoryIcon);
                return (
                  <div key={item.id}>
                    <div className="border-b border-slate-100 px-5 pt-3 pb-1 dark:border-white/5">
                      <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        <IconComponent className="h-3 w-3" /> {item.categoryLabel}
                      </span>
                    </div>
                    <AccordionItem
                      item={item}
                      isOpen={openId === item.id}
                      onToggle={() => toggle(item.id)}
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ── FAQ Categories ── */
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center dark:border-white/10 dark:bg-slate-900/50">
                <p className="text-slate-500 dark:text-slate-400">No FAQs available yet.</p>
              </div>
            ) : (
              categories.map((cat) => {
                const CategoryIcon = getIconComponent(cat.icon);
                return (
                  <div
                    key={cat.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
                  >
                    {/* Category header */}
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
                      <span className="text-slate-400 dark:text-slate-500"><CategoryIcon className="h-5 w-5" /></span>
                      <h2 className="font-bold text-slate-950 dark:text-white">{cat.label}</h2>
                      <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                        {cat.items.length} questions
                      </span>
                    </div>

                    {/* FAQ items */}
                    {cat.items.map((item) => (
                      <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openId === item.id}
                        onToggle={() => toggle(item.id)}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Contact Support Card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h2 className="font-bold text-slate-950 dark:text-white">Still need help?</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Can't find what you're looking for? Reach out to our support team.
            </p>
          </div>
          <div className="grid gap-0 sm:grid-cols-3">
            {[
              {
                icon: <Mail className="h-5 w-5" />,
                label: 'Email Support',
                value: 'hr-support@hrmspro.in',
                sub: 'We reply within 1 business day',
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/20',
              },
              {
                icon: <Clock className="h-5 w-5" />,
                label: 'Support Hours',
                value: 'Mon – Fri, 9 AM – 6 PM',
                sub: 'IST (India Standard Time)',
                color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/20',
              },
              {
                icon: <MessageCircle className="h-5 w-5" />,
                label: 'Internal Helpdesk',
                value: 'helpdesk.hrmspro.in',
                sub: 'Raise a ticket for IT or HR issues',
                color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/20',
              },
            ].map((card, i) => (
              <div
                key={card.label}
                className={`flex items-start gap-4 p-5 ${i < 2 ? 'border-b border-slate-100 dark:border-white/5 sm:border-b-0 sm:border-r' : ''}`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{card.label}</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white truncate">{card.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
