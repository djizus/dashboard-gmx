import React from 'react';
import { Bot, TrendingUp, Coins, AlertCircle } from 'lucide-react';
import { useModelUsage } from '../hooks/useModelUsage';
import { useAnthropicUsage } from '../hooks/useAnthropicUsage';

export const ModelUsage: React.FC = () => {
  const { data: openRouterData, isLoading: openRouterLoading, error: openRouterError } = useModelUsage();
  const { data: anthropicData, isLoading: anthropicLoading, error: anthropicError } = useAnthropicUsage();
  
  const isLoading = openRouterLoading || anthropicLoading;
  const error = openRouterError || anthropicError;
  const hasOpenRouterData = openRouterData && openRouterData.data && openRouterData.data.length > 0;
  const hasAnthropicData = anthropicData && anthropicData.length > 0;

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

  if (error || (!hasOpenRouterData && !hasAnthropicData)) {
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

  // Calculate OpenRouter totals
  const openRouterTotals = hasOpenRouterData ? openRouterData.data.reduce((acc, item) => ({
    usage: acc.usage + item.usage,
    requests: acc.requests + item.requests,
    promptTokens: acc.promptTokens + item.prompt_tokens,
    completionTokens: acc.completionTokens + item.completion_tokens,
  }), { usage: 0, requests: 0, promptTokens: 0, completionTokens: 0 }) : 
    { usage: 0, requests: 0, promptTokens: 0, completionTokens: 0 };

  // Calculate Anthropic totals
  const anthropicTotals = hasAnthropicData ? anthropicData.reduce((acc, item) => ({
    usage: acc.usage + item.cost,
    requests: acc.requests + item.requests,
    promptTokens: acc.promptTokens + item.input_tokens,
    completionTokens: acc.completionTokens + item.output_tokens,
  }), { usage: 0, requests: 0, promptTokens: 0, completionTokens: 0 }) :
    { usage: 0, requests: 0, promptTokens: 0, completionTokens: 0 };

  // Combined totals
  const totalCost = openRouterTotals.usage + anthropicTotals.usage;
  const totalRequests = openRouterTotals.requests + anthropicTotals.requests;
  const totalPromptTokens = openRouterTotals.promptTokens + anthropicTotals.promptTokens;
  const totalCompletionTokens = openRouterTotals.completionTokens + anthropicTotals.completionTokens;
  const totalTokens = totalPromptTokens + totalCompletionTokens;

  // Calculate days of data
  const totalDays = Math.max(
    hasOpenRouterData ? openRouterData.data.length : 0,
    hasAnthropicData ? anthropicData.length : 0
  );

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
          {hasOpenRouterData && hasAnthropicData ? 'OpenRouter + Anthropic' : 
           hasOpenRouterData ? 'OpenRouter' : 'Anthropic'}
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
            ${totalCost.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            Total Requests
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {totalRequests.toLocaleString()}
          </div>
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
              {(totalPromptTokens / 1000000).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Output Tokens:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {(totalCompletionTokens / 1000000).toFixed(1)}M
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
      {totalDays > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Avg Daily Cost:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                ${(totalCost / totalDays).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Cost per 1M tokens:</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                ${totalTokens > 0 ? ((totalCost / totalTokens) * 1000000).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};