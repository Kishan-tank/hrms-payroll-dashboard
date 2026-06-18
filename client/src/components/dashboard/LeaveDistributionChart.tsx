import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface LeaveDistributionChartProps {
  data: Array<[string, number, string]>;
  loading: boolean;
}

// Fallback / default data matching V0 design
const DEFAULT_DATA: Array<[string, number, string]> = [
  ['Annual',  42, '#3b82f6'],
  ['Sick',    26, '#8b5cf6'],
  ['Casual',  18, '#22c55e'],
  ['Unpaid',  14, '#f59e0b'],
];

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
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
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
        {payload[0].value}%
      </p>
    </div>
  );
}

export default function LeaveDistributionChart({ data, loading }: LeaveDistributionChartProps) {
  const raw = data.length > 0 ? data : DEFAULT_DATA;
  const chartData = raw.map(([name, value, color]) => ({ name, value, color }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="dash-card p-5">
      <div className="mb-3">
        <h2 className="font-semibold" style={{ color: 'var(--dash-text)' }}>
          Leave Distribution
        </h2>
        <p className="text-xs" style={{ color: 'var(--dash-muted)' }}>
          By leave type this quarter
        </p>
      </div>

      {loading ? (
        <div className="dark-skeleton h-52 w-full" />
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Donut */}
          <div className="relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: 'var(--dash-text)' }}>
                {total}%
              </span>
              <span className="text-xs" style={{ color: 'var(--dash-muted)' }}>
                Total leave
              </span>
            </div>
          </div>

          {/* Legend — 2-column grid */}
          <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
            {chartData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                  <span className="text-xs" style={{ color: 'var(--dash-muted-light)' }}>
                    {name}
                  </span>
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--dash-text)' }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
