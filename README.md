# Vega AI Trading Dashboard

A real-time performance monitoring dashboard for Vega AI trading agent on GMX (Arbitrum).

**Created by ZKorp • Powered by Daydreams**

## Features

- 📊 **Performance Metrics**: Real-time P&L, win rate, profit factor, and trading statistics
- 🎯 **Active Positions**: Live position monitoring with risk metrics
- 📈 **P&L Chart**: Cumulative performance visualization with Recharts
- 📋 **Trading History**: Complete trade log with filtering capabilities
- 🗓️ **Date Filtering**: Global dashboard filtering (All Time, 24h, 7d, 30d)
- 🔄 **Auto-refresh**: Real-time data updates every 15-30 seconds
- 📱 **Responsive**: Mobile-friendly design with Tailwind CSS

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark/light mode
- **Data Fetching**: TanStack Query for real-time updates
- **Charts**: Recharts for performance visualization
- **GMX Integration**: Official GMX SDK v1.1.2
- **Deployment**: Vercel-ready configuration

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
VITE_GMX_NETWORK=arbitrum
VITE_GMX_CHAIN_ID=42161
VITE_GMX_RPC_URL=https://arb1.arbitrum.io/rpc
VITE_GMX_ORACLE_URL=https://arbitrum-api.gmxinfra.io
VITE_GMX_SUBSQUID_URL=https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql
VITE_GMX_WALLET_ADDRESS=your_wallet_address
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the project
pnpm build

# Deploy the dist/ folder to your hosting provider
```

## Architecture

- **Date Filter Context**: Global date filtering across all components
- **GMX Service**: Centralized data fetching and processing
- **React Hooks**: Custom hooks for data management
- **Component Structure**: Modular, reusable components

## Performance

- **Real-time Updates**: 15-30 second refresh intervals
- **Efficient Filtering**: Memoized date filtering
- **Optimized Build**: 666KB gzipped bundle size
- **Error Boundaries**: Graceful error handling

## License

Created by ZKorp for Vega AI agent monitoring.