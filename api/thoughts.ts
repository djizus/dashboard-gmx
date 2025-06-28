import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('vega_trading_agent');
    const collection = db.collection('gmx_memory');
    
    // Find documents with thoughts array that is not empty
    // Using dot notation to check if at least one thought exists
    const document = await collection.findOne({ 
      'thoughts.0': { $exists: true }
    });
    
    if (!document || !document.thoughts) {
      return res.status(404).json({ error: 'No thoughts found' });
    }
    
    // Return the thoughts array
    return res.status(200).json({ 
      thoughts: document.thoughts,
      lastUpdated: document.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB query error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch thoughts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}