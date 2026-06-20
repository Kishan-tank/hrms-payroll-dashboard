import { useState } from 'react';
import { FileText, FileImage, FileArchive, File, Download } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useToast } from '../context/ToastContext';

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType = 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | 'ZIP';

interface Document {
  id: string;
  name: string;
  type: DocType;
  size: string;
  uploadDate: string;
  category: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS: Document[] = [
  // Employment Letters
  { id: 'd-001', name: 'Offer Letter — Jun 2024',         type: 'PDF',  size: '142 KB', uploadDate: '2024-06-01', category: 'Employment Letters' },
  { id: 'd-002', name: 'Appointment Letter',               type: 'PDF',  size: '98 KB',  uploadDate: '2024-06-15', category: 'Employment Letters' },
  { id: 'd-003', name: 'Confirmation Letter — Dec 2024',  type: 'PDF',  size: '115 KB', uploadDate: '2024-12-01', category: 'Employment Letters' },
  { id: 'd-004', name: 'Salary Revision Letter — 2025',   type: 'DOCX', size: '87 KB',  uploadDate: '2025-04-10', category: 'Employment Letters' },

  // Tax Documents
  { id: 'd-005', name: 'Form 16 — FY 2023-24',            type: 'PDF',  size: '320 KB', uploadDate: '2024-06-15', category: 'Tax Documents' },
  { id: 'd-006', name: 'Form 16 — FY 2024-25',            type: 'PDF',  size: '348 KB', uploadDate: '2025-06-15', category: 'Tax Documents' },
  { id: 'd-007', name: 'Investment Declaration Form',      type: 'XLSX', size: '64 KB',  uploadDate: '2025-01-08', category: 'Tax Documents' },
  { id: 'd-008', name: 'TDS Certificate Q2 2025',         type: 'PDF',  size: '210 KB', uploadDate: '2025-10-15', category: 'Tax Documents' },

  // Identity & Verification
  { id: 'd-009', name: 'Aadhaar Card (Masked)',            type: 'PDF',  size: '52 KB',  uploadDate: '2024-06-02', category: 'Identity & Verification' },
  { id: 'd-010', name: 'PAN Card Copy',                    type: 'JPG',  size: '38 KB',  uploadDate: '2024-06-02', category: 'Identity & Verification' },
  { id: 'd-011', name: 'Passport Copy',                    type: 'PDF',  size: '74 KB',  uploadDate: '2024-06-02', category: 'Identity & Verification' },
  { id: 'd-012', name: 'Address Proof',                    type: 'PNG',  size: '45 KB',  uploadDate: '2024-06-05', category: 'Identity & Verification' },

  // Company Policies
  { id: 'd-013', name: 'Employee Handbook v3.2',           type: 'PDF',  size: '1.2 MB', uploadDate: '2025-01-01', category: 'Company Policies' },
  { id: 'd-014', name: 'Leave Policy FY 2025-26',          type: 'PDF',  size: '228 KB', uploadDate: '2025-04-01', category: 'Company Policies' },
  { id: 'd-015', name: 'Work From Home Policy',            type: 'DOCX', size: '180 KB', uploadDate: '2025-06-01', category: 'Company Policies' },
  { id: 'd-016', name: 'Code of Conduct — 2025',          type: 'PDF',  size: '295 KB', uploadDate: '2025-01-01', category: 'Company Policies' },
];

const CATEGORIES = ['All', ...Array.from(new Set(MOCK_DOCUMENTS.map((d) => d.category)))];

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
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const toast = useToast();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_DOCUMENTS.filter((doc) => {
    const matchCat  = activeCategory === 'All' || doc.category === activeCategory;
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category for display
  const grouped: Record<string, Document[]> = {};
  for (const doc of filtered) {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
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
            {MOCK_DOCUMENTS.length} documents
          </div>
        </div>

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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5 text-3xl">📄</div>
            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">No documents found</h3>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
          </div>
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
                  {docs.map((doc, index) => (
                    <li
                      key={doc.id}
                      className={`${index < docs.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                        {/* File icon */}
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${getTypeBadge(doc.type)}`}>
                          {getFileIcon(doc.type)}
                        </span>

                        {/* Name + meta */}
                        <span className="flex-1 min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className={`rounded border px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${getTypeBadge(doc.type)}`}>
                              {doc.type}
                            </span>
                            <span>{doc.size}</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline">Uploaded {formatDate(doc.uploadDate)}</span>
                          </span>
                        </span>

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => toast.info('Document download coming soon.')}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
