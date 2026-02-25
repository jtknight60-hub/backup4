const base = process.env.API_BASE || 'http://localhost:54117/api';
const headers = { 'Content-Type': 'application/json' };

async function req(path, opts) {
  try {
    const res = await fetch(base + path, opts);
    const text = await res.text();
    console.log(`\n=== ${opts?.method || 'GET'} ${path} --> ${res.status} ${res.statusText}`);
    try { console.log(JSON.parse(text)); } catch { console.log(text); }
  } catch (err) {
    console.error(`\nERROR ${opts?.method || 'GET'} ${path}:`, err.message);
  }
}

(async () => {
  await req('/products');
  await req('/auth/register', { method: 'POST', headers, body: JSON.stringify({ email: 'test+ai@example.com', password: 'Test1234!', name: 'Test User' }) });
  // capture login token
  let token = null;
  try {
    const res = await fetch(base + '/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: 'test+ai@example.com', password: 'Test1234!' }) });
    const json = await res.json();
    console.log(`\n=== POST /auth/login --> ${res.status} ${res.statusText}`);
    console.log(json);
    if (json && json.token) token = json.token;
  } catch (err) {
    console.error('Login request failed', err.message);
  }

  // use token to fetch orders
  const authHeaders = token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
  await req('/orders', { method: 'GET', headers: authHeaders });
})();
