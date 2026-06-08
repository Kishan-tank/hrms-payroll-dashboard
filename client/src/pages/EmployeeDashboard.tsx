import DashboardCard from '../components/DashboardCard';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import DashboardLayout from '../layouts/DashboardLayout';

interface LeaveRecord {
  type: string;
  from: string;
  to: string;
  status: string;
}

const leaveRecords: LeaveRecord[] = [
  { type: 'Casual Leave', from: '2026-06-12', to: '2026-06-13', status: 'Pending' },
  { type: 'Sick Leave', from: '2026-05-20', to: '2026-05-21', status: 'Approved' },
  { type: 'Earned Leave', from: '2026-04-08', to: '2026-04-10', status: 'Approved' },
];

const leaveColumns: DataTableColumn<LeaveRecord>[] = [
  { key: 'type', header: 'Leave Type' },
  { key: 'from', header: 'From' },
  { key: 'to', header: 'To' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          row.status === 'Approved'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function EmployeeDashboard() {
  return (
    <DashboardLayout title="Employee Dashboard" userRole="Employee">
      {/* Employee metric cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Leaves"
          value={24}
          description="Annual leave balance assigned for this year."
          accentColor="indigo"
        />
        <DashboardCard
          title="Pending Leaves"
          value={2}
          description="Leave requests currently waiting for HR approval."
          accentColor="amber"
        />
        <DashboardCard
          title="Approved Leaves"
          value={8}
          description="Approved leave requests in the current cycle."
          accentColor="emerald"
        />
        <DashboardCard
          title="Payslips"
          value={6}
          description="Available monthly payslips for download."
          accentColor="sky"
        />
      </section>

      {/* Recent leave activity */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-950">Recent Leave Requests</h2>
          <p className="text-sm text-gray-500">Track submitted leave applications and approval status.</p>
        </div>
        <DataTable columns={leaveColumns} data={leaveRecords} />
      </section>
    </DashboardLayout>
  );
}
