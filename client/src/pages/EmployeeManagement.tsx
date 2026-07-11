import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { employeeService } from '../services/hrmsApi';
import type { ApiEmployee } from '../services/hrmsApi';
import { useFocusTrap } from '../hooks/useFocusTrap';
import ContextMenu from '../components/common/ContextMenu';
import { useContextMenu } from '../hooks/useContextMenu';
import { useEmployeeDrawer } from '../context/EmployeeDrawerContext';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  employeeId: z.string().min(2, 'Employee ID is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[+\d\s\-()]{7,15}$/.test(val),
    { message: 'Please enter a valid phone number' }
  ),
  role: z.string().min(2, 'Role is required'),
  basicPay: z.number({ message: 'Basic pay must be a number' })
    .positive('Basic pay must be greater than 0'),
  joinDate: z.string().min(1, 'Join date is required'),
  department: z.string().min(1, 'Department is required'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const emptyForm: EmployeeFormData = {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 7;

  // dropdown states
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ApiEmployee | null>(null);
  const [isModalFullyVisible, setIsModalFullyVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyForm,
  });

  const [isFormDeptOpen, setIsFormDeptOpen] = useState(false);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ApiEmployee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalFullyVisible, setIsDeleteModalFullyVisible] = useState(false);
  
  useEffect(() => {
    if (!deleteTarget) setIsDeleteModalFullyVisible(false);
    else if (shouldReduceMotion) setIsDeleteModalFullyVisible(true);
  }, [deleteTarget, shouldReduceMotion]);

  const deleteModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isDeleteModalFullyVisible, () => {
    if (!deleting) setDeleteTarget(null);
  }, deleteModalRef);

  const { openDrawer } = useEmployeeDrawer();

  const { menuProps, handleContextMenu } = useContextMenu();
  const contextTargetRef = useRef<ApiEmployee | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal) setIsModalFullyVisible(false);
    else if (shouldReduceMotion) setIsModalFullyVisible(true);
  }, [showModal, shouldReduceMotion]);

  useFocusTrap(isModalFullyVisible, () => {
    if (!saving) {
      setShowModal(false);
      reset(emptyForm);
      setIsFormDeptOpen(false);
    }
  }, modalRef);

  const toast = useToast();

  // bulk actions
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = useCallback(() => {
    setSelectedRowIds((prev) => {
      const isAllVisible = employees.length > 0 && employees.every((emp) => prev.has(emp._id));
      const next = new Set(prev);
      if (isAllVisible) {
        employees.forEach((emp) => next.delete(emp._id));
      } else {
        employees.forEach((emp) => next.add(emp._id));
      }
      return next;
    });
  }, [employees]);

  const toggleSelectOne = useCallback((id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkExportCSV = () => {
    const selected = employees.filter((emp) => selectedRowIds.has(emp._id));
    if (selected.length === 0) return;
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Basic Pay'];
    const rows = selected.map((emp) => [
      emp.employeeId,
      `"${emp.name}"`,
      emp.email,
      `"${emp.role}"`,
      `"${emp.department}"`,
      emp.status,
      emp.basicPay.toString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedRowIds(new Set());
  };


  const [showBulkDeptModal, setShowBulkDeptModal] = useState(false);
  const [showBulkDeactivateModal, setShowBulkDeactivateModal] = useState(false);
  const [bulkDeptSelect, setBulkDeptSelect] = useState('Engineering');

  const handleBulkChangeDepartment = () => {
    setShowBulkDeptModal(true);
  };

  const handleBulkDeactivate = async () => {
    try {
      const res = await employeeService.bulkDeactivate(Array.from(selectedRowIds));
      toast.success(res.message || 'Employees deactivated successfully');
      setSelectedRowIds(new Set());
      setShowBulkDeactivateModal(false);
      void fetchEmployees();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeService.getAll({ search, department, status, page, limit: perPage });
      setEmployees(res.employees);
      setTotal(res.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [search, department, status, page]);

  useEffect(() => { 
    void fetchEmployees(); 
    setSelectedRowIds(new Set()); // Clear selection on filter/page change
  }, [fetchEmployees]);

  // ── open add modal ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    reset(emptyForm);
    setFormError(null);
    setIsFormDeptOpen(false);
    setShowModal(true);
  }

  // ── open edit modal ───────────────────────────────────────────────────────
  const openEdit = useCallback((emp: ApiEmployee) => {
    setEditTarget(emp);
    reset({
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
    setIsFormDeptOpen(false);
    setShowModal(true);
  }, [reset]);

  // ── save (add or update) ─────────────────────────────────────────────────
  const handleSave = handleSubmit(async (data: EmployeeFormData) => {
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await employeeService.update(editTarget._id, data);
        toast.success('Employee updated successfully.');
      } else {
        await employeeService.add(data);
        toast.success('Employee added successfully.');
      }
      setShowModal(false);
      reset(emptyForm);
      void fetchEmployees();
    } catch (err) {
      // Inline error — shown inside the modal, right above the form fields.
      // Intentionally NOT a toast: form errors belong next to the form.
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  });

  // ── deactivate ───────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await employeeService.deactivate(deleteTarget._id);
      toast.success(`${deleteTarget.name} has been deactivated.`);
      setDeleteTarget(null);
      void fetchEmployees();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────────
  const columns = useMemo<DataTableColumn<ApiEmployee>[]>(() => [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={employees.length > 0 && employees.every((emp) => selectedRowIds.has(emp._id))}
          onChange={toggleSelectAll}
          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
        />
      ),
      render: (emp) => (
        <div className="flex h-full w-full items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>
          <input
            type="checkbox"
            checked={selectedRowIds.has(emp._id)}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelectOne(emp._id);
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>
      ),
      sortable: false,
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      sortable: true,
      className: 'font-mono text-sm text-blue-600 dark:text-blue-400',
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>{emp.employeeId}</div>,
    },
    {
      key: 'name',
      header: 'Employee Name',
      sortable: true,
      render: (emp) => (
        <div className="flex h-full w-full items-center gap-2.5" onMouseEnter={() => { contextTargetRef.current = emp; }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white/10 dark:text-white">{emp.name.charAt(0)}</span>
          <span className="text-sm font-medium text-slate-950 dark:text-white">{emp.name}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>{emp.department}</div>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>{emp.role}</div>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}><StatusBadge status={emp.status} /></div>,
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      sortable: true,
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>{new Date(emp.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>,
    },
    {
      key: 'basicPay',
      header: 'Basic Pay',
      sortable: true,
      className: 'font-bold text-slate-950 dark:text-white',
      render: (emp) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = emp; }}>{`₹${emp.basicPay.toLocaleString('en-IN')}`}</div>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (emp) => (
        <div className="flex h-full w-full items-center gap-1" onMouseEnter={() => { contextTargetRef.current = emp; }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(emp); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10" title="Edit"><Icon name="edit" /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteTarget(emp); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Deactivate"><Icon name="trash" /></button>
        </div>
      ),
    },
  ], [openEdit, setDeleteTarget, employees, selectedRowIds, toggleSelectAll, toggleSelectOne]);

  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950 dark:text-white">Employee Management</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500">{total} employees found</p>
          </div>
          <button type="button" onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Icon name="plus" /> Add Employee
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400"><Icon name="filter" /></span>
          
          {/* Department Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsDeptOpen(!isDeptOpen); setIsStatusOpen(false); }}
              className="flex items-center justify-between gap-2 w-40 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121]/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {department}
              <svg className={`h-4 w-4 text-slate-400 transition-transform dark:text-slate-500 ${isDeptOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {isDeptOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDeptOpen(false)} />
                <div className="absolute left-0 z-50 mt-2 w-48 max-h-64 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
                  {departments.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDepartment(d); setPage(1); setIsDeptOpen(false); }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        department === d
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsDeptOpen(false); }}
              className="flex items-center justify-between gap-2 w-32 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121]/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {status}
              <svg className={`h-4 w-4 text-slate-400 transition-transform dark:text-slate-500 ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>

            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
                <div className="absolute left-0 z-50 mt-2 w-40 max-h-64 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatus(s); setPage(1); setIsStatusOpen(false); }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        status === s
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <ErrorState
            size="sm"
            description={error}
            onRetry={() => void fetchEmployees()}
          />
        )}

        {/* Table - Desktop Only */}
        <div className="hidden md:block" onContextMenu={(e) => {
          if (!contextTargetRef.current) return;
          handleContextMenu(e, [
            { label: 'View profile', icon: 'eye', onClick: () => openDrawer(contextTargetRef.current!) },
            { label: 'Edit', icon: 'edit', onClick: () => openEdit(contextTargetRef.current!) },
            { separator: true, label: 'Deactivate', icon: 'trash', variant: 'danger', onClick: () => setDeleteTarget(contextTargetRef.current!) },
          ]);
        }}>
          <DataTable
            columns={columns}
            data={employees}
            rowKey={(row) => row._id}
            loading={loading}
            searchable
            searchPlaceholder="Search employees..."
            onSearch={(q) => { setSearch(q); setPage(1); }}
            onPageChange={(p) => setPage(p)}
            totalItems={total}
            currentPage={page}
            pageSize={perPage}
            onRowClick={(emp) => openDrawer(emp)}
            minWidth={900}
            emptyState={
              <EmptyState
                icon={<Icon name="search" />}
                title="No Employees Found"
                description="Try adjusting your filters or add a new employee."
                actionLabel="Add Employee"
                onAction={openAdd}
              />
            }
          />
        </div>

        {/* Mobile Cards View */}
        <div className="flex flex-col gap-3 md:hidden">
          {employees.map((emp) => (
            <div 
              key={emp._id} 
              className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-[#0B1121]"
              onClick={() => openDrawer(emp)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openDrawer(emp);
                }
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{emp.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{emp.employeeId}</p>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
                <div>
                  <p className="text-slate-400">Department</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{emp.department}</p>
                </div>
                <div>
                  <p className="text-slate-400">Role</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{emp.role}</p>
                </div>
                <div>
                  <p className="text-slate-400">Join Date</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">{new Date(emp.joinDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Basic Pay</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">₹{emp.basicPay.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openEdit(emp); }}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(emp); }}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  Deactivate
                </button>
              </div>
            </div>
          ))}
          {employees.length === 0 && !loading && (
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
              <p className="text-sm font-semibold text-slate-500">No employees found.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Bulk Action Bar ── */}
      {selectedRowIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 md:flex items-center gap-4 rounded-full border border-slate-200 bg-white/90 px-6 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-[#0B1121]/90 dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4 dark:border-white/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              {selectedRowIds.size}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleBulkExportCSV} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              Export CSV
            </button>
            <button type="button" onClick={handleBulkChangeDepartment} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10">
              Change Dept
            </button>
            <button type="button" onClick={() => setShowBulkDeactivateModal(true)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
              Deactivate
            </button>
            <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-white/10" />
            <button type="button" onClick={() => setSelectedRowIds(new Set())} className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              Clear
            </button>
          </div>
        </div>
      )}


      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => {
                if (!saving) {
                  setShowModal(false);
                  reset(emptyForm);
                  setIsFormDeptOpen(false);
                }
              }}
            />
            <motion.div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => { if (showModal) setIsModalFullyVisible(true); }}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] outline-none dark:border-white/10 dark:bg-[#0B1121] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <h2 id="employee-modal-title" className="mb-5 text-lg font-bold text-slate-950 dark:text-white">{editTarget ? 'Edit Employee' : 'Add New Employee'}</h2>
            {formError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{formError}</p>}
            <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }}>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['Full Name *', 'name', 'text', 'e.g. John Doe'],
                  ['Employee ID *', 'employeeId', 'text', 'e.g. EMP011'],
                  ['Email *', 'email', 'email', 'john@company.com'],
                  ['Phone', 'phone', 'tel', '+91 98765 43210'],
                  ['Role *', 'role', 'text', 'Software Developer'],
                  ['Basic Pay (₹) *', 'basicPay', 'number', '50000'],
                  ['Join Date *', 'joinDate', 'date', ''],
                ] as [string, keyof EmployeeFormData, string, string][]).map(([label, field, type, placeholder]) => (
                  <label key={field} className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
                    <input
                      type={type}
                      placeholder={placeholder}
                      {...register(field, { valueAsNumber: type === 'number' })}
                      className={`w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:ring-2 dark:bg-white/5 dark:text-white [color-scheme:light] dark:[color-scheme:dark] ${errors[field] ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-300 focus:ring-blue-100 dark:border-white/10 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'}`}
                    />
                    {errors[field] && (
                      <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                        {errors[field]?.message}
                      </p>
                    )}
                  </label>
                ))}
                <div className="block relative">
                  <span className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Department *</span>
                  <button
                    type="button"
                    onClick={() => setIsFormDeptOpen(!isFormDeptOpen)}
                    className={`flex items-center justify-between gap-2 w-full rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none dark:bg-white/5 dark:text-white ${errors.department ? 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-300 dark:border-white/10 dark:focus:border-blue-500'}`}
                  >
                    <span className={watch('department') ? '' : 'text-slate-400 dark:text-slate-500'}>
                      {watch('department') || 'Select Department'}
                    </span>
                    <svg className={`h-4 w-4 text-slate-400 transition-transform dark:text-slate-500 ${isFormDeptOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  {isFormDeptOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFormDeptOpen(false)} />
                      <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-none">
                        {departments.filter((d) => d !== 'All').map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => { setValue('department', d, { shouldValidate: true, shouldDirty: true }); setIsFormDeptOpen(false); }}
                            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                              watch('department') === d
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {errors.department && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); reset(emptyForm); setIsFormDeptOpen(false); }} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 dark:bg-blue-500 dark:hover:bg-blue-600">
                  {saving && <Icon name="spinner" />}
                  {editTarget ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-black/50" 
              onClick={() => { if (!deleting) setDeleteTarget(null); }}
            />
            <motion.div 
              ref={deleteModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-employee-modal"
              tabIndex={-1}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => { if (deleteTarget) setIsDeleteModalFullyVisible(true); }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] outline-none dark:border-white/10 dark:bg-[#0B1121] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <h2 id="delete-employee-modal" className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Deactivate Employee?</h2>
              <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                This will mark <strong>{deleteTarget.name}</strong> as Inactive. They can be re-activated later.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">Cancel</button>
                <button type="button" onClick={() => void handleDelete()} disabled={deleting} className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 dark:bg-red-500 dark:hover:bg-red-600">
                  {deleting && <Icon name="spinner" />} Deactivate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Change Department Modal ── */}
      {showBulkDeptModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-dept-title"
            tabIndex={-1}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)] outline-none dark:border-white/10 dark:bg-[#0B1121] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <h2 id="bulk-dept-title" className="mb-2 text-lg font-bold text-slate-950 dark:text-white">Change Department</h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Select a new department for {selectedRowIds.size} selected employee(s).
            </p>
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <select
                value={bulkDeptSelect}
                onChange={(e) => setBulkDeptSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {departments.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowBulkDeptModal(false)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await employeeService.bulkChangeDepartment(Array.from(selectedRowIds), bulkDeptSelect);
                    toast.success(res.message || 'Department updated successfully');
                    setSelectedRowIds(new Set());
                    setShowBulkDeptModal(false);
                    void fetchEmployees();
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Deactivate Confirm Modal */}
      {showBulkDeactivateModal && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm dark:bg-black/50" />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0B1121]">
            <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Deactivate Employees</h3>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to deactivate {selectedRowIds.size} selected employee(s)? They will lose access to the system.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowBulkDeactivateModal(false)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">Cancel</button>
              <button type="button" onClick={handleBulkDeactivate} className="rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700">Deactivate</button>
            </div>
          </div>
        </>
      )}

      <ContextMenu {...menuProps} />
    </DashboardLayout>
  );
}
