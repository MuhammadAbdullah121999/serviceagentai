import dotenv from 'dotenv';
dotenv.config();

const API = 'http://localhost:5000/api';

async function run() {
  const email = `test-${Date.now()}@example.com`;

  // 1. register
  const reg = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'API Test', email, password: 'password123' }),
  });
  const { token } = await reg.json() as any;
  console.log('register:', reg.status);
  if (!token) return console.error('no token, stopping');

  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // 2. create
  const create = await fetch(`${API}/requests`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({
      title: 'Leaking pipe under kitchen sink',
      description: 'Water pooling in the cabinet, getting worse each day.',
      category: 'Plumbing',
      priority: 'High',
      location: 'Building A, Kitchen',
    }),
  });
  const made = await create.json() as any;
  console.log('create:', create.status, '| status =', made.status);

  // 3. list
  const listRes = await fetch(`${API}/requests?page=1&limit=10`, { headers: auth });
  const listed = await listRes.json() as any;
  console.log('list:', listRes.status, '| total =', listed.pagination?.total);

  // 4. filter
  const filtered = await fetch(`${API}/requests?status=New&priority=High`, { headers: auth });
  const f = await filtered.json() as any;
  console.log('filter:', filtered.status, '| matched =', f.pagination?.total);

  // 5. valid transition: New -> In Progress
  const ok = await fetch(`${API}/requests/${made.id}`, {
    method: 'PATCH', headers: auth,
    body: JSON.stringify({ status: 'In Progress' }),
  });
  const okBody = await ok.json() as any;
  console.log('New -> In Progress:', ok.status, '|', okBody.status);

  // 6. invalid transition should be rejected
  const bad = await fetch(`${API}/requests/${made.id}`, {
    method: 'PATCH', headers: auth,
    body: JSON.stringify({ status: 'BogusStatus' }),
  });
  console.log('invalid status rejected:', bad.status === 400 ? 'yes (400)' : `NO (${bad.status})`);

  // 7. stats
  const st = await fetch(`${API}/requests/stats`, { headers: auth });
  console.log('stats:', await st.json());

  // 8. delete
    const del = await fetch(`${API}/requests/${made.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('delete:', del.status === 204 ? 'yes (204)' : `NO (${del.status})`);
}

run().catch(console.error);