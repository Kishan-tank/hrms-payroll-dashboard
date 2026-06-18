import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceTrendChartProps {
  data: Array<[string, number]>;
  loading: boolean;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-xl"
      style={{
        background: 'var(--dash-card-elevated)',
        borderColor: 'var(--dash-border-hover)',
        color: 'var(--dash-text)',
      }}
    >
      <p className="font-semibold" style={{ color: 'var(--dash-purple)' }}>
        {payload[0].value}% attendance
      </p>
      <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export default function AttendanceTrendChart({ data, loading }: AttendanceTrendChartProps) {
  const chartData = data.map(([week, value]) => ({ week, value }));

  return (
    <div className="dash-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--dash-text)' }}>
            Attendance Trends
          </h2>
          <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
            Weekly attendance rate
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: 'var(--dash-purple-dim)', color: 'var(--dash-purple)' }}
        >
          8W
        </span>
      </div>

      {loading ? (
        <div className="dark-skeleton h-52 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={208}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="attendance-line-gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#attendance-line-gradient)"
              strokeWidth={2.5}
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#0b1120' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
