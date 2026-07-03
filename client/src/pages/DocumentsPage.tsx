import { useState, useEffect } from 'react';
import { FileText, FileImage, FileArchive, File, Download, AlertCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import { documentService, ApiDocument } from '../services/hrmsApi';

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | 'ZIP' | string;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFileIcon(type: DocType) {
  switch (type) {
    case 'PDF':
    case 'DOCX': return <FileText className="h-4 w-4" />;
    case 'XLSX': return <File className="h-4 w-4" />;
    case 'JPG':
    case 'PNG':  return <FileImage className="h-4 w-4" />;
    case 'ZIP':  return <FileArchive className="h-4 w-4" />;
    default:     return <File className="h-4 w-4" />;
  }
}

function getTypeBadge(type: DocType): string {
  switch (type) {
    case 'PDF':  return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30';
    case 'DOCX': return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30';
    case 'XLSX': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30';
    case 'JPG':
    case 'PNG':  return 'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/20 dark:text-violet-400 dark:border-violet-500/30';
    case 'ZIP':  return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30';
    default:     return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30';
  }
}

function formatDate(iso: string): string {
  if (!iso) return 'Unknown Date';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchDocs() {
      try {
        setLoading(true);
        setError(null);
        const res = await documentService.getAll();
        setDocuments(res.documents || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Documents">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  const CATEGORIES = ['All', ...Array.from(new Set(documents.map((d) => d.type)))];

  const filtered = documents.filter((doc) => {
    const matchCat  = activeCategory === 'All' || doc.type === activeCategory;
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category for display
  const grouped: Record<string, ApiDocument[]> = {};
  for (const doc of filtered) {
    if (!grouped[doc.type]) grouped[doc.type] = [];
    grouped[doc.type].push(doc);
  }

  return (
    <DashboardLayout title="Documents">
      {/* Ambient glows — dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Documents</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Access your employment letters, tax documents, and company policies.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            {documents.length} documents
          </div>
        </div>

        {error && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-500/10 dark:text-red-400 gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-200 transition dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500 sm:w-52"
          />
        </div>

        {/* ── Document Groups ── */}
        {Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No documents found"
            description="No documents match your search or category filter. Try different keywords or select a different category."
            actionLabel="Clear filters"
            onAction={() => { setSearch(''); setActiveCategory('All'); }}
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, docs]) => (
              <div key={category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
                {/* Category header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <h2 className="font-bold text-slate-950 dark:text-white">{category}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    {docs.length} file{docs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Document rows */}
                <ul>
                  {docs.map((doc, index) => {
                    const ext = (doc.fileUrl?.split('.').pop() || 'PDF').toUpperCase() as DocType;
                    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
                    const downloadUrl = `${backendUrl}${doc.fileUrl}`;
                    
                    return (
                    <li
                      key={doc._id}
                      className={`${index < docs.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                        {/* File icon */}
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${getTypeBadge(ext)}`}>
                          {getFileIcon(ext)}
                        </span>

                        {/* Name + meta */}
                        <span className="flex-1 min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{doc.title}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`rounded border px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${getTypeBadge(ext)}`}>
                              {ext}
                            </span>
                            <span className="hidden sm:inline">Uploaded {formatDate(doc.createdAt)}</span>
                          </span>
                        </span>

                        {/* Download button */}
                        <a
                          href={downloadUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </li>
                  )})}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
