import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const highlights = [
  'Employee lifecycle management',
  'Payroll automation foundation',
  'Role-ready dashboard architecture',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Enterprise HRMS & Payroll
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold text-slate-950 sm:text-5xl">
              Automate employee operations from onboarding to payroll.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              A professional Week 1 frontend foundation with routing, reusable UI,
              authentication forms, and backend-ready service structure.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login">
                <Button>Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline">Create account</Button>
              </Link>
            </div>
          </div>

          <Card className="p-0">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Week 1 Scope</h2>
              <p className="mt-1 text-sm text-slate-500">Frontend setup checklist</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {highlights.map((item) => (
                <li className="flex items-center gap-3 px-6 py-4" key={item}>
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    OK
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
