import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { DateFilterProvider } from './contexts/DateFilterContext';
import { GlobalDateFilter } from './components/GlobalDateFilter';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { PositionsTable } from './components/PositionsTable';
import { TradingHistory } from './components/TradingHistory';
import { PnLChart } from './components/PnLChart';
import { AgentThoughts } from './components/AgentThoughts';
import { ThemeToggle } from './components/ThemeToggle';
import { ModelUsage } from './components/ModelUsage';
import vegaLogo from './assets/vega_logo.jpg';
import zkorpLogo from './assets/zkorp_logo.png';
import zkorpLogoWithBg from './assets/zkorp_with_bg.png';
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-20 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <img 
              src={vegaLogo} 
              alt="Vega AI" 
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover shadow-sm"
            />
            <div className="ml-3 sm:ml-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Vega AI GMX Trading Dashboard</span>
                <span className="sm:hidden">Vega AI Dashboard</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">Built by zKorp • Powered by Daydreams</span>
                <span className="sm:hidden">zKorp • Daydreams</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <div className="hidden sm:block">
              <GlobalDateFilter />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
              <span className="hidden sm:inline">Auto-refresh</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Date Filter */}
        <div className="sm:hidden pb-4">
          <GlobalDateFilter />
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => {
  const logos = [
    { 
      src: [zkorpLogoWithBg, zkorpLogo], 
      alt: 'ZKorp', 
      href: 'https://github.com/z-korp', 
      height: 'h-10 sm:h-12 md:h-14',
      mobileHeight: 'h-8'
    },
    { 
      src: daydreamsLogo, 
      alt: 'Daydreams', 
      href: 'https://github.com/daydreamsai/daydreams', 
      height: 'h-8 sm:h-9 md:h-10',
      mobileHeight: 'h-6'
    },
    { 
      src: gmxLogo, 
      alt: 'GMX', 
      href: 'https://app.gmx.io/#/trade', 
      height: 'h-8 sm:h-9 md:h-10',
      mobileHeight: 'h-6'
    },
    { 
      src: [githubLogo, githubLogoWhite], 
      alt: 'GitHub', 
      href: 'https://github.com/djizus/agent-gmx/tree/main', 
      height: 'h-8 sm:h-9 md:h-10',
      mobileHeight: 'h-6'
    },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-12">
      <div className="w-full py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 px-4">
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
            
            {/* Agent Thoughts and Model Usage - Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Agent Thoughts */}
              <AgentThoughts />
              
              {/* Model Usage */}
              <ModelUsage />
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