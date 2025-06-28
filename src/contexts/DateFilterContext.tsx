import React, { createContext, useContext, useState, ReactNode } from 'react';
import { subDays, startOfDay } from 'date-fns';

export type DateFilterValue = 'all' | '1d' | '7d' | '30d';

interface DateFilterContextType {
  dateFilter: DateFilterValue;
  setDateFilter: (filter: DateFilterValue) => void;
  getFilterTimestamp: () => number | null;
  getFilterLabel: () => string;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

interface DateFilterProviderProps {
  children: ReactNode;
}

export const DateFilterProvider: React.FC<DateFilterProviderProps> = ({ children }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('1d');

  const getFilterTimestamp = (): number | null => {
    if (dateFilter === 'all') return null;
    
    const now = new Date();
    const filterDate = (() => {
      switch (dateFilter) {
        case '1d': return subDays(now, 1);
        case '7d': return subDays(now, 7);
        case '30d': return subDays(now, 30);
        default: return null;
      }
    })();

    return filterDate ? startOfDay(filterDate).getTime() / 1000 : null;
  };

  const getFilterLabel = (): string => {
    switch (dateFilter) {
      case 'all': return 'All Time';
      case '1d': return 'Last 24h';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      default: return 'All Time';
    }
  };

  return (
    <DateFilterContext.Provider value={{
      dateFilter,
      setDateFilter,
      getFilterTimestamp,
      getFilterLabel,
    }}>
      {children}
    </DateFilterContext.Provider>
  );
};