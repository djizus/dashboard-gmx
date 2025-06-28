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
      try {
        const response = await fetch('/api/thoughts');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch thoughts');
        }
        
        return data;
      } catch (error) {
        console.error('Failed to fetch thoughts:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
    retry: 1, // Only retry once for debugging
    enabled: true, // Always enabled
  });
};