import DashboardLayout from '../layouts/DashboardLayout';

export default function ProfilePage() {
  return (
    <DashboardLayout title="My Profile" userName="Anil Kumar" userRole="HR Manager">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
            A
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950">Anil Kumar</h2>
          <p className="text-sm font-semibold text-blue-600">HR Manager</p>
          <p className="mt-3 text-sm leading-6 text-slate-500">People Operations and Payroll Administration</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-blue-600">Profile Information</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Account details</h1>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ['Full Name', 'Anil Kumar'],
              ['Email', 'anil@company.com'],
              ['Department', 'Human Resources'],
              ['Location', 'Hyderabad, India'],
              ['Employee ID', 'HRM-001'],
              ['Access Level', 'HR Manager'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
