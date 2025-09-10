const fetch = require('node-fetch');
const crypto = require('crypto');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://barker.sistemataup.online/api';

async function register(email, password) {
  const url = `${API_BASE.replace(/\/$/, '')}/auth/registrar/`;
  const attempts = [
    { email, password },
    { email, password, username: email },
    { email, password, username: email, first_name: 'API', last_name: 'Test' },
  ];

  for (const payload of attempts) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);
      return { status: res.status, body, payload };
    } catch (e) {
      // try next
      console.error('Register attempt error:', e.message || e);
    }
  }
  return { status: 0, body: 'No response', payloads: attempts };
}

async function getToken(email, password) {
  // El backend espera 'email' en lugar de 'username'
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function refreshToken(refresh) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

async function callProtected(access) {
  // Intentamos POST a /caja/estado/ como ejemplo de endpoint autenticado
  const url = `${API_BASE.replace(/\/$/, '')}/caja/estado/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
    body: JSON.stringify({ action: 'status_check' }),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

(async () => {
  console.log('API base:', API_BASE);

  // 1) public products
  try {
    const publicProducts = await (await fetch(`${API_BASE.replace(/\/$/, '')}/store/products/`)).json();
    console.log('Public products ->', publicProducts?.results ? `${publicProducts.results.length} items` : publicProducts);
  } catch (e) {
    console.error('Public products fetch error:', e.message || e);
  }

  // 2) register a temp user
  const id = crypto.randomBytes(4).toString('hex');
  const email = `apitest+${id}@example.com`;
  const password = `TestPass!${id}`;
  console.log('Registering temp user:', email);
  const reg = await register(email, password);
  console.log('Register status:', reg.status);
  console.log('Register body:', reg.body);

  // 3) obtain token
  console.log('Obtaining token with username=email (or username if backend expects)');
  const t = await getToken(email, password);
  console.log('Token status:', t.status);
  console.log('Token body:', t.body);

  if (t.body && t.body.access) {
    const access = t.body.access;
    const refresh = t.body.refresh;

    // 4) refresh token
    const r = await refreshToken(refresh);
    console.log('Refresh status:', r.status);
    console.log('Refresh body:', r.body);

    // 5) call protected endpoint
    const p = await callProtected(access);
    console.log('Protected call status:', p.status);
    console.log('Protected call body:', p.body);
  } else {
    console.log('No access token obtained; skipping protected call.');
  }

})();
