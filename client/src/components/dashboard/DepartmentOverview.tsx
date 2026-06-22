import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = [
  { name: 'Engineering', count: 485, color: 'bg-blue-500' },
  { name: 'Sales & Marketing', count: 312, color: 'bg-purple-500' },
  { name: 'Operations', count: 245, color: 'bg-emerald-500' },
  { name: 'Human Resources', count: 42, color: 'bg-amber-500' },
  { name: 'Finance', count: 38, color: 'bg-indigo-500' },
];

export default function DepartmentOverview() {
  const navigate = useNavigate();
  const maxCount = Math.max(...DEPARTMENTS.map((d) => d.count));

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Department Overview</h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Headcount distribution</p>
        </div>
        <button 
          onClick={() => navigate('/org-chart')}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View Org Chart &rarr;
        </button>
      </div>

      <div className="flex flex-1 flex-col justify-center space-y-5">
        {DEPARTMENTS.map((dept, i) => {
          const widthPercent = (dept.count / maxCount) * 100;
          return (
            <div key={dept.name} className="group">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700 dark:font-semibold dark:text-slate-300">{dept.name}</span>
                <span className="font-semibold text-slate-500 dark:font-medium dark:text-slate-400">{dept.count} members</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 rounded-full ${dept.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
