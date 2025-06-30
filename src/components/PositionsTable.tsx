import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { usePositions } from '../hooks/useGmxData';

export const PositionsTable: React.FC = () => {
  const { data: positions = [], isLoading, error } = usePositions();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Positions</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Active Positions</h3>
        <p className="text-red-600 dark:text-red-400">Failed to load positions</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (positions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Positions</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <TrendingUp className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">No active positions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Active Positions ({positions.length})
      </h3>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {positions.map((position, index) => {
          const pnlColor = position.unrealizedPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
          const sideColor = position.isLong ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
          
          return (
            <div key={position.key || index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {position.indexToken?.symbol || position.indexToken?.name || position.marketInfo?.name || 'Unknown'}
                  </div>
                  <div className={`text-sm font-medium ${sideColor} flex items-center mt-1`}>
                    {position.isLong ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Long
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Short
                      </>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-medium ${pnlColor} text-right`}>
                  {formatCurrency(position.unrealizedPnl)}
                  <div className="text-xs">
                    ({formatPercentage(position.unrealizedPnlPercentage)})
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Size</div>
                  <div className="text-gray-900 dark:text-white">{formatCurrency(position.sizeInUsd)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Collateral</div>
                  <div className="text-gray-900 dark:text-white">{formatCurrency(position.collateralUsd)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Entry Price</div>
                  <div className="text-gray-900 dark:text-white">{formatCurrency(position.entryPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Mark Price</div>
                  <div className="text-gray-900 dark:text-white">{formatCurrency(position.markPrice)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Leverage</div>
                  <div className="text-gray-900 dark:text-white">{position.leverage.toFixed(2)}x</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Liq. Price</div>
                  <div className="text-gray-900 dark:text-white flex items-center">
                    {formatCurrency(position.liquidationPrice)}
                    {position.liquidationPrice > 0 && (
                      <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Market
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Side
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Collateral
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Mark Price
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PnL
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Leverage
              </th>
              <th className="px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Liq. Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {positions.map((position, index) => {
              const pnlColor = position.unrealizedPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
              const sideColor = position.isLong ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
              
              return (
                <tr key={position.key || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {position.indexToken?.symbol || position.indexToken?.name || position.marketInfo?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${sideColor} flex items-center`}>
                      {position.isLong ? (
                        <>
                          <TrendingUp className="h-5 w-5 mr-1" />
                          Long
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-5 w-5 mr-1" />
                          Short
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(position.sizeInUsd)}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(position.collateralUsd)}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(position.entryPrice)}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(position.markPrice)}
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${pnlColor}`}>
                      {formatCurrency(position.unrealizedPnl)}
                      <div className="text-xs">
                        ({formatPercentage(position.unrealizedPnlPercentage)})
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {position.leverage.toFixed(2)}x
                    </div>
                  </td>
                  <td className="px-3 lg:px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center">
                      {formatCurrency(position.liquidationPrice)}
                      {position.liquidationPrice > 0 && (
                        <AlertTriangle className="h-5 w-5 ml-1 text-yellow-500" />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};