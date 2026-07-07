import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsService, type ApiAttendance } from '../../services/hrmsApi';

interface AttendanceAnalyticsProps {
  attendanceRecords: ApiAttendance[];
  deptAttn: any[]; // Existing data from reportsService.getDeptAttendance()
  loading: boolean;
  CustomTooltip: any;
}

export default function AttendanceAnalytics({ attendanceRecords, deptAttn, loading, CustomTooltip }: AttendanceAnalyticsProps) {
  const [heatmapData, setHeatmapData] = useState<Array<Record<string, string | number>>>([]);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadHeatmap = async () => {
      setHeatmapLoading(true);
      try {
        const response = await analyticsService.getAttendanceHeatmap();
        if (active) {
          setHeatmapData(Array.isArray(response?.heatmap) ? response.heatmap : []);
        }
      } catch (error) {
        console.error('Failed to load attendance heatmap', error);
        if (active) {
          setHeatmapData([]);
        }
      } finally {
        if (active) {
          setHeatmapLoading(false);
        }
      }
    };

    void loadHeatmap();
    return () => {
      active = false;
    };
  }, []);

  const heatmapColumns = useMemo(() => {
    if (heatmapData.length === 0) {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    }

    return Object.keys(heatmapData[0]).filter((key) => key !== 'time');
  }, [heatmapData]);

  // Compute Attendance Trend (Last 7 Days)
  const attendanceTrend = useMemo(() => {
    // Basic computation mocking a real trend based on actual records
    // In a real app, this would group by date and calculate percentage
    const recent = attendanceRecords.slice(0, 30);
    const trend = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (let i = 0; i < 5; i++) {
      const dayRecs = recent.filter((_, idx) => idx % 5 === i);
      const present = dayRecs.filter(r => r.status === 'Present').length;
      const total = dayRecs.length || 1;
      trend.push({ name: days[i], rate: Math.round((present / total) * 100) });
    }
    return trend;
  }, [attendanceRecords]);

  // Compute Late Arrival Trend (Last 7 Days)
  const lateTrend = useMemo(() => {
    const recent = attendanceRecords.slice(0, 30);
    const trend = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (let i = 0; i < 5; i++) {
      const dayRecs = recent.filter((_, idx) => idx % 5 === i);
      const late = dayRecs.filter(r => r.status === 'Late').length;
      trend.push({ name: days[i], count: late });
    }
    return trend;
  }, [attendanceRecords]);

  const HEATMAP_COLORS = ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6'];
  const getHeatmapColor = (value: number) => {
    if (value >= 98) return HEATMAP_COLORS[5];
    if (value >= 95) return HEATMAP_COLORS[4];
    if (value >= 90) return HEATMAP_COLORS[3];
    if (value >= 85) return HEATMAP_COLORS[2];
    if (value >= 80) return HEATMAP_COLORS[1];
    return HEATMAP_COLORS[0];
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Attendance Trend</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend}>
                  <defs>
                    <linearGradient id="colorAttn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAttn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Late Arrival Trend */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Late Arrivals</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lateTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                  <Bar dataKey="count" name="Late Staff" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Department Attendance Comparison (Real Data from reportsService) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Dept Comparison</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptAttn} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                  <Bar dataKey="attendance" name="Attendance %" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Monthly Attendance Heatmap */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Monthly Heatmap</h2>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">LIVE</span>
          </div>
          {heatmapLoading ? (
            <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="pb-3 pr-4 font-bold text-slate-500">Time</th>
                    {heatmapColumns.map((day) => (
                      <th key={day} className="pb-3 px-2 text-center font-bold text-slate-500">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row, index) => (
                    <tr key={`${row.time ?? 'row'}-${index}`}>
                      <td className="py-2 pr-4 font-semibold text-slate-700 dark:text-slate-300">{String(row.time ?? row.day ?? `Slot ${index + 1}`)}</td>
                      {heatmapColumns.map((day) => (
                        <td key={day} className="p-1">
                          <div
                            className="flex h-8 items-center justify-center rounded-md font-bold text-slate-900"
                            style={{ backgroundColor: getHeatmapColor(Number(row[day] ?? 0)) }}
                            title={`${row[day]}%`}
                          >
                            {row[day]}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
