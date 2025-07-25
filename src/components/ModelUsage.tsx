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
            AI Model Usage
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
            AI Model Usage
          </h3>
        </div>
        <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Unable to load model usage data</span>
        </div>
      </div>
    );
  }

  // Calculate totals (including $36 for Anthropic Console usage)
  const totals = data.data.reduce((acc, item) => ({
    model: acc.model || item.model_permaslug,
    usage: acc.usage + item.usage,
    requests: acc.requests + item.requests,
    promptTokens: acc.promptTokens + item.prompt_tokens,
    completionTokens: acc.completionTokens + item.completion_tokens,
  }), { model: '', usage: 36, requests: 0, promptTokens: 0, completionTokens: 0 });

  const totalTokens = totals.promptTokens + totals.completionTokens;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Model Usage
          </h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          OpenRouter + Console
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
          {totals.model}
        </div>
      </div>

      {/* Token Usage */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Token Usage
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Input Tokens:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(totals.promptTokens / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Output Tokens:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(totals.completionTokens / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Tokens:</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {(totalTokens / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {data.data.length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Avg Daily Cost:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                ${(totals.usage / data.data.length).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cost per 1M tokens:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                ${totalTokens > 0 ? ((totals.usage / totalTokens) * 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};