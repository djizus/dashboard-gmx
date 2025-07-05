# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Vega AI Agent GMX Trading Dashboard

## Project Overview
This dashboard tracks the trading performance of the Vega AI agent on GMX (decentralized perpetual exchange). Built with React 18 + TypeScript + Vite, featuring real-time data updates and comprehensive performance metrics.

## Key Instructions
- Always call the sensei mcp when dealing with dojo contracts to help you
- Always look into the existing codebase to reuse code, never duplicate components
- Use existing GMX SDK implementation from .old directory
- Reference ~/gmx-interface/sdk for full SDK capabilities
- Environment variables are configured in .env file

## Common Development Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production (TypeScript + Vite)
pnpm preview      # Preview production build
pnpm lint         # Run ESLint with TypeScript support
pnpm typecheck    # Run TypeScript type checking
```

### Testing
**No testing framework is currently configured.** The project lacks test files and testing dependencies.

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling with dark/light mode support
- **TanStack React Query** for data fetching and caching
- **Recharts** for performance visualization charts

### Key Directories
- `/src/components/` - Modular React components
- `/src/contexts/` - React context providers (date filtering)
- `/src/hooks/` - Custom React hooks for data fetching
- `/src/types/` - TypeScript type definitions
- `/src/utils/` - Utility functions and services
- `/api/` - Serverless API endpoints for Vercel deployment

### Core Components Architecture
- **PerformanceMetrics** - Trading performance overview
- **PositionsTable** - Active positions display
- **TradingHistory** - Complete trade log
- **PnLChart** - Performance visualization
- **AgentThoughts** - AI agent reasoning display
- **ModelUsage** - OpenRouter API usage tracking

### Data Flow Pattern
1. **GMX SDK** → `GmxService` → Custom hooks → React components
2. **MongoDB** → API endpoints → Custom hooks → React components
3. **Global date filtering** managed via Context API

## GMX Integration
- Uses **@gmx-io/sdk v1.1.2** for official GMX data access
- Configured for Arbitrum mainnet (Chain ID: 42161)
- Real-time position monitoring with 15-30 second update intervals
- Environment-based configuration for network settings

## Development Notes
- Prefer editing existing files over creating new ones
- Reuse existing components where possible
- Focus on trading performance visualization and metrics
- No testing framework currently configured
- Bundle size: 666KB gzipped
- Uses service-oriented architecture with `GmxService` class

## Environment Configuration
Copy `.env.example` to `.env.local` and configure:
- GMX network settings (Arbitrum mainnet)
- MongoDB connection for agent data
- OpenRouter API integration
- Wallet address for position tracking

## Deployment
Configured for Vercel deployment with serverless API endpoints in `/api/` directory.