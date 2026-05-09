import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VelocityChart({ items }) {
  const sprintMap = {};
  items.forEach(item => {
    const sprint = item.sprint || 'Unassigned';
    if (!sprintMap[sprint]) sprintMap[sprint] = { sprint, completed: 0, hours: 0 };
    const s = (item.status || '').toLowerCase();
    if (s.includes('done') || s.includes('complete')) {
      sprintMap[sprint].completed++;
      sprintMap[sprint].hours += item.estimate_hours || 0;
    }
  });

  const data = Object.values(sprintMap).sort((a, b) => a.sprint.localeCompare(b.sprint));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Velocity Trend (Completed Items)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="sprint" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Line type="monotone" dataKey="completed" name="Completed Items" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
          <Line type="monotone" dataKey="hours" name="Est. Hours Done" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}