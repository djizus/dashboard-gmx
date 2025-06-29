import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { useTradingHistory } from '../hooks/useGmxData';
import { useDateFilter } from '../contexts/DateFilterContext';

export const PnLChart: React.FC = () => {
  const { data: trades = [], isLoading, error } = useTradingHistory();
  const { dateFilter, getFilterTimestamp, getFilterLabel } = useDateFilter();

  const chartData = useMemo(() => {
    if (!trades.length) return [];

    let filteredTrades = [...trades];
    const filterTimestamp = getFilterTimestamp();

    if (filterTimestamp !== null) {
      filteredTrades = filteredTrades.filter(trade => trade.timestamp >= filterTimestamp);
    }

    const executedTrades = filteredTrades
      .filter(trade => 
        trade.eventName === 'OrderExecuted' && 
        trade.pnlUsd !== undefined && 
        typeof trade.pnlUsd === 'number' && 
        isFinite(trade.pnlUsd)
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    let cumulativePnL = 0;
    return executedTrades.map((trade, index) => {
      cumulativePnL += trade.pnlUsd || 0;
      return {
        index: index + 1,
        timestamp: trade.timestamp,
        date: format(new Date(trade.timestamp * 1000), 'MM/dd HH:mm'),
        pnl: trade.pnlUsd || 0,
        cumulativePnL: cumulativePnL,
        market: trade.indexToken?.symbol || 'Unknown',
      };
    });
  }, [trades, dateFilter, getFilterTimestamp]);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{`Trade #${label}`}</p>
          <p className="text-sm text-gray-900 dark:text-white">{data.date}</p>
          <p className="text-sm text-gray-900 dark:text-white">{data.market}</p>
          <p className={`text-sm font-medium ${data.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {`Trade P&L: ${formatCurrency(data.pnl)}`}
          </p>
          <p className={`text-sm font-bold ${data.cumulativePnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {`Total P&L: ${formatCurrency(data.cumulativePnL)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">P&L Chart</h3>
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">P&L Chart</h3>
        <p className="text-red-600 dark:text-red-400">Failed to load chart data</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">P&L Chart</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">No trading data to display</p>
        </div>
      </div>
    );
  }

  const finalPnL = chartData[chartData.length - 1]?.cumulativePnL || 0;
  const lineColor = finalPnL >= 0 ? '#22c55e' : '#ef4444';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cumulative P&L Chart
          </h3>
          {getFilterTimestamp() !== null && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Period: {getFilterLabel()}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getFilterTimestamp() !== null ? 'Period' : 'Current'} P&L
          </p>
          <p className={`text-lg font-bold ${finalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(finalPnL)}
          </p>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="index"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#6b7280' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
            <Line
              type="monotone"
              dataKey="cumulativePnL"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: lineColor, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on {chartData.length} executed trades
        </p>
      </div>
    </div>
  );
};