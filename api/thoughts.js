const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    console.log('Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      supabaseUrlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'undefined',
      supabaseKeyPreview: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'undefined'
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY environment variables are required');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created successfully');
  }
  return supabase;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseClient = getSupabaseClient();
    
    console.log('Starting thoughts fetch...');
    
    // Query the gmx_memory table to find records with thoughts array
    const { data, error } = await supabaseClient
      .from('gmx_memory')
      .select('key, value, created_at, updated_at')
      .order('updated_at', { ascending: false });
    
    console.log('Supabase query completed');
    console.log('Error:', error);
    console.log('Data count:', data ? data.length : 0);
    
    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Failed to fetch thoughts from database', details: error.message });
    }
    
    if (!data || data.length === 0) {
      console.log('No records found in gmx_memory table');
      return res.status(404).json({ error: 'No records found in gmx_memory table' });
    }
    
    // Look for a record with thoughts
    let thoughtsRecord = null;
    for (const record of data) {
      console.log('Checking record:', {
        key: record.key,
        hasValue: !!record.value,
        valueType: typeof record.value,
        updated_at: record.updated_at
      });
      
      let parsedValue;
      try {
        // Parse the value field if it's a string
        parsedValue = typeof record.value === 'string' ? JSON.parse(record.value) : record.value;
        console.log('Parsed value structure:', {
          hasInputs: !!parsedValue.inputs,
          hasOutputs: !!parsedValue.outputs,
          hasThoughts: !!parsedValue.thoughts,
          inputsLength: parsedValue.inputs ? parsedValue.inputs.length : 0,
          outputsLength: parsedValue.outputs ? parsedValue.outputs.length : 0,
          thoughtsLength: parsedValue.thoughts ? parsedValue.thoughts.length : 0
        });
      } catch (parseError) {
        console.error('Error parsing value for record:', record.key, parseError);
        continue;
      }
      
      if (parsedValue && parsedValue.thoughts && parsedValue.thoughts.length > 0) {
        console.log('Found record with thoughts:', record.key);
        thoughtsRecord = { ...record, parsedValue };
        break;
      }
    }
    
    if (!thoughtsRecord) {
      console.log('No record found with thoughts array');
      return res.status(404).json({ error: 'No thoughts found in any record' });
    }
    
    console.log('Returning thoughts:', thoughtsRecord.parsedValue.thoughts.length, 'thoughts found');
    
    return res.status(200).json({ 
      thoughts: thoughtsRecord.parsedValue.thoughts,
      lastUpdated: thoughtsRecord.updated_at || new Date().toISOString(),
      debug: {
        recordKey: thoughtsRecord.key,
        totalRecords: data.length,
        thoughtsCount: thoughtsRecord.parsedValue.thoughts.length
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorResponse = { 
      error: 'Failed to fetch thoughts',
      details: error.message,
      stack: error.stack
    };
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(errorResponse);
  }
}