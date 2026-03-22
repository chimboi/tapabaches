const UPSTASH_URL = process.env.tapabaches_KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.tapabaches_KV_REST_API_TOKEN;

async function kvGet(key) {
  const res = await fetch(`${UPSTASH_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
  });
  const data = await res.json();
  if (data.result) return JSON.parse(data.result);
  return [];
}

async function kvSet(key, value) {
  await fetch(`${UPSTASH_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const reports = await kvGet('reports');
    return res.status(200).json(reports);
  }

  if (req.method === 'POST') {
    const report = req.body;
    if (!report.ubicacion || !report.descripcion) {
      return res.status(400).json({ error: 'ubicacion y descripcion son requeridos' });
    }

    const reports = await kvGet('reports');
    const newReport = {
      id: String(Date.now()),
      fecha: new Date().toISOString(),
      ubicacion: report.ubicacion,
      lat: report.lat || null,
      lng: report.lng || null,
      descripcion: report.descripcion,
      foto: report.foto || null,
      reportadoPor: report.reportadoPor || 'Anonimo',
      estado: 'pendiente'
    };

    reports.push(newReport);
    await kvSet('reports', reports);
    return res.status(201).json(newReport);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
