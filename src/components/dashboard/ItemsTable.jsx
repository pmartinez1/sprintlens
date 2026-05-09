import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';

const STATUS_BADGE = {
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
  complete: 'bg-green-500/20 text-green-400 border-green-500/30',
  'in progress': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  working: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  stuck: 'bg-red-500/20 text-red-400 border-red-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
  'not started': 'bg-slate-700/50 text-slate-400 border-slate-600',
};

function getStatusClass(status) {
  const s = (status || '').toLowerCase();
  for (const [key, cls] of Object.entries(STATUS_BADGE)) {
    if (s.includes(key)) return cls;
  }
  return 'bg-slate-700/50 text-slate-400 border-slate-600';
}

const PRIORITY_BADGE = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Low: 'bg-slate-700/50 text-slate-400 border-slate-600',
};

export default function ItemsTable({ items }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('sprint');
  const [sortDir, setSortDir] = useState('asc');

  const filtered = items.filter(item =>
    [item.item_name, item.category, item.sprint, item.status, item.priority]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortKey] || '';
    const vb = b[sortKey] || '';
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  }

  const cols = [
    { key: 'item_name', label: 'Item' },
    { key: 'category', label: 'Category' },
    { key: 'planned', label: 'Planned' },
    { key: 'sprint', label: 'Sprint' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'estimate_hours', label: 'Est. (h)' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-semibold text-slate-300">All Items</h3>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-800">
              {cols.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left py-2 px-3 text-slate-500 font-medium cursor-pointer hover:text-slate-300 select-none whitespace-nowrap"
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-600">No items found</td></tr>
            ) : sorted.map(item => (
              <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 px-3 text-slate-200 font-medium max-w-xs truncate">{item.item_name}</td>
                <td className="py-2.5 px-3 text-slate-400">{item.category || '—'}</td>
                <td className="py-2.5 px-3">
                  {item.planned && (
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${
                      (item.planned || '').toLowerCase().includes('unplan')
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                    }`}>
                      {item.planned}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-400">{item.sprint || '—'}</td>
                <td className="py-2.5 px-3">
                  {item.priority && (
                    <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${PRIORITY_BADGE[item.priority] || 'bg-slate-700/50 text-slate-400 border-slate-600'}`}>
                      {item.priority}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-1.5 py-0.5 rounded border text-xs font-medium ${getStatusClass(item.status)}`}>
                    {item.status || '—'}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">{item.estimate_hours || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-600 mt-3">{sorted.length} of {items.length} items</p>
    </div>
  );
}