import DashboardLayout from '../layouts/DashboardLayout';

const colors = [
  ['Primary', '#2563EB'],
  ['Secondary', '#0F172A'],
  ['Success', '#22C55E'],
  ['Warning', '#F59E0B'],
  ['Danger', '#EF4444'],
  ['Background', '#F8FAFC'],
  ['Surface', '#FFFFFF'],
  ['Muted', '#94A3B8'],
];

const badges = [
  ['Active', 'bg-emerald-50 text-emerald-600'],
  ['Pending', 'bg-amber-50 text-amber-600'],
  ['Rejected', 'bg-red-50 text-red-600'],
  ['On Leave', 'bg-violet-50 text-violet-600'],
  ['Paid', 'bg-blue-50 text-blue-600'],
];

export default function DesignSystemPage() {
  return (
    <DashboardLayout title="Design System" userName="Anil Kumar" userRole="HR Manager">
      <div className="max-w-5xl space-y-8">
        <section>
          <h1 className="text-2xl font-bold text-slate-950">Design System</h1>
          <p className="mt-1 text-sm text-slate-500">Reusable components and tokens for HRMSPro.</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Color Palette</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map(([name, value]) => (
              <div key={name} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="h-16" style={{ background: value }} />
                <div className="p-3">
                  <p className="text-xs font-bold text-slate-950">{name}</p>
                  <p className="font-mono text-xs text-slate-400">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white" type="button">Primary</button>
            <button className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white" type="button">Secondary</button>
            <button className="rounded-xl border border-blue-600 px-5 py-2.5 text-sm font-bold text-blue-600" type="button">Outlined</button>
            <button className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white" type="button">Success</button>
            <button className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white" type="button">Danger</button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-950">Inputs & Badges</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" placeholder="Default input" />
            <input className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm outline-none" placeholder="Error state" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {badges.map(([label, className]) => (
              <span key={label} className={`rounded-full px-3 py-1.5 text-xs font-bold ${className}`}>{label}</span>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
