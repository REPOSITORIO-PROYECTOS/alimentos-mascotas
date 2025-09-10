const fetch = require('node-fetch');

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://barker.sistemataup.online/api';

async function register(email, password) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/registrar/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res;
}

async function token(username, password) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

async function getProducts(access) {
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/store/products/`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  return res.json();
}

(async () => {
  console.log('API base:', API_BASE);
  // Prueba rápida: obtener products público
  try {
    const products = await (await fetch(`${API_BASE.replace(/\/$/, '')}/store/products/`)).json();
    console.log('Products (public):', products?.results ? `${products.results.length} items` : products);
  } catch (e) {
    console.error('Error fetching public products', e.message || e);
  }

  // Para usar register/token descomenta y ajusta credentials
  // const r = await register('test+api@example.com', 'TuPass123');
  // console.log('Register status:', r.status);
  // const t = await token('testuser', 'TuPass123');
  // console.log('Token:', t);
  
})();
