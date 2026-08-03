import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService } from '../../services/hrmsApi';

interface ExecutiveOverviewProps {
  summaryCards: [string, string | number, string, string, string][];
  headcountData: any[];
  attritionRiskProfile?: Array<{ department: string; riskScore: number }>;
  loading: boolean;
  CustomTooltip: any;
}

export default function ExecutiveOverview({
  summaryCards,
  headcountData,
  attritionRiskProfile,
  loading,
  CustomTooltip,
}: ExecutiveOverviewProps) {
  const [attritionRiskData, setAttritionRiskData] = useState<Array<{ department: string; riskScore: number }>>([]);
  const [attritionRiskLoading, setAttritionRiskLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (attritionRiskProfile && attritionRiskProfile.length > 0) {
      setAttritionRiskData(attritionRiskProfile);
      setAttritionRiskLoading(false);
      return;
    }

    const loadAttritionRisk = async () => {
      setAttritionRiskLoading(true);
      try {
        const response = await analyticsService.getAttritionRisk();
        if (active) {
          setAttritionRiskData(Array.isArray(response?.attritionRisk) ? response.attritionRisk : []);
        }
      } catch (error) {
        console.error('Failed to load attrition risk', error);
        if (active) {
          setAttritionRiskData([]);
        }
      } finally {
        if (active) {
          setAttritionRiskLoading(false);
        }
      }
    };

    void loadAttritionRisk();
    return () => {
      active = false;
    };
  }, [attritionRiskProfile]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map(([label, value, trend, colorText, colorBg]) => (
          <div key={label} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#0B1121] dark:hover:border-white/20">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${colorBg}`} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between mb-4">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorBg} ${colorText} text-sm font-bold`}>
                  {label.slice(0, 2).toUpperCase()}
                </span>
                {trend && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                    {trend}
                  </span>
                )}
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {loading ? (
                    <span className="inline-block h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  ) : (
                    value
                  )}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                {label === 'Attrition Risk' && (
                  <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 italic">Based on recorded deactivations</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Headcount Trend (Area Chart) - Real Data */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] lg:col-span-2">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Headcount Growth Overview</h2>
          {loading ? (
            <div className="flex h-72 items-center justify-center text-slate-400">Loading chart...</div>
          ) : headcountData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-slate-400">
              <p className="text-sm font-semibold">No headcount growth data available for this range.</p>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData}>
                  <defs>
                    <linearGradient id="colorHcMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="headcount" name="Headcount" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorHcMain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Attrition Risk (Deactivation Rate) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Attrition Risk Profile</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Deactivation rate by department</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">LIVE</span>
          </div>
          {attritionRiskLoading || loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800/50" />
                  <div className="h-2 w-full animate-pulse rounded-full bg-slate-100 dark:bg-slate-800/50" />
                </div>
              ))}
            </div>
          ) : attritionRiskData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No employee deactivation records found.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {attritionRiskData.map((dept) => (
                  <div key={dept.department}>
                    <div className="mb-1 flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{dept.department}</span>
                      <span className={dept.riskScore > 20 ? 'text-red-500' : 'text-slate-500'}>{dept.riskScore}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                      <div
                        className={`h-full rounded-full ${dept.riskScore > 20 ? 'bg-red-500' : dept.riskScore > 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(dept.riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-slate-500 italic">
                Based on recorded employee deactivations (not predictive)
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
