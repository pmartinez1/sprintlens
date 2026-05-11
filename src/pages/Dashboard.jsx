import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import KpiCard from '@/components/dashboard/KpiCard';
import SprintProgressChart from '@/components/dashboard/SprintProgressChart';
import VelocityChart from '@/components/dashboard/VelocityChart';
import PlannedVsUnplannedChart from '@/components/dashboard/PlannedVsUnplannedChart';
import StatusBreakdownChart from '@/components/dashboard/StatusBreakdownChart';
import BlockersList from '@/components/dashboard/BlockersList';
import ItemsTable from '@/components/dashboard/ItemsTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutDashboard, AlertTriangle, TrendingUp, Layers, Link, Bot } from 'lucide-react';
import { toast } from 'sonner';
import AgentPanel from '@/components/dashboard/AgentPanel';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('all');
  const [items, setItems] = useState([]);
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  useEffect(() => {
    async function loadData() {
      const loadedBoards = await base44.entities.Board.list();
      setBoards(loadedBoards);
      const allItems = await base44.entities.SprintItem.list('-synced_at', 500);
      const boardIds = new Set(loadedBoards.map(b => b.id));
      setItems(allItems.filter(i => boardIds.has(i.board_id)));
    }
    loadData();
  }, []);

  const filteredByBoard = selectedBoardId === 'all'
    ? items
    : items.filter(i => i.board_id === selectedBoardId);

  const phases = [...new Set(filteredByBoard.map(i => i.phase).filter(Boolean))].sort();

  const filteredItems = phaseFilter === 'all'
    ? filteredByBoard
    : filteredByBoard.filter(i => i.phase === phaseFilter);

  const blockers = filteredItems.filter(i => {
    const s = (i.status || '').toLowerCase();
    return s.includes('stuck') || s.includes('blocked') || s.includes('at risk');
  });

  const doneItems = filteredItems.filter(i => {
    const s = (i.status || '').toLowerCase();
    return s.includes('done') || s.includes('complete');
  });

  const totalHours = filteredItems.reduce((sum, i) => sum + (i.estimate_hours || 0), 0);

  async function handleSync() {
    if (boards.length === 0) {
      toast.error('No boards configured', { description: 'Add a board in the Boards page first.' });
      return;
    }
    setSyncing(true);
    const boardsToSync = selectedBoardId === 'all' ? boards : boards.filter(b => b.id === selectedBoardId);
    let total = 0;
    for (const board of boardsToSync) {
      const res = await base44.functions.invoke('mondaySync', { board_id: board.id });
      total += res.data?.total || 0;
    }
    const updated = await base44.entities.SprintItem.list('-synced_at', 500);
    const boardIds = new Set(boards.map(b => b.id));
    setItems(updated.filter(i => boardIds.has(i.board_id)));
    setSyncing(false);
    toast.success('Sync complete', { description: `${total} items synced from Monday.com` });
  }

  return (
    <AppLayout agentOpen={agentOpen}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            Engineering Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Phase health, blockers & velocity at a glance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {boards.length > 0 && (
            <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
              <SelectTrigger className="w-44 h-8 text-xs bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="All Boards" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="all">All Boards</SelectItem>
                {boards.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {phases.length > 0 && boards.length > 0 && (
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-36 h-8 text-xs bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="All Phases" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectItem value="all">All Phases</SelectItem>
                {phases.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </Button>
          <Button
            size="sm"
            onClick={() => setAgentOpen(o => !o)}
            className={agentOpen 
              ? "h-8 text-xs bg-indigo-600 text-white hover:bg-indigo-700" 
              : "h-8 text-xs border-indigo-500/50 text-white hover:bg-indigo-600"
            }
          >
            <Bot className="w-3.5 h-3.5 mr-1.5" />
            AI Analyst
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Link className="w-10 h-10 text-indigo-400 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No boards connected yet</h2>
          <p className="text-slate-500 text-sm mb-4 max-w-sm">Go to the Boards page to connect your Monday.com boards and start syncing sprint data.</p>
          <a href="/boards" className="text-indigo-400 hover:text-indigo-300 text-sm underline underline-offset-4">Go to Boards →</a>
        </div>
      )}

      {boards.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Total Items"
              value={filteredItems.length}
              subtitle={`${totalHours}h estimated`}
              icon={Layers}
              color="indigo"
            />
            <KpiCard
              title="Completed"
              value={doneItems.length}
              subtitle={`${filteredItems.length > 0 ? Math.round((doneItems.length / filteredItems.length) * 100) : 0}% completion rate`}
              icon={TrendingUp}
              color="green"
            />
            <KpiCard
              title="Blockers"
              value={blockers.length}
              subtitle={blockers.length > 0 ? 'Needs attention' : 'All clear'}
              icon={AlertTriangle}
              color={blockers.length > 0 ? 'red' : 'green'}
            />
            <KpiCard
              title="Unplanned Work"
              value={`${filteredItems.length > 0 ? Math.round((filteredItems.filter(i => (i.planned || '').toLowerCase().includes('unplan')).length / filteredItems.length) * 100) : 0}%`}
              subtitle="of total capacity"
              icon={RefreshCw}
              color="amber"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <SprintProgressChart items={filteredItems} />
            <VelocityChart items={filteredItems} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <PlannedVsUnplannedChart items={filteredItems} />
            <StatusBreakdownChart items={filteredItems} />
            <BlockersList items={filteredItems} />
          </div>

          {/* Items Table */}
          <ItemsTable items={filteredItems} />
        </>
      )}
      <AgentPanel open={agentOpen} onClose={() => setAgentOpen(false)} />
    </AppLayout>
  );
}