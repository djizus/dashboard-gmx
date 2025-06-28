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
  console.log('[API] Thoughts endpoint called', {
    method: req.method,
    headers: req.headers,
    hasMongoUrl: !!process.env.MONGODB_URL
  });

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Connecting to MongoDB...');
    const mongoClient = await getMongoClient();
    
    console.log('[API] Connected! Accessing database...');
    const db = mongoClient.db('vega_trading_agent');
    const collection = db.collection('gmx_memory');
    
    console.log('[API] Querying for documents with thoughts...');
    // Find documents with thoughts array that is not empty
    // Using dot notation to check if at least one thought exists
    const document = await collection.findOne({ 
      'thoughts.0': { $exists: true }
    });
    
    console.log('[API] Query result:', {
      found: !!document,
      hasThoughts: !!document?.thoughts,
      thoughtsCount: document?.thoughts?.length || 0
    });
    
    if (!document || !document.thoughts) {
      console.log('[API] No thoughts found, returning 404');
      return res.status(404).json({ error: 'No thoughts found' });
    }
    
    console.log('[API] Returning thoughts successfully');
    // Return the thoughts array
    return res.status(200).json({ 
      thoughts: document.thoughts,
      lastUpdated: document.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] MongoDB error:', error);
    console.error('[API] Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return res.status(500).json({ 
      error: 'Failed to fetch thoughts',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}