import { useQuery } from '@tanstack/react-query';
import { useDateFilter } from '../contexts/DateFilterContext';
import { subDays } from 'date-fns';
import { processAnthropicUsageData, AnthropicUsageResponse } from '../utils/pricing';

export const useAnthropicUsage = () => {
  const { dateFilter } = useDateFilter();

  return useQuery({
    queryKey: ['anthropicUsage', dateFilter],
    queryFn: async () => {
      // Calculate date range based on filter
      const now = new Date();
      let startDate: string;
      let endDate: string;

      if (dateFilter === 'all') {
        // Default to current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];
      } else {
        const filterDate = (() => {
          switch (dateFilter) {
            case '1d': return subDays(now, 1);
            case '7d': return subDays(now, 7);
            case '30d': return subDays(now, 30);
            default: return subDays(now, 30);
          }
        })();
        
        startDate = filterDate.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      }

      const params = new URLSearchParams({
        starting_on: startDate,
        ending_before: endDate,
      });

      const response = await fetch(`/api/anthropic-usage?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Anthropic usage data');
      }
      
      const data: AnthropicUsageResponse = await response.json();
      
      return processAnthropicUsageData(data);
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    staleTime: 240000, // Consider data stale after 4 minutes
    retry: 1,
  });
};