import DashboardLayout from '../layouts/DashboardLayout';

const payrollData = [
  { id: 'EMP001', name: 'Anil Kumar', department: 'Engineering', basic: 'Rs. 70,000', deductions: 'Rs. 8,500', net: 'Rs. 61,500', status: 'Paid' },
  { id: 'EMP002', name: 'Priya Nair', department: 'Marketing', basic: 'Rs. 76,000', deductions: 'Rs. 9,200', net: 'Rs. 66,800', status: 'Processing' },
  { id: 'EMP003', name: 'Rahul Mehta', department: 'Sales', basic: 'Rs. 91,000', deductions: 'Rs. 11,000', net: 'Rs. 80,000', status: 'Paid' },
  { id: 'EMP004', name: 'Sneha Rao', department: 'HR', basic: 'Rs. 54,000', deductions: 'Rs. 6,400', net: 'Rs. 47,600', status: 'Pending' },
];

const statusClass: Record<string, string> = {
  Paid: 'bg-blue-50 text-blue-600',
  Processing: 'bg-teal-50 text-teal-600',
  Pending: 'bg-amber-50 text-amber-600',
};

const cards = [
  ['Total Payroll', 'Rs. 48.2L', 'June 2026 cycle', '#2563EB', 'TP'],
  ['Employees Paid', '218', 'Payroll completed', '#22C55E', 'EP'],
  ['Processing', '26', 'Awaiting bank response', '#14B8A6', 'PR'],
  ['Pending Review', '12', 'Needs HR approval', '#F59E0B', 'RV'],
];

export default function PayrollPage() {
  return (
    <DashboardLayout title="Payroll" userName="Anil Kumar" userRole="HR Manager">
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Payroll</h1>
            <p className="text-sm text-slate-400">Process payroll, review deductions, and track payout status.</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600" type="button">Download</button>
            <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white" type="button">Run Payroll</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, sub, color, icon]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
              </div>
              <p className="text-2xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-xs text-slate-400">{sub}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold text-slate-950">June Payroll</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">92% complete</span>
          </div>
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {['Employee', 'Department', 'Basic Pay', 'Deductions', 'Net Pay', 'Status'].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrollData.map((record, index) => (
                <tr key={record.id} className={index < payrollData.length - 1 ? 'border-b border-slate-100 hover:bg-slate-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">{record.name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-bold text-slate-950">{record.name}</span>
                        <span className="block text-xs text-slate-400">{record.id}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{record.department}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-950">{record.basic}</td>
                  <td className="px-4 py-3 text-sm text-red-500">{record.deductions}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-950">{record.net}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[record.status]}`}>{record.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
