import React from 'react';
import { Calendar } from 'lucide-react';
import { useDateFilter, DateFilterValue } from '../contexts/DateFilterContext';

export const GlobalDateFilter: React.FC = () => {
  const { dateFilter, setDateFilter } = useDateFilter();

  return (
    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
      <select
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value as DateFilterValue)}
        className="text-sm border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-0 focus:outline-none dark:[&>option]:bg-gray-800 dark:[&>option]:text-white"
      >
        <option value="1d">Last 24h</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="all">All Time</option>
      </select>
    </div>
  );
};