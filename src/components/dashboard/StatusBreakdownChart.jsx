import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  done: '#22c55e',
  complete: '#22c55e',
  'in progress': '#6366f1',
  working: '#6366f1',
  stuck: '#ef4444',
  blocked: '#ef4444',
  'not started': '#475569',
  default: '#94a3b8',
};

function getColor(status) {
  const s = (status || '').toLowerCase();
  for (const [key, color] of Object.entries(STATUS_COLORS)) {
    if (s.includes(key)) return color;
  }
  return STATUS_COLORS.default;
}

export default function StatusBreakdownChart({ items }) {
  const statusMap = {};
  items.forEach(item => {
    const s = item.status || 'Unknown';
    statusMap[s] = (statusMap[s] || 0) + 1;
  });

  const data = Object.entries(statusMap).map(([name, value]) => ({ name, value, color: getColor(name) }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Status Breakdown</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}