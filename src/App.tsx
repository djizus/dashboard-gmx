import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Activity, RefreshCw } from 'lucide-react';
import { DateFilterProvider } from './contexts/DateFilterContext';
import { GlobalDateFilter } from './components/GlobalDateFilter';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { PositionsTable } from './components/PositionsTable';
import { TradingHistory } from './components/TradingHistory';
import { PnLChart } from './components/PnLChart';
import { AgentThoughts } from './components/AgentThoughts';
import vegaLogo from './assets/vega_logo.jpg';
import zkorpLogo from './assets/zkorp_logo.png';
import daydreamsLogo from './assets/Daydreams.png';
import githubLogo from './assets/github-mark.png';
import githubLogoWhite from './assets/github-mark-white.png';
import gmxLogo from './assets/GMX_logo.png';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <img 
              src={vegaLogo} 
              alt="Vega AI" 
              className="h-12 w-12 rounded-lg object-cover shadow-sm"
            />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vega AI Trading Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                GMX Performance Monitor • Powered by Daydreams
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/z-korp/daydreams/tree/gmx/examples/gmx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
              title="View on GitHub"
            >
              <img 
                src={githubLogo} 
                alt="GitHub" 
                className="h-6 w-6 dark:hidden"
              />
              <img 
                src={githubLogoWhite} 
                alt="GitHub" 
                className="h-6 w-6 hidden dark:block"
              />
            </a>
            <GlobalDateFilter />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Activity className="h-4 w-4 mr-1" />
              <span>Live</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              <span>Auto-refresh</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const logos = [
    { src: zkorpLogo, alt: 'ZKorp', href: 'https://github.com/z-korp', height: 'h-14' },
    { src: daydreamsLogo, alt: 'Daydreams', href: 'https://github.com/daydreamsai/daydreams', height: 'h-10' },
    { src: gmxLogo, alt: 'GMX', href: 'https://app.gmx.io/#/trade', height: 'h-10' },
    { src: [githubLogo, githubLogoWhite], alt: 'GitHub', href: 'https://github.com/z-korp/daydreams/tree/gmx/examples/gmx', height: 'h-10' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="w-full py-8">
        <div className="flex items-center justify-center space-x-12">
          {logos.map((logo) => (
            <a
              key={logo.alt}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center hover:opacity-70 transition-opacity duration-200"
            >
              {Array.isArray(logo.src) ? (
                <>
                  <img 
                    src={logo.src[0]} 
                    alt={logo.alt} 
                    className={`${logo.height} w-auto object-contain dark:hidden`}
                  />
                  <img 
                    src={logo.src[1]} 
                    alt={logo.alt} 
                    className={`${logo.height} w-auto object-contain hidden dark:block`}
                  />
                </>
              ) : (
                <img 
                  src={logo.src} 
                  alt={logo.alt} 
                  className={`${logo.height} w-auto object-contain`}
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DateFilterProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Performance Metrics - Full Width */}
            <div className="mb-8">
              <PerformanceMetrics />
            </div>
            
            {/* Active Positions - Full Width */}
            <div className="mb-8">
              <PositionsTable />
            </div>
            
            {/* Agent Thoughts - Full Width */}
            <div className="mb-8">
              <AgentThoughts />
            </div>
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* P&L Chart */}
                <PnLChart />
              </div>
              
              {/* Right Column */}
              <div className="space-y-8">
                {/* Trading History */}
                <TradingHistory />
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </DateFilterProvider>
    </QueryClientProvider>
  );
}

export default App;