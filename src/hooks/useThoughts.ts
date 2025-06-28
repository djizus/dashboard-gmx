import { useQuery } from '@tanstack/react-query';

interface Thought {
  content: string;
  timestamp: string;
  type?: string;
}

interface ThoughtsResponse {
  thoughts: Thought[];
  lastUpdated: string;
}

export const useThoughts = () => {
  return useQuery<ThoughtsResponse>({
    queryKey: ['thoughts'],
    queryFn: async () => {
      console.log('[Thoughts] Starting fetch...');
      try {
        const response = await fetch('/api/thoughts');
        
        console.log('[Thoughts] Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        console.log('[Thoughts] Content-Type:', contentType);
        
        // Try to get the raw text first
        const text = await response.text();
        console.log('[Thoughts] Raw response text (first 500 chars):', text.substring(0, 500));
        
        // Check if it's HTML (common error page)
        if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
          console.error('[Thoughts] Received HTML instead of JSON. This usually means the API endpoint is not found.');
          throw new Error('API returned HTML instead of JSON - endpoint might not be configured correctly');
        }
        
        // Try to parse JSON
        let data;
        try {
          data = JSON.parse(text);
          console.log('[Thoughts] Parsed data:', data);
        } catch (parseError) {
          console.error('[Thoughts] JSON parse error:', parseError);
          console.error('[Thoughts] Failed to parse:', text);
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
          throw new Error(`Invalid JSON response: ${errorMessage}`);
        }
        
        if (!response.ok) {
          console.error('[Thoughts] Response not OK:', data);
          throw new Error(data.error || `Failed to fetch thoughts: ${response.status}`);
        }
        
        console.log('[Thoughts] Success! Returning data');
        return data;
      } catch (error) {
        console.error('[Thoughts] Fetch error:', error);
        if (error instanceof Error) {
          console.error('[Thoughts] Error stack:', error.stack);
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 1, // Only retry once for debugging
    enabled: true, // Always enabled
  });
};