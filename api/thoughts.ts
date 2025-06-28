import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;

async function getMongoClient() {
  if (!client) {
    const mongoUrl = process.env.MONGODB_URL;
    console.log('[MongoDB] Environment check:', {
      hasMongoUrl: !!mongoUrl,
      mongoUrlPrefix: mongoUrl ? mongoUrl.substring(0, 20) + '...' : 'undefined'
    });
    
    if (!mongoUrl) {
      console.error('[MongoDB] MONGODB_URL environment variable is not set');
      throw new Error('MONGODB_URL environment variable is not set');
    }
    
    console.log('[MongoDB] Creating new client...');
    client = new MongoClient(mongoUrl);
    
    console.log('[MongoDB] Attempting to connect...');
    await client.connect();
    console.log('[MongoDB] Connected successfully');
  }
  return client;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('[API] Thoughts endpoint called', {
    method: req.method,
    url: req.url,
    hasMongoUrl: !!process.env.MONGODB_URL,
    nodeEnv: process.env.NODE_ENV
  });

  // Health check endpoint
  if (req.url?.includes('health')) {
    return res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      hasMongoUrl: !!process.env.MONGODB_URL
    });
  }

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
    if (error instanceof Error) {
      console.error('[API] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = { 
      error: 'Failed to fetch thoughts',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      hasMongoUrl: !!process.env.MONGODB_URL
    };
    
    // Set proper JSON content type
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}