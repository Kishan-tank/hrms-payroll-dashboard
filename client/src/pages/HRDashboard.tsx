import DashboardCard from '../components/DashboardCard';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import DashboardLayout from '../layouts/DashboardLayout';

interface PayrollRecord {
  department: string;
  employees: number;
  status: string;
  processedOn: string;
}

const payrollRecords: PayrollRecord[] = [
  { department: 'Engineering', employees: 42, status: 'Processed', processedOn: '2026-06-01' },
  { department: 'Human Resources', employees: 8, status: 'In Review', processedOn: '2026-06-03' },
  { department: 'Finance', employees: 12, status: 'Processed', processedOn: '2026-06-02' },
];

const payrollColumns: DataTableColumn<PayrollRecord>[] = [
  { key: 'department', header: 'Department' },
  { key: 'employees', header: 'Employees' },
  {
    key: 'status',
    header: 'Payroll Status',
    render: (row) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          row.status === 'Processed'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-sky-50 text-sky-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  { key: 'processedOn', header: 'Processed On' },
];

export default function HRDashboard() {
  return (
    <DashboardLayout title="HR Manager Dashboard" userName="HR Manager" userRole="HR Manager">
      {/* HR manager metric cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Employees"
          value={126}
          description="Active employees across all departments."
          accentColor="indigo"
        />
        <DashboardCard
          title="Pending Leave Requests"
          value={14}
          description="Requests requiring HR manager review."
          accentColor="amber"
        />
        <DashboardCard
          title="Payroll Status"
          value="92%"
          description="Payroll batches processed for this month."
          accentColor="emerald"
        />
        <DashboardCard
          title="Departments"
          value={7}
          description="Operational departments configured in HRMS."
          accentColor="sky"
        />
      </section>

      {/* Payroll overview table */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-950">Department Payroll Overview</h2>
          <p className="text-sm text-gray-500">Monitor monthly payroll progress department-wise.</p>
        </div>
        <DataTable columns={payrollColumns} data={payrollRecords} />
      </section>
    </DashboardLayout>
  );
}
