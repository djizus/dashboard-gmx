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
      .select('*')
      .not('value->thoughts', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Failed to fetch thoughts from database' });
    }
    
    if (!data || !data.value || !data.value.thoughts) {
      return res.status(404).json({ error: 'No thoughts found' });
    }
    
    return res.status(200).json({ 
      thoughts: data.value.thoughts,
      lastUpdated: data.updated_at || new Date().toISOString()
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorResponse = { 
      error: 'Failed to fetch thoughts'
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}