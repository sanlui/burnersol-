export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const SOL_MINT = 'So11111111111111111111111111111111111111112';
    const ids = req.query.ids || SOL_MINT;
    const url = 'https://api.jup.ag/price/v2?ids=' + ids;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch price' });
    }

    const data = await response.json();
    res.setHeader('Cache-Control', 'public, max-age=15');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Price API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
