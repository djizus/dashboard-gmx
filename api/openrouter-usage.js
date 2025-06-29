module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionToken = process.env.OPENROUTER_COOKIE;
    if (!sessionToken) {
      throw new Error('OPENROUTER_COOKIE environment variable is not set');
    }

    // Format the cookie properly with __session= prefix
    const cookie = `__session=${sessionToken}`;

    const response = await fetch('https://openrouter.ai/api/frontend/user/transaction-analytics', {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Referer': 'https://openrouter.ai/activity',
        'Cookie': cookie
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process and return the data
    return res.status(200).json(data);
  } catch (error) {
    const errorResponse = { 
      error: 'Failed to fetch OpenRouter usage data',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
};