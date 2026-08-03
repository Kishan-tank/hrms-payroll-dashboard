import { useState, useEffect } from 'react';
import { FileText, FileImage, FileArchive, File, Download, Upload, Trash2, X, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import { documentService, employeeService, ApiDocument, ApiEmployee } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';

type DocType = 'PDF' | 'DOCX' | 'XLSX' | 'JPG' | 'PNG' | 'ZIP' | string;

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

function formatDate(iso?: string): string {
  if (!iso) return 'Unknown Date';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const { user } = useAuthContext();
  const userRole = user?.role ? String(user.role).toLowerCase() : '';
  const isHrOrAdmin = userRole === 'admin' || userRole.includes('hr');

  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Offer Letter' | 'Payslip' | 'Policy' | 'ID Proof' | 'Other'>('ID Proof');
  const [uploadEmployeeId, setUploadEmployeeId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Delete Confirm State
  const [deletingDoc, setDeletingDoc] = useState<ApiDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDocs();
    if (isHrOrAdmin) {
      employeeService.getAll({ limit: 100 }).then(res => setEmployees(res.employees)).catch(() => {});
    }
  }, [isHrOrAdmin]);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await documentService.getAll();
      setDocuments(res.documents || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('type', uploadCategory);
      if (uploadEmployeeId) {
        formData.append('employeeId', uploadEmployeeId);
      }

      const res = await documentService.upload(formData);
      setDocuments([res.document, ...documents]);
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadTitle('');
      setUploadCategory('ID Proof');
      setUploadEmployeeId('');
      setSuccessMsg('Document uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      setDeleting(true);
      await documentService.delete(deletingDoc._id);
      setDocuments(documents.filter(d => d._id !== deletingDoc._id));
      setDeletingDoc(null);
      setSuccessMsg('Document deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Documents">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  const CATEGORIES = ['All', 'Offer Letter', 'Payslip', 'Policy', 'ID Proof', 'Other'];

  const filtered = documents.filter((doc) => {
    const matchCat = activeCategory === 'All' || doc.type === activeCategory;
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped: Record<string, ApiDocument[]> = {};
  for (const doc of filtered) {
    if (!grouped[doc.type]) grouped[doc.type] = [];
    grouped[doc.type].push(doc);
  }

  return (
    <DashboardLayout title="Documents">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5 pb-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Documents</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Access and manage employment letters, tax documents, ID proofs, and company policies.
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Upload Document
          </button>
        </div>

        {/* Banners */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:opacity-75"><X className="h-4 w-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 shadow-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:opacity-75"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
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

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white dark:placeholder:text-slate-500 sm:w-52"
          />
        </div>

        {/* Document Groups */}
        {Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="No documents found"
            description="No documents match your search or category filter. Try different keywords or click Upload Document above."
            actionLabel="Clear filters"
            onAction={() => { setSearch(''); setActiveCategory('All'); }}
          />
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, docs]) => (
              <div key={category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <h2 className="font-bold text-slate-950 dark:text-white">{category}</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    {docs.length} file{docs.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <ul>
                  {docs.map((doc, index) => {
                    const ext = (doc.fileUrl?.split('.').pop() || 'PDF').toUpperCase() as DocType;
                    const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
                    const token = localStorage.getItem('token') || '';
                    const downloadUrl = `${backendUrl}${doc.fileUrl}?token=${token}`;
                    
                    const currentUserId = user?._id || user?.id;
                    const uploadedObj = typeof doc.uploadedBy === 'object' && doc.uploadedBy ? (doc.uploadedBy as { _id: string }) : null;
                    const uploadedById = uploadedObj ? uploadedObj._id : (typeof doc.uploadedBy === 'string' ? doc.uploadedBy : undefined);
                    const isOwner = Boolean(currentUserId && uploadedById === currentUserId);
                    const canDelete = isHrOrAdmin || isOwner;

                    const employeeObj = typeof doc.employeeId === 'object' && doc.employeeId ? (doc.employeeId as { name: string }) : null;
                    const empName = employeeObj ? employeeObj.name : null;

                    return (
                      <li
                        key={doc._id}
                        className={`${index < docs.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
                      >
                        <div className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${getTypeBadge(ext)}`}>
                            {getFileIcon(ext)}
                          </span>

                          <span className="flex-1 min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{doc.title}</span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className={`rounded border px-1.5 py-px text-[10px] font-bold uppercase tracking-wide ${getTypeBadge(ext)}`}>
                                {ext}
                              </span>
                              <span className="hidden sm:inline">Uploaded {formatDate(doc.createdAt)}</span>
                              {empName && (
                                <span className="text-slate-400 dark:text-slate-500">• {empName}</span>
                              )}
                            </span>
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={downloadUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>

                            {canDelete && (
                              <button
                                onClick={() => setDeletingDoc(doc)}
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                title="Delete Document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════ UPLOAD DOCUMENT MODAL ════════════════════════ */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upload Document</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select File * (Max 10MB)</label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.zip"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-blue-600 hover:file:bg-blue-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:file:bg-blue-500/20 dark:file:text-blue-400"
                  />
                  {selectedFile && (
                    <p className="mt-1 text-xs text-slate-500">Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Document Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="e.g., Passport Verification / Q2 Payslip"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</label>
                    <select
                      value={uploadCategory}
                      onChange={e => setUploadCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="ID Proof" className="dark:bg-[#111827]">ID Proof</option>
                      <option value="Offer Letter" className="dark:bg-[#111827]">Offer Letter</option>
                      <option value="Payslip" className="dark:bg-[#111827]">Payslip</option>
                      <option value="Policy" className="dark:bg-[#111827]">Policy</option>
                      <option value="Other" className="dark:bg-[#111827]">Other</option>
                    </select>
                  </div>

                  {isHrOrAdmin && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Employee</label>
                      <select
                        value={uploadEmployeeId}
                        onChange={e => setUploadEmployeeId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="" className="dark:bg-[#111827]">-- Global / Policy Doc --</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp._id} className="dark:bg-[#111827]">{emp.name} ({emp.department})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ════════════════════════ DELETE DOCUMENT CONFIRM MODAL ════════════════════════ */}
        {deletingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1121]">
              <div className="mb-3 flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-500/10">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Document</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{deletingDoc.title}"</strong>? This will permanently remove the file.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingDoc(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
