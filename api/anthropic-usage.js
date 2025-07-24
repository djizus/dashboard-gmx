module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const orgId = process.env.ANTHROPIC_ORG_ID;
    const sessionKey = process.env.ANTHROPIC_SESSION_KEY;
    const deviceId = process.env.ANTHROPIC_DEVICE_ID;
    const anonymousId = process.env.ANTHROPIC_ANONYMOUS_ID;
    
    if (!orgId || !sessionKey || !deviceId || !anonymousId) {
      throw new Error('Missing required Anthropic environment variables');
    }

    // Get date range from query params or default to current month
    const { starting_on, ending_before } = req.query;
    const startDate = starting_on || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = ending_before || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0];

    const url = `https://console.anthropic.com/api/organizations/${orgId}/usage_activities?starting_on=${startDate}&ending_before=${endDate}&categories=true&granularity=daily`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0',
        'Accept': '*/*',
        'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
        'anthropic-client-sha': '787b6872f2c198223570e0508bf88b6f136d9d06',
        'anthropic-client-version': '1',
        'anthropic-client-platform': 'web_console',
        'anthropic-anonymous-id': anonymousId,
        'anthropic-device-id': deviceId,
        'Content-Type': 'application/json',
        'Alt-Used': 'console.anthropic.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Priority': 'u=4',
        'Cookie': `sessionKey=${sessionKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    const errorResponse = { 
      error: 'Failed to fetch Anthropic usage data',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
};