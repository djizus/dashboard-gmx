const { MongoClient } = require('mongodb');

let client = null;

async function getMongoClient() {
  if (!client) {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error('MONGODB_URL environment variable is not set');
    }
    client = new MongoClient(mongoUrl);
    await client.connect();
  }
  return client;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('vega_trading_agent');
    const collection = db.collection('gmx_memory');
    
    const document = await collection.findOne({ 
      'value.thoughts.0': { $exists: true }
    });
    
    if (!document || !document.value || !document.value.thoughts) {
      return res.status(404).json({ error: 'No thoughts found' });
    }
    
    return res.status(200).json({ 
      thoughts: document.value.thoughts,
      lastUpdated: document.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    const errorResponse = { 
      error: 'Failed to fetch thoughts'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}