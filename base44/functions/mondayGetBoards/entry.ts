import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MONDAY_API_URL = 'https://api.monday.com/v2';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

  const apiToken = Deno.env.get('MONDAY_API_TOKEN');
  if (!apiToken) return Response.json({ error: 'MONDAY_API_TOKEN not set' }, { status: 500 });

  const query = `{
    boards(limit: 50, order_by: created_at) {
      id
      name
      description
      columns {
        id
        title
        type
      }
    }
  }`;

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiToken,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  if (data.errors) return Response.json({ error: data.errors[0].message }, { status: 500 });

  return Response.json({ boards: data.data.boards });
});