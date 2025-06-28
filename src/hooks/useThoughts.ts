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
      const response = await fetch('/api/thoughts');
      
      if (!response.ok) {
        throw new Error('Unable to load thoughts at this time');
      }
      
      return response.json();
    },
    refetchInterval: 30000,
    staleTime: 20000,
    retry: 1,
  });
};