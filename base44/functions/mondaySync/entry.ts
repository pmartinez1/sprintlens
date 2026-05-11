import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MONDAY_API_URL = 'https://api.monday.com/v2';

async function mondayQuery(query, apiToken) {
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiToken,
    },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

function extractColumnValue(columnValues, columnId) {
  if (!columnId) return '';
  const col = columnValues.find(c => c.id === columnId);
  if (!col) return '';
  try {
    const parsed = JSON.parse(col.value);
    if (parsed === null) return '';
    if (typeof parsed === 'object') {
      return parsed.label || parsed.text || parsed.name || col.text || '';
    }
    return String(parsed);
  } catch {
    return col.text || '';
  }
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  // Any authenticated user can trigger a sync, the function only reads from Monday.com.
  // asServiceRole is used below solely to write synced data into SprintItem (which is admin-only at the entity level).
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

  const apiToken = Deno.env.get('MONDAY_API_TOKEN');
  if (!apiToken) return Response.json({ error: 'MONDAY_API_TOKEN not set' }, { status: 500 });

  const { board_id } = await req.json();
  if (!board_id) return Response.json({ error: 'board_id required' }, { status: 400 });

  // Fetch the board config from our DB
  const boards = await base44.asServiceRole.entities.Board.filter({ id: board_id });
  if (!boards.length) return Response.json({ error: 'Board not found' }, { status: 404 });
  const board = boards[0];

  // Fetch items from Monday.com
  const query = `{
    boards(ids: [${board.monday_board_id}]) {
      id
      name
      items_page(limit: 200) {
        items {
          id
          name
          column_values {
            id
            value
            text
          }
        }
      }
    }
  }`;

  const data = await mondayQuery(query, apiToken);
  const mondayBoard = data.boards[0];
  if (!mondayBoard) return Response.json({ error: 'Board not found on Monday.com' }, { status: 404 });

  const items = mondayBoard.items_page.items;
  const now = new Date().toISOString();
  let created = 0, updated = 0, deleted = 0;

  // Build a set of monday_item_ids from the latest Monday.com response
  const mondayItemIds = new Set(items.map(i => String(i.id)));

  // Fetch all existing SprintItems for this board and delete any that are no longer in Monday.com
  const existingItems = await base44.asServiceRole.entities.SprintItem.filter({ board_id: board.id });
  const toDelete = existingItems.filter(si => !mondayItemIds.has(si.monday_item_id));
  for (const stale of toDelete) {
    await base44.asServiceRole.entities.SprintItem.delete(stale.id);
    deleted++;
  }

  for (const item of items) {
    const cv = item.column_values;
    const itemData = {
      monday_item_id: String(item.id),
      board_id: board.id,
      monday_board_id: String(board.monday_board_id),
      item_name: item.name,
      task_name: extractColumnValue(cv, 'name') || item.name,
      category: extractColumnValue(cv, board.category_column_id),
      planned: extractColumnValue(cv, board.planned_column_id),
      phase: extractColumnValue(cv, board.phase_column_id),
      priority: extractColumnValue(cv, board.priority_column_id),
      status: extractColumnValue(cv, board.status_column_id),
      estimate_hours: parseFloat(extractColumnValue(cv, board.estimate_column_id)) || 0,
      assignee: '',
      notes: '',
      synced_at: now,
    };

    // Try to find assignee from people column (use display text)
    const peopleCol = cv.find(c => {
      try { const p = JSON.parse(c.value); return p && p.personsAndTeams; } catch { return false; }
    });
    if (peopleCol) {
      itemData.assignee = peopleCol.text || '';
    }

    // Try to find due date from date column
    const dateCol = cv.find(c => {
      try { const p = JSON.parse(c.value); return p && p.date; } catch { return false; }
    });
    if (dateCol) {
      try {
        const p = JSON.parse(dateCol.value);
        itemData.due_date = p.date || '';
      } catch { /* ignore */ }
    }

    // Check if item already exists
    const existing = await base44.asServiceRole.entities.SprintItem.filter({ monday_item_id: String(item.id) });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.SprintItem.update(existing[0].id, itemData);
      updated++;
    } else {
      await base44.asServiceRole.entities.SprintItem.create(itemData);
      created++;
    }
  }

  // Update board last_synced
  await base44.asServiceRole.entities.Board.update(board.id, { last_synced: now });

  return Response.json({ success: true, created, updated, deleted, total: items.length });
});