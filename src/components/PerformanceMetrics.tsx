import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { useTradingHistory } from '../hooks/useGmxData';
import { useDateFilter } from '../contexts/DateFilterContext';

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}> = ({ title, value, icon, trend = 'neutral', subtitle }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getBgColor = () => {
    switch (trend) {
      case 'up': return 'bg-green-500/10 border-green-500/20';
      case 'down': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${getTrendColor()}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`${getTrendColor()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const PerformanceMetrics: React.FC = () => {
  const { data: trades = [], isLoading: tradesLoading, error: tradesError } = useTradingHistory();
  const { dateFilter, getFilterTimestamp, getFilterLabel } = useDateFilter();

  const filteredMetrics = useMemo(() => {
    if (!trades.length) return null;
    
    let filteredTrades = [...trades];
    const filterTimestamp = getFilterTimestamp();

    console.log('PerformanceMetrics Debug:', {
      totalTrades: trades.length,
      dateFilter,
      filterTimestamp,
      firstTradeTimestamp: trades[0]?.timestamp,
      firstTradeDate: trades[0]?.timestamp ? new Date(trades[0].timestamp * 1000) : null,
      filterDate: filterTimestamp ? new Date(filterTimestamp * 1000) : null
    });

    if (filterTimestamp !== null) {
      const beforeFilter = filteredTrades.length;
      filteredTrades = filteredTrades.filter(trade => trade.timestamp >= filterTimestamp);
      console.log(`PerformanceMetrics date filter applied: ${beforeFilter} -> ${filteredTrades.length} trades`);
    }

    // Calculate metrics from filtered trades (data already contains only executed trades)
    const executedTrades = filteredTrades.filter(trade => 
      trade.pnlUsd !== undefined && 
      trade.pnlUsd !== 0
    );

    if (!executedTrades.length) {
      return {
        totalPnl: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        averageProfit: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        roi: 0,
        apy: 0,
      };
    }

    const totalPnl = executedTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0);
    const winningTrades = executedTrades.filter(trade => trade.pnlUsd > 0);
    const losingTrades = executedTrades.filter(trade => trade.pnlUsd < 0);
    
    const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0));
    
    const averageProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnlUsd)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnlUsd)) : 0;
    
    // Calculate total invested amount (sum of all collateral amounts)
    // For leveraged trades, ROI should be based on actual capital deployed (collateral), not position size
    const totalInvested = executedTrades.reduce((sum, trade) => {
      // Use actual collateralDeltaUsd if available, otherwise fallback to size/leverage estimate
      const collateralAmount = trade.collateralDeltaUsd || (trade.sizeDeltaUsd / 5);
      return sum + Math.abs(collateralAmount);
    }, 0);
    
    // Calculate ROI as (Total PnL / Total Invested) * 100
    const roi = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    // Calculate APY (Annualized Percentage Yield)
    let apy = 0;
    if (totalInvested > 0 && executedTrades.length > 0) {
      // Get time period in days
      const firstTradeTime = Math.min(...executedTrades.map(t => t.timestamp));
      const lastTradeTime = Math.max(...executedTrades.map(t => t.timestamp));
      const timePeriodSeconds = lastTradeTime - firstTradeTime;
      const timePeriodDays = timePeriodSeconds / 86400; // Convert to days
      
      // If period is less than 1 day, use 1 day minimum for calculation
      const periodDays = Math.max(timePeriodDays, 1);
      
      // Calculate annualized return
      // APY = ((1 + ROI/100)^(365/days) - 1) * 100
      const returnRate = 1 + (roi / 100);
      const annualizationFactor = 365 / periodDays;
      apy = (Math.pow(returnRate, annualizationFactor) - 1) * 100;
      
      // Cap extreme values for display
      if (apy > 10000) apy = 10000; // Cap at 10,000% APY
      if (apy < -99) apy = -99; // Cap at -99% APY
    }

    return {
      totalPnl,
      winRate: (winningTrades.length / executedTrades.length) * 100,
      totalTrades: executedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageProfit,
      averageLoss,
      largestWin,
      largestLoss,
      roi,
      apy,
    };
  }, [trades, dateFilter, getFilterTimestamp]);

  const isLoading = tradesLoading;
  const error = tradesError;
  const metrics = filteredMetrics;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-gray-100 dark:bg-gray-800 p-4 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
        <p className="text-red-600 dark:text-red-400">Failed to load performance metrics</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <p className="text-gray-600 dark:text-gray-400">No trading data available</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) {
      return '0.0%';
    }
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vega Agent Performance Metrics
          </h2>
          {getFilterTimestamp() !== null && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Period: {getFilterLabel()}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Total P&L"
            value={formatCurrency(metrics.totalPnl)}
            icon={<DollarSign className="h-6 w-6" />}
            trend={metrics.totalPnl >= 0 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Win Rate"
            value={formatPercentage(metrics.winRate)}
            icon={<Target className="h-6 w-6" />}
            trend={metrics.winRate >= 50 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Total Trades"
            value={metrics.totalTrades}
            icon={<BarChart3 className="h-6 w-6" />}
            subtitle={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
          />
          
          <MetricCard
            title="APY"
            value={formatPercentage(metrics.apy)}
            icon={<Percent className="h-6 w-6" />}
            trend={metrics.apy >= 0 ? 'up' : 'down'}
          />
          
          <MetricCard
            title="Average Profit"
            value={formatCurrency(metrics.averageProfit)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="up"
          />
          
          <MetricCard
            title="Average Loss"
            value={formatCurrency(metrics.averageLoss)}
            icon={<TrendingDown className="h-6 w-6" />}
            trend="down"
          />
          
          <MetricCard
            title="Largest Win"
            value={formatCurrency(metrics.largestWin)}
            icon={<TrendingUp className="h-6 w-6" />}
            trend="up"
          />
          
          <MetricCard
            title="Largest Loss"
            value={formatCurrency(Math.abs(metrics.largestLoss))}
            icon={<TrendingDown className="h-6 w-6" />}
            trend="down"
          />
        </div>
      </div>
    </div>
  );
};