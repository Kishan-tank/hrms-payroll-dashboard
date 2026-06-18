import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WorkforceGrowthChartProps {
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
      <p className="font-semibold" style={{ color: 'var(--dash-blue)' }}>
        {payload[0].value.toLocaleString()} employees
      </p>
      <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export default function WorkforceGrowthChart({ data, loading }: WorkforceGrowthChartProps) {
  const chartData = data.map(([month, value]) => ({ month, value }));

  return (
    <div className="dash-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--dash-text)' }}>
            Workforce Growth
          </h2>
          <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
            Headcount trend over time
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: 'var(--dash-blue-dim)', color: 'var(--dash-blue)' }}
        >
          6 months
        </span>
      </div>

      {loading ? (
        <div className="dark-skeleton h-52 w-full" />
      ) : (
        <ResponsiveContainer width="100%" height={208}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="workforce-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.3)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#workforce-gradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#0b1120' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
