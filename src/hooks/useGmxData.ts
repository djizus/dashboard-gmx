import { useQuery } from '@tanstack/react-query';
import { GmxService } from '../utils/gmx-service';

const gmxService = new GmxService();

export const useMarketsInfo = () => {
  return useQuery({
    queryKey: ['marketsInfo'],
    queryFn: () => gmxService.getMarketsInfo(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => gmxService.getPositions(),
    refetchInterval: 5000, // Refetch every 5 seconds for live price updates
    staleTime: 3000, // Consider data stale after 3 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => gmxService.getOrders(),
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

export const useTradingHistory = () => {
  return useQuery({
    queryKey: ['tradingHistory'],
    queryFn: () => gmxService.getTradingHistory(),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 45000, // Consider data stale after 45 seconds
  });
};

export const usePerformanceMetrics = () => {
  const { data: trades = [] } = useTradingHistory();
  
  return useQuery({
    queryKey: ['performanceMetrics', trades.length],
    queryFn: () => gmxService.calculatePerformanceMetrics(trades),
    enabled: trades.length > 0,
    staleTime: 30000,
  });
};