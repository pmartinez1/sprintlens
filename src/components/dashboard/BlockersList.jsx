import { AlertTriangle, Clock } from 'lucide-react';

const BLOCKER_STATUSES = ['stuck', 'blocked', 'at risk'];

function isBlocker(item) {
  const s = (item.status || '').toLowerCase();
  return BLOCKER_STATUSES.some(b => s.includes(b));
}

const PRIORITY_COLORS = {
  Critical: 'text-red-400 bg-red-500/10 border-red-500/30',
  High: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export default function BlockersList({ items }) {
  const blockers = items.filter(isBlocker);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <h3 className="text-sm font-semibold text-slate-300">Blockers & At-Risk Items</h3>
        {blockers.length > 0 && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
            {blockers.length}
          </span>
        )}
      </div>

      {blockers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-600">
          <Clock className="w-8 h-8 mb-2" />
          <p className="text-sm">No blockers detected</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {blockers.map(item => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{item.item_name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500">{item.sprint}</span>
                  {item.priority && (
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${PRIORITY_COLORS[item.priority] || PRIORITY_COLORS.Low}`}>
                      {item.priority}
                    </span>
                  )}
                  <span className="text-xs text-red-400 font-medium">{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}