import React from 'react';
import { Brain, Clock, AlertCircle } from 'lucide-react';
import { useThoughts } from '../hooks/useThoughts';

export const AgentThoughts: React.FC = () => {
  const { data, isLoading, error } = useThoughts();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Thoughts
          </h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Thoughts
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">Unable to load thoughts at this time</p>
          </div>
          {error && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
              <p className="mt-1">Check browser console for debugging information</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const thoughts = data.thoughts || [];
  const latestThoughts = thoughts.slice(-10).reverse(); // Show last 10 thoughts, most recent first

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Vega AI Thoughts
          </h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Latest {latestThoughts.length} thoughts
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {latestThoughts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
            No thoughts recorded yet...
          </p>
        ) : (
          latestThoughts.map((thought, index) => (
            <div 
              key={index} 
              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {thought.content}
                  </p>
                  {thought.timestamp && (
                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(thought.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};