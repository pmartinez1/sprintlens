import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b'];

export default function PlannedVsUnplannedChart({ items }) {
  let planned = 0, unplanned = 0;
  items.forEach(item => {
    const p = (item.planned || '').toLowerCase();
    if (p.includes('unplan') || p === 'no' || p === 'false') unplanned++;
    else planned++;
  });

  const data = [
    { name: 'Planned', value: planned },
    { name: 'Unplanned', value: unplanned },
  ];

  const total = planned + unplanned;
  const pct = total > 0 ? Math.round((unplanned / total) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-1">Planned vs Unplanned</h3>
      <p className={`text-xs mb-3 ${pct > 30 ? 'text-amber-400' : 'text-slate-500'}`}>
        {pct}% unplanned capacity impact{pct > 30 ? ' ⚠️' : ''}
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
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