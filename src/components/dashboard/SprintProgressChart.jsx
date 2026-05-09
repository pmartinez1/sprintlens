import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SprintProgressChart({ items }) {
  // Group by sprint
  const sprintMap = {};
  items.forEach(item => {
    const sprint = item.sprint || 'Unassigned';
    if (!sprintMap[sprint]) sprintMap[sprint] = { sprint, total: 0, done: 0, inProgress: 0, notStarted: 0 };
    sprintMap[sprint].total++;
    const s = (item.status || '').toLowerCase();
    if (s.includes('done') || s.includes('complete')) sprintMap[sprint].done++;
    else if (s.includes('progress') || s.includes('working')) sprintMap[sprint].inProgress++;
    else sprintMap[sprint].notStarted++;
  });

  const data = Object.values(sprintMap).sort((a, b) => a.sprint.localeCompare(b.sprint));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Sprint Progress</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="sprint" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Bar dataKey="done" name="Done" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="notStarted" name="Not Started" fill="#334155" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}