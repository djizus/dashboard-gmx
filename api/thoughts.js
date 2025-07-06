const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseClient = getSupabaseClient();
    
    // Query the gmx_memory table to find records with thoughts array
    const { data, error } = await supabaseClient
      .from('gmx_memory')
      .select('key, value, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch thoughts from database' });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No records found in gmx_memory table' });
    }
    
    // Look for a record with thoughts
    let thoughtsRecord = null;
    for (const record of data) {
      let parsedValue;
      try {
        // Parse the value field if it's a string
        parsedValue = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
      } catch (parseError) {
        continue;
      }
      
      if (parsedValue && parsedValue.thoughts && parsedValue.thoughts.length > 0) {
        thoughtsRecord = { ...record, parsedValue };
        break;
      }
    }
    
    if (!thoughtsRecord) {
      return res.status(404).json({ error: 'No thoughts found in any record' });
    }
    
    return res.status(200).json({ 
      thoughts: thoughtsRecord.parsedValue.thoughts,
      lastUpdated: thoughtsRecord.updated_at || new Date().toISOString()
    });
  } catch (error) {
    const errorResponse = { 
      error: 'Failed to fetch thoughts'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}