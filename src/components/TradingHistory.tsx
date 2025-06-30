import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTradingHistory } from '../hooks/useGmxData';
import { useDateFilter } from '../contexts/DateFilterContext';

export const TradingHistory: React.FC = () => {
  const { data: trades = [], isLoading, error } = useTradingHistory();
  const { dateFilter, getFilterTimestamp, getFilterLabel } = useDateFilter();

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = [...trades];
    const filterTimestamp = getFilterTimestamp();

    console.log('TradingHistory Debug:', {
      totalTrades: trades.length,
      dateFilter,
      filterTimestamp,
      firstTradeTimestamp: trades[0]?.timestamp,
      firstTradeDate: trades[0]?.timestamp ? new Date(trades[0].timestamp * 1000) : null,
      filterDate: filterTimestamp ? new Date(filterTimestamp * 1000) : null
    });

    // Data already contains only executed trades from the service

    // Apply date filter
    if (filterTimestamp !== null) {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(trade => trade.timestamp >= filterTimestamp);
      console.log(`Date filter applied: ${beforeFilter} -> ${filtered.length} trades`);
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [trades, dateFilter, getFilterTimestamp]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trading History</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Trading History</h3>
        <p className="text-red-600 dark:text-red-400">Failed to load trading history</p>
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

  const getEventIcon = (eventName: string) => {
    switch (eventName) {
      case 'OrderExecuted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'OrderCancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'OrderCreated':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case 'OrderExecuted':
        return 'text-green-600 dark:text-green-400';
      case 'OrderCancelled':
        return 'text-red-600 dark:text-red-400';
      case 'OrderCreated':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };


  const displayedTrades = filteredAndSortedTrades;

  if (filteredAndSortedTrades.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trading History</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Clock className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {getFilterTimestamp() === null ? 'No trading history available' : `No trades found for ${getFilterLabel()}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trading History ({filteredAndSortedTrades.length} trades)
        </h3>
        
        {/* Filter Status */}
        {getFilterTimestamp() !== null && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Filtered by: {getFilterLabel()}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {filteredAndSortedTrades.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Trades</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {filteredAndSortedTrades.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Size</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(
                filteredAndSortedTrades.reduce((sum, t) => sum + (t.sizeDeltaUsd || 0), 0) / 
                Math.max(filteredAndSortedTrades.length, 1)
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total PnL</div>
            <div className={`text-sm font-medium ${
              filteredAndSortedTrades.reduce((sum, t) => sum + (t.pnlUsd || 0), 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(filteredAndSortedTrades.reduce((sum, t) => sum + (t.pnlUsd || 0), 0))}
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 max-h-80 overflow-y-auto">
        {displayedTrades.map((trade, index) => {
          const pnlColor = trade.pnlUsd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
          
          return (
            <div key={trade.id || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getEventIcon(trade.eventName)}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {trade.indexToken?.symbol || 'Unknown'}
                    </div>
                    <div className={`text-xs ${getEventColor(trade.eventName)}`}>
                      {trade.isLong ? 'Long' : 'Short'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(trade.timestamp * 1000), 'MM/dd HH:mm')}
                  </div>
                  {trade.txHash && (
                    <a
                      href={`https://arbiscan.io/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Size</div>
                  <div className="text-gray-900 dark:text-white">
                    {trade.sizeDeltaUsd ? formatCurrency(trade.sizeDeltaUsd) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Price</div>
                  <div className="text-gray-900 dark:text-white">
                    {trade.executionPrice ? formatCurrency(trade.executionPrice) : 
                     trade.triggerPrice ? formatCurrency(trade.triggerPrice) : '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">PnL</div>
                  <div className={`font-medium ${pnlColor}`}>
                    {trade.pnlUsd !== 0 ? formatCurrency(trade.pnlUsd) : '-'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Time
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Market
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Size
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Price
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                PnL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {displayedTrades.map((trade, index) => {
              const pnlColor = trade.pnlUsd >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
              
              return (
                <tr key={trade.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {format(new Date(trade.timestamp * 1000), 'MM/dd HH:mm')}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getEventColor(trade.eventName)} flex items-center`}>
                      {getEventIcon(trade.eventName)}
                      <span className="ml-1 truncate">
                        {trade.isLong ? 'Long' : 'Short'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {trade.indexToken?.symbol || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {trade.sizeDeltaUsd ? formatCurrency(trade.sizeDeltaUsd) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {trade.executionPrice ? formatCurrency(trade.executionPrice) : 
                       trade.triggerPrice ? formatCurrency(trade.triggerPrice) : '-'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className={`text-sm font-medium ${pnlColor} flex items-center`}>
                      {trade.pnlUsd !== 0 ? formatCurrency(trade.pnlUsd) : '-'}
                      {trade.txHash && (
                        <a
                          href={`https://arbiscan.io/tx/${trade.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Trade Count */}
      {filteredAndSortedTrades.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Showing {displayedTrades.length} trades
            {getFilterTimestamp() !== null && ` (${getFilterLabel()} filter active)`}
          </p>
        </div>
      )}
    </div>
  );
};