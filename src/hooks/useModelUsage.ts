import { useQuery } from '@tanstack/react-query';
import { useDateFilter } from '../contexts/DateFilterContext';
import { subDays } from 'date-fns';

interface ModelUsageItem {
  date: string;
  model_permaslug: string;
  variant: string;
  usage: number;
  requests: number;
  prompt_tokens: number;
  completion_tokens: number;
}

interface ModelUsageResponse {
  data: ModelUsageItem[];
}

export const useModelUsage = () => {
  const { dateFilter } = useDateFilter();

  return useQuery<ModelUsageResponse>({
    queryKey: ['modelUsage', dateFilter],
    queryFn: async () => {
      const response = await fetch('/api/openrouter-usage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch model usage data');
      }
      
      const data = await response.json();
      
      // Filter to only show google/gemini-2.5-flash-preview-05-20
      if (data.data) {
        data.data = data.data.filter((item: ModelUsageItem) => 
          item.model_permaslug === 'google/gemini-2.5-flash-preview-05-20'
        );
        
        // Filter data based on the selected date range
        if (dateFilter !== 'all') {
          const now = new Date();
          const filterDate = (() => {
            switch (dateFilter) {
              case '1d': return subDays(now, 1);
              case '7d': return subDays(now, 7);
              case '30d': return subDays(now, 30);
              default: return null;
            }
          })();

          if (filterDate) {
            data.data = data.data.filter((item: ModelUsageItem) => {
              const itemDate = new Date(item.date);
              return itemDate >= filterDate;
            });
          }
        }
      }
      
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 1,
  });
};