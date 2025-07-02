import React from 'react';
import { Bot, TrendingUp, Coins, AlertCircle } from 'lucide-react';
import { useModelUsage } from '../hooks/useModelUsage';

export const ModelUsage: React.FC = () => {
  const { data, isLoading, error } = useModelUsage();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Model Usage
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Model Usage
          </h3>
        </div>
        <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Unable to load model usage data</span>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = data.data.reduce((acc, item) => ({
    usage: acc.usage + item.usage,
    requests: acc.requests + item.requests,
    promptTokens: acc.promptTokens + item.prompt_tokens,
    completionTokens: acc.completionTokens + item.completion_tokens,
  }), { usage: 0, requests: 0, promptTokens: 0, completionTokens: 0 });

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Model Usage
          </h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Period: {data.data.length} days
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Coins className="h-4 w-4 mr-1" />
            Total Cost
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            ${totals.usage.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Total Requests
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {totals.requests.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Model
        </div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          Claude 4 Sonnet
        </div>
      </div>

      {/* Token Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Prompt Tokens:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {(totals.promptTokens / 1000000).toFixed(1)}M
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Completion Tokens:</span>
            <span className="ml-2 text-gray-700 dark:text-gray-300">
              {(totals.completionTokens / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};