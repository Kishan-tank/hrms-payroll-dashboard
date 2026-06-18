import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { employeeService } from '../services/hrmsApi';
import type { ApiEmployee, AddEmployeePayload } from '../services/hrmsApi';
import EmployeeDrawer from '../components/employees/EmployeeDrawer';
import EmptyState from '../components/common/EmptyState';

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

const statusStyle: Record<string, string> = {
  Active: 'text-green-500',
  'On Leave': 'text-amber-500',
  Inactive: 'text-red-500',
};

const emptyForm: AddEmployeePayload = {
  employeeId: '',
  name: '',
  email: '',
  phone: '',
  department: 'Engineering',
  role: '',
  joinDate: '',
  basicPay: 0,
};

function Icon({ name }: { name: 'search' | 'filter' | 'plus' | 'edit' | 'trash' | 'chevronLeft' | 'chevronRight' | 'spinner' }) {
  const common = { className: 'h-4 w-4', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'search') return <svg {...common}><path d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>;
  if (name === 'filter') return <svg {...common}><path d="M3 5h18M6 12h12M10 19h4" /></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === 'edit') return <svg {...common}><path d="M12 20h9" /><path d="m16.5 3.5 4 4L7 21H3v-4z" /></svg>;
  if (name === 'trash') return <svg {...common}><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6" /></svg>;
  if (name === 'chevronLeft') return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
  if (name === 'spinner') return <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>;
  return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
}

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 7;

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiEmployee | null>(null);
  const [form, setForm] = useState<AddEmployeePayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ApiEmployee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // drawer
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(null);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeService.getAll({ search, department, status, page, limit: perPage });
      setEmployees(res.employees);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, department, status, page]);

  useEffect(() => { void fetchEmployees(); }, [fetchEmployees]);

  // ── open add modal ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  // ── open edit modal ───────────────────────────────────────────────────────
  function openEdit(emp: ApiEmployee) {
    setEditTarget(emp);
    setForm({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone ?? '',
      department: emp.department,
      role: emp.role,
      joinDate: emp.joinDate.slice(0, 10), // ISO → YYYY-MM-DD
      basicPay: emp.basicPay,
    });
    setFormError(null);
    setShowModal(true);
  }

  // ── save (add or update) ─────────────────────────────────────────────────
  async function handleSave() {
    if (!form.name || !form.email || !form.employeeId || !form.department || !form.role || !form.joinDate) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await employeeService.update(editTarget._id, form);
      } else {
        await employeeService.add(form);
      }
      setShowModal(false);
      void fetchEmployees();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── deactivate ───────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeService.deactivate(deleteTarget._id);
      setDeleteTarget(null);
      void fetchEmployees();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Employee Management</h1>
            <p className="text-sm text-slate-400">{total} employees found</p>
          </div>
          <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Icon name="plus" /> Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" /></span>
            <input value={search} onChange={handleSearchChange} placeholder="Search by name or ID..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </div>
          <span className="text-slate-400"><Icon name="filter" /></span>
          <select value={department} onChange={(e) => { setDepartment(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠ {error} &nbsp;<button className="font-bold underline" onClick={() => void fetchEmployees()}>Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee ID', 'Employee Name', 'Department', 'Role', 'Status', 'Join Date', 'Basic Pay', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                  <span className="inline-flex items-center gap-2"><Icon name="spinner" /> Loading employees...</span>
                </td></tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    <EmptyState
                      icon={<Icon name="search" />}
                      title="No Employees Found"
                      description="Try adjusting your filters or add a new employee."
                      actionLabel="Add Employee"
                      onAction={openAdd}
                    />
                  </td>
                </tr>
              ) : employees.map((emp) => (
                <tr
                  key={emp._id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03] last:border-b-0"
                >
                  <td className="px-4 py-3 font-mono text-sm text-blue-600">{emp.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{emp.name.charAt(0)}</span>
                      <span className="text-sm font-medium text-slate-950">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{emp.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{emp.role}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${statusStyle[emp.status] ?? 'text-slate-500'}`}>{emp.status}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(emp.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-950">₹{emp.basicPay.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(emp); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" title="Edit"><Icon name="edit" /></button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(emp); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Deactivate"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-400">
              Showing {employees.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"><Icon name="chevronLeft" /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => setPage(n)} className={`h-8 w-8 rounded-lg text-xs font-medium ${page === n ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-500'}`}>{n}</button>
              ))}
              <button type="button" onClick={() => setPage((v) => Math.min(totalPages, v + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"><Icon name="chevronRight" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee Drawer ── */}
      <EmployeeDrawer
        open={selectedEmployee !== null}
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <h2 className="mb-5 text-lg font-bold text-slate-950">{editTarget ? 'Edit Employee' : 'Add New Employee'}</h2>
            {formError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
            <div className="grid grid-cols-2 gap-4">
              {([
                ['Full Name *', 'name', 'text', 'e.g. John Doe'],
                ['Employee ID *', 'employeeId', 'text', 'e.g. EMP011'],
                ['Email *', 'email', 'email', 'john@company.com'],
                ['Phone', 'phone', 'tel', '+91 98765 43210'],
                ['Role *', 'role', 'text', 'Software Developer'],
                ['Basic Pay (₹) *', 'basicPay', 'number', '50000'],
                ['Join Date *', 'joinDate', 'date', ''],
              ] as [string, keyof AddEmployeePayload, string, string][]).map(([label, field, type, placeholder]) => (
                <label key={field} className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={String(form[field] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-700">Department *</span>
                <select value={form.department} onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-300">
                  {departments.filter((d) => d !== 'All').map((d) => <option key={d}>{d}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void handleSave()} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70">
                {saving && <Icon name="spinner" />}
                {editTarget ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <h2 className="mb-2 text-lg font-bold text-slate-950">Deactivate Employee?</h2>
            <p className="mb-5 text-sm text-slate-500">
              This will mark <strong>{deleteTarget.name}</strong> as Inactive. They can be re-activated later.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70">
                {deleting && <Icon name="spinner" />} Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
