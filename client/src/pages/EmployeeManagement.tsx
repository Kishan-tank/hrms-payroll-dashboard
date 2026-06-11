import { useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  joinDate: string;
}

const employees: Employee[] = [
  { id: 'EMP001', name: 'Anil Kumar', department: 'Engineering', role: 'Senior Developer', status: 'Active', joinDate: 'Jan 15, 2022' },
  { id: 'EMP002', name: 'Priya Nair', department: 'Marketing', role: 'Marketing Lead', status: 'Active', joinDate: 'Mar 8, 2021' },
  { id: 'EMP003', name: 'Rahul Mehta', department: 'Sales', role: 'Sales Manager', status: 'Active', joinDate: 'Jun 12, 2020' },
  { id: 'EMP004', name: 'Deepa Rao', department: 'HR', role: 'HR Executive', status: 'On Leave', joinDate: 'Nov 3, 2022' },
  { id: 'EMP005', name: 'Suresh Kumar', department: 'Finance', role: 'Finance Analyst', status: 'Active', joinDate: 'Feb 20, 2023' },
  { id: 'EMP006', name: 'Meena Patel', department: 'Operations', role: 'Ops Manager', status: 'Active', joinDate: 'Sep 1, 2019' },
  { id: 'EMP007', name: 'Ravi Shankar', department: 'Engineering', role: 'Backend Developer', status: 'Inactive', joinDate: 'Apr 17, 2022' },
  { id: 'EMP008', name: 'Lakshmi Devi', department: 'Marketing', role: 'Content Writer', status: 'Active', joinDate: 'Jul 29, 2023' },
  { id: 'EMP009', name: 'Ankit Sharma', department: 'Sales', role: 'Sales Executive', status: 'Active', joinDate: 'Dec 5, 2021' },
  { id: 'EMP010', name: 'Sunita Verma', department: 'HR', role: 'Recruiter', status: 'Active', joinDate: 'Aug 14, 2022' },
];

const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

const statusStyle: Record<string, string> = {
  Active: 'text-green-500',
  'On Leave': 'text-amber-500',
  Inactive: 'text-red-500',
};

function Icon({ name }: { name: 'search' | 'filter' | 'plus' | 'eye' | 'edit' | 'trash' | 'chevronLeft' | 'chevronRight' }) {
  const common = { className: 'h-4 w-4', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'search') return <svg {...common}><path d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>;
  if (name === 'filter') return <svg {...common}><path d="M3 5h18M6 12h12M10 19h4" /></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" /><path d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
  if (name === 'edit') return <svg {...common}><path d="M12 20h9" /><path d="m16.5 3.5 4 4L7 21H3v-4z" /></svg>;
  if (name === 'trash') return <svg {...common}><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6" /></svg>;
  if (name === 'chevronLeft') return <svg {...common}><path d="m15 18-6-6 6-6" /></svg>;
  return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
}

export default function EmployeeManagement() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const perPage = 7;

  const filtered = useMemo(
    () =>
      employees.filter((employee) => {
        const matchesSearch =
          search === '' ||
          employee.name.toLowerCase().includes(search.toLowerCase()) ||
          employee.id.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && (department === 'All' || employee.department === department) && (status === 'All' || employee.status === status);
      }),
    [department, search, status],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <DashboardLayout title="Employee Management" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Employee Management</h1>
            <p className="text-sm text-slate-400">{filtered.length} employees found</p>
          </div>
          <button type="button" onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            <Icon name="plus" /> Add Employee
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" /></span>
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search by name or ID..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
          </div>
          <span className="text-slate-400"><Icon name="filter" /></span>
          <select value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee ID', 'Employee Name', 'Department', 'Role', 'Status', 'Join Date', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0">
                  <td className="px-4 py-3 font-mono text-sm text-blue-600">{employee.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{employee.name.charAt(0)}</span>
                      <span className="text-sm font-medium text-slate-950">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">{employee.department}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{employee.role}</td>
                  <td className={`px-4 py-3 text-sm font-semibold ${statusStyle[employee.status]}`}>{employee.status}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{employee.joinDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50"><Icon name="eye" /></button>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Icon name="edit" /></button>
                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"><Icon name="trash" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-400">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}-{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"><Icon name="chevronLeft" /></button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button key={pageNumber} type="button" onClick={() => setPage(pageNumber)} className={`h-8 w-8 rounded-lg text-xs font-medium ${page === pageNumber ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-500'}`}>{pageNumber}</button>
              ))}
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40"><Icon name="chevronRight" /></button>
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <h2 className="mb-5 text-lg font-bold text-slate-950">Add New Employee</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Full Name', 'text', 'e.g. John Doe'],
                ['Employee ID', 'text', 'e.g. EMP011'],
                ['Email', 'email', 'john@company.com'],
                ['Phone', 'tel', '+91 98765 43210'],
                ['Department', 'text', 'Engineering'],
                ['Role', 'text', 'Software Developer'],
                ['Join Date', 'date', ''],
              ].map(([label, type, placeholder]) => (
                <label key={label} className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-700">{label}</span>
                  <input type={type} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-300" />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-500">Cancel</button>
              <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white">Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
