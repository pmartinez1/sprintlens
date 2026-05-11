import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { board_id } = await req.json().catch(() => ({}));

  const items = board_id
    ? await base44.asServiceRole.entities.SprintItem.filter({ board_id })
    : await base44.asServiceRole.entities.SprintItem.list('-synced_at', 500);

  return Response.json({ items });
});