import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trello, Plus, RefreshCw, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [mondayBoards, setMondayBoards] = useState([]);
  const [loadingMonday, setLoadingMonday] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [form, setForm] = useState({
    monday_board_id: '',
    phase_column_id: '',
    status_column_id: '',
    planned_column_id: '',
    priority_column_id: '',
    estimate_column_id: '',
    category_column_id: '',
  });
  const [selectedMondayBoard, setSelectedMondayBoard] = useState(null);
  const [showColumnMapping, setShowColumnMapping] = useState(false);

  function autoMapColumns(columns) {
    const find = (keywords) => {
      const col = columns.find(c =>
        keywords.some(kw => c.title.toLowerCase().includes(kw))
      );
      return col?.id || '';
    };
    return {
      status_column_id: find(['status']),
      phase_column_id: find(['phase', 'sprint', 'iteration']),
      planned_column_id: find(['planned', 'unplanned', 'scope']),
      priority_column_id: find(['priority']),
      estimate_column_id: find(['estimate', 'hours', 'effort', 'points']),
      category_column_id: find(['category', 'type', 'label']),
    };
  }

  useEffect(() => {
    base44.entities.Board.list().then(setBoards);
  }, []);

  async function loadMondayBoards() {
    setLoadingMonday(true);
    const res = await base44.functions.invoke('mondayGetBoards', {});
    setMondayBoards(res.data?.boards || []);
    setLoadingMonday(false);
  }

  function handleSelectMondayBoard(boardId) {
    const board = mondayBoards.find(b => b.id === boardId);
    setSelectedMondayBoard(board);
    const autoMapped = autoMapColumns(board?.columns || []);
    setForm(f => ({ ...f, monday_board_id: boardId, ...autoMapped }));
    setShowColumnMapping(false);
  }

  async function handleAddBoard() {
    if (!form.monday_board_id || !selectedMondayBoard) return;
    await base44.entities.Board.create({
      monday_board_id: form.monday_board_id,
      name: selectedMondayBoard.name,
      description: selectedMondayBoard.description || '',
      is_active: true,
      phase_column_id: form.phase_column_id,
      status_column_id: form.status_column_id,
      planned_column_id: form.planned_column_id,
      priority_column_id: form.priority_column_id,
      estimate_column_id: form.estimate_column_id,
      category_column_id: form.category_column_id,
    });
    const updated = await base44.entities.Board.list();
    setBoards(updated);
    setShowAddForm(false);
    setForm({ monday_board_id: '', phase_column_id: '', status_column_id: '', planned_column_id: '', priority_column_id: '', estimate_column_id: '', category_column_id: '' });
    setSelectedMondayBoard(null);
    toast.success('Board added', { description: `${selectedMondayBoard.name} is now tracked.` });
  }

  async function handleDelete(board) {
    await base44.entities.Board.delete(board.id);
    setBoards(b => b.filter(x => x.id !== board.id));
    toast.success('Board removed');
  }

  async function handleSync(board) {
    setSyncing(s => ({ ...s, [board.id]: true }));
    const res = await base44.functions.invoke('mondaySync', { board_id: board.id });
    const updated = await base44.entities.Board.list();
    setBoards(updated);
    setSyncing(s => ({ ...s, [board.id]: false }));
    toast.success('Sync complete', { description: `${res.data?.total || 0} items synced.` });
  }

  const columns = selectedMondayBoard?.columns || [];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trello className="w-5 h-5 text-indigo-400" />
            Boards
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your Monday.com board connections</p>
        </div>
        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => { setShowAddForm(true); loadMondayBoards(); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Board
          </Button>
        )}
      </div>

      {/* Add Board Form */}
      {showAddForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Connect a Monday.com Board</h2>

          <div className="mb-4">
            <Label className="text-xs text-slate-400 mb-1.5 block">Select Board</Label>
            {loadingMonday ? (
              <p className="text-sm text-slate-500 animate-pulse">Loading boards from Monday.com…</p>
            ) : (
              <Select onValueChange={handleSelectMondayBoard}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue placeholder="Choose a board…" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  {mondayBoards.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedMondayBoard && (
            <>
              <p className="text-xs text-green-400 mb-3">✓ Columns auto-mapped from board data.</p>
              <button
                type="button"
                className="text-xs text-indigo-400 hover:text-indigo-300 underline mb-4 block"
                onClick={() => setShowColumnMapping(v => !v)}
              >
                {showColumnMapping ? 'Hide column mapping' : 'Customize column mapping'}
              </button>
              {showColumnMapping && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                  {[
                    { key: 'status_column_id', label: 'Status Column' },
                    { key: 'phase_column_id', label: 'Phase Column' },
                    { key: 'planned_column_id', label: 'Planned/Unplanned Column' },
                    { key: 'priority_column_id', label: 'Priority Column' },
                    { key: 'estimate_column_id', label: 'Estimate (hours) Column' },
                    { key: 'category_column_id', label: 'Category Column' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className="text-xs text-slate-400 mb-1 block">{label}</Label>
                      <Select value={form[key]} onValueChange={val => setForm(f => ({ ...f, [key]: val }))}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200 text-xs h-8">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                          <SelectItem value={null}>— None —</SelectItem>
                          {columns.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.title} <span className="text-slate-500">({c.type})</span></SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddBoard} disabled={!form.monday_board_id} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Board
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Board list */}
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Trello className="w-10 h-10 text-slate-600 mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No boards connected</h2>
          <p className="text-slate-500 text-sm">Add your first Monday.com board to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {boards.map(board => (
            <div key={board.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">{board.name}</h3>
                  {board.is_active && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded-full">Active</span>}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Board ID: {board.monday_board_id}</p>
                {board.last_synced && (
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Last synced: {new Date(board.last_synced).toLocaleString()}
                  </p>
                )}
                {!board.last_synced && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Never synced
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync(board)}
                  disabled={syncing[board.id]}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing[board.id] ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(board)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}