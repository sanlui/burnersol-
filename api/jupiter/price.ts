import type { VercelRequest, VercelResponse } from '@vercel/node';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`https://api.jup.ag/price/v2?ids=${SOL_MINT}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch price' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Price API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}