# Vega AI Agent GMX Trading Dashboard

## Project Overview
This dashboard tracks the trading performance of the Vega AI agent on GMX (decentralized perpetual exchange).

## Key Instructions
- Always call the sensei mcp when dealing with dojo contracts to help you
- Always look into the existing codebase to reuse code, never duplicate components
- Use existing GMX SDK implementation from .old directory
- Reference ~/gmx-interface/sdk for full SDK capabilities
- Environment variables are configured in .env file

## Architecture
- Dashboard displays Vega's trading performance metrics
- Uses GMX SDK for data fetching
- Real-time or periodic updates of trading positions, PnL, and statistics

## Data Sources
- GMX SDK functions in .old directory
- Full GMX interface SDK at ~/gmx-interface/sdk
- Environment configuration in .env

## Development Notes
- Prefer editing existing files over creating new ones
- Reuse existing components where possible
- Focus on trading performance visualization and metrics