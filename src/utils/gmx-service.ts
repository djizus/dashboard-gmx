import { GmxSdk } from '@gmx-io/sdk';
import { bigIntToDecimal, USD_DECIMALS } from './utils';

export class GmxService {
  private sdk: GmxSdk;
  private walletAddress: string;

  constructor() {
    const rpcUrl = import.meta.env.VITE_GMX_RPC_URL || 'https://arb1.arbitrum.io/rpc';
    const oracleUrl = import.meta.env.VITE_GMX_ORACLE_URL || 'https://arbitrum-api.gmxinfra.io';
    const subsquidUrl = import.meta.env.VITE_GMX_SUBSQUID_URL || 'https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql';
    this.walletAddress = import.meta.env.VITE_GMX_WALLET_ADDRESS || '';

    this.sdk = new GmxSdk({
      rpcUrl,
      chainId: 42161,
      oracleUrl,
      subsquidUrl,
      account: this.walletAddress as `0x${string}`,
    });

    if (this.walletAddress) {
      this.sdk.setAccount(this.walletAddress as `0x${string}`);
    }
  }

  async getMarketsInfo() {
    try {
      const result = await this.sdk.markets.getMarketsInfo();
      return {
        markets: result.marketsInfoData || {},
        tokens: result.tokensData || {}
      };
    } catch (error) {
      console.error('Failed to fetch markets info:', error);
      throw error;
    }
  }

  async getPositions() {
    try {
      if (!this.walletAddress) {
        return [];
      }

      // Always get fresh markets and tokens data for live prices
      const marketsResult = await this.getMarketsInfo();
      
      const positionsResult = await this.sdk.positions.getPositionsInfo({
        marketsInfoData: marketsResult.markets,
        tokensData: marketsResult.tokens,
        showPnlInLeverage: false,
      });

      if (!positionsResult || Object.keys(positionsResult).length === 0) {
        return [];
      }

      // Map positions with fresh market data for live prices
      return Object.values(positionsResult).map((position: any) => {
        // Get fresh market price from marketsResult
        const marketInfo = marketsResult.markets[position.marketAddress];
        const indexToken = marketsResult.tokens[position.indexTokenAddress];
        
        // Use the latest index price from the market data
        const currentMarkPrice = position.markPrice ? bigIntToDecimal(position.markPrice, USD_DECIMALS) : 0;

        // Debug PnL calculation
        const entryPrice = position.entryPrice ? bigIntToDecimal(position.entryPrice, USD_DECIMALS) : 0;
        const sizeInUsd = position.sizeInUsd ? bigIntToDecimal(position.sizeInUsd, USD_DECIMALS) : 0;
        const rawPnl = position.pnl ? bigIntToDecimal(position.pnl, USD_DECIMALS) : 0;
        const rawPnlPercentage = position.pnlPercentage ? bigIntToDecimal(position.pnlPercentage, 4) : 0;
        
        // Manual PnL calculation - the SDK values seem to be incorrect/stale
        let calculatedPnl = rawPnl;
        let calculatedPnlPercentage = rawPnlPercentage;
        
        if (entryPrice > 0 && currentMarkPrice > 0 && sizeInUsd > 0) {
          const priceChange = currentMarkPrice - entryPrice;
          const priceChangePercentage = (priceChange / entryPrice) * 100;
          
          // For shorts, PnL is inverted (profit when price goes down)
          const directionMultiplier = position.isLong ? 1 : -1;
          const manualPnl = (priceChange / entryPrice) * sizeInUsd * directionMultiplier;
          const manualPnlPercentage = priceChangePercentage * directionMultiplier;
          
          // Always use manual calculation since SDK values are clearly wrong
          calculatedPnl = manualPnl;
          calculatedPnlPercentage = manualPnlPercentage;
        }
        

        return {
          key: position.key,
          marketAddress: position.marketAddress,
          indexTokenAddress: position.indexTokenAddress,
          collateralTokenAddress: position.collateralTokenAddress,
          isLong: position.isLong,
          sizeInUsd: sizeInUsd,
          sizeInTokens: position.sizeInTokens ? bigIntToDecimal(position.sizeInTokens, position.indexToken?.decimals || 18) : 0,
          collateralAmount: position.collateralAmount ? bigIntToDecimal(position.collateralAmount, position.collateralToken?.decimals || 18) : 0,
          collateralUsd: position.collateralUsd ? bigIntToDecimal(position.collateralUsd, USD_DECIMALS) : 0,
          markPrice: currentMarkPrice,
          entryPrice: entryPrice,
          unrealizedPnl: calculatedPnl,
          unrealizedPnlPercentage: calculatedPnlPercentage,
          leverage: position.leverage ? bigIntToDecimal(position.leverage, 4) : 0,
          liquidationPrice: position.liquidationPrice ? bigIntToDecimal(position.liquidationPrice, USD_DECIMALS) : 0,
          marketInfo: marketInfo,
          indexToken: position.indexToken || indexToken, // Prioritize position's indexToken
          collateralToken: position.collateralToken,
        };
      });
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw error;
    }
  }

  async getOrders() {
    try {
      if (!this.walletAddress) {
        console.warn('No wallet address configured');
        return [];
      }

      // Get markets and tokens data first
      const marketsResult = await this.getMarketsInfo();
      
      const ordersResult = await this.sdk.orders.getOrders({
        account: this.walletAddress,
        marketsInfoData: marketsResult.markets,
        tokensData: marketsResult.tokens,
      });

      console.log('Orders result:', ordersResult);

      if (!ordersResult.ordersInfoData) {
        return [];
      }

      return Object.values(ordersResult.ordersInfoData).map((order: any) => ({
        key: order.key,
        account: order.account,
        orderType: order.orderType,
        decreasePositionSwapType: order.decreasePositionSwapType,
        sizeDeltaUsd: order.sizeDeltaUsd ? bigIntToDecimal(order.sizeDeltaUsd, USD_DECIMALS) : 0,
        initialCollateralDeltaAmount: order.initialCollateralDeltaAmount,
        triggerPrice: order.triggerPrice ? bigIntToDecimal(order.triggerPrice, USD_DECIMALS) : 0,
        acceptablePrice: order.acceptablePrice ? bigIntToDecimal(order.acceptablePrice, USD_DECIMALS) : 0,
        executionFee: order.executionFee ? bigIntToDecimal(order.executionFee, 18) : 0,
        callbackGasLimit: order.callbackGasLimit,
        minOutputAmount: order.minOutputAmount,
        updatedAtBlock: order.updatedAtBlock,
        isLong: order.isLong,
        shouldUnwrapNativeToken: order.shouldUnwrapNativeToken,
        isFrozen: order.isFrozen,
        marketInfo: order.marketInfo,
        indexToken: order.indexToken,
        initialCollateralToken: order.initialCollateralToken,
        targetCollateralToken: order.targetCollateralToken,
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getTradingHistory() {
    try {
      if (!this.walletAddress) {
        return [];
      }

      // Get markets and tokens data first
      const marketsResult = await this.getMarketsInfo();

      // Fetch all trades with pagination to get complete history
      let allTrades: any[] = [];
      let pageIndex = 0;
      const pageSize = 1000; // Increase page size for efficiency
      let hasMoreData = true;

      console.log('Fetching complete trading history...');

      while (hasMoreData) {
        console.log(`Fetching page ${pageIndex + 1}...`);
        
        const history = await this.sdk.trades.getTradeHistory({
          forAllAccounts: false,
          pageSize: pageSize,
          pageIndex: pageIndex,
          marketsInfoData: marketsResult.markets,
          tokensData: marketsResult.tokens,
        });

        if (history && history.length > 0) {
          allTrades.push(...history);
          pageIndex++;
          
          // If we got less than the page size, we've reached the end
          if (history.length < pageSize) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }

        // Safety break to prevent infinite loops
        if (pageIndex > 50) { // Max 50 pages (50k trades)
          console.warn('Reached maximum page limit, stopping pagination');
          break;
        }
      }

      console.log(`Fetched ${allTrades.length} total trades from ${pageIndex} pages`);

      // Filter to only executed trades at the data processing level for efficiency
      const executedTrades = allTrades.filter(trade => trade.eventName === 'OrderExecuted');
      console.log(`Found ${executedTrades.length} executed trades out of ${allTrades.length} total trades`);

      const processedTrades = executedTrades.map((trade: any) => {
        // Handle timestamp - ensure it's in seconds
        let finalTimestamp = trade.timestamp || Date.now() / 1000;
        
        // If timestamp looks like it's in milliseconds (> year 2100 in seconds), convert to seconds
        if (finalTimestamp > 4102444800) { // Jan 1, 2100 in seconds
          finalTimestamp = finalTimestamp / 1000;
        }

        return {
          id: trade.id || `${trade.transaction?.hash}-${Date.now()}`,
          txHash: trade.transaction?.hash,
          blockNumber: trade.transaction?.blockNumber,
          timestamp: finalTimestamp,
          eventName: trade.eventName,
          orderType: trade.orderType,
          orderKey: trade.orderKey,
          account: trade.account,
          marketAddress: trade.marketAddress || trade.marketInfo?.marketTokenAddress,
          isLong: trade.isLong,
          sizeDeltaUsd: trade.sizeDeltaUsd ? bigIntToDecimal(trade.sizeDeltaUsd, USD_DECIMALS) : 0,
          collateralDeltaAmount: trade.initialCollateralDeltaAmount,
          triggerPrice: trade.triggerPrice && trade.triggerPrice !== 0n ? bigIntToDecimal(trade.triggerPrice, USD_DECIMALS) : 0,
          acceptablePrice: trade.acceptablePrice ? bigIntToDecimal(trade.acceptablePrice, USD_DECIMALS) : 0,
          executionPrice: trade.executionPrice ? bigIntToDecimal(trade.executionPrice, USD_DECIMALS) : 0,
          priceImpactUsd: trade.priceImpactUsd ? bigIntToDecimal(trade.priceImpactUsd, USD_DECIMALS) : 0,
          positionFeeAmount: trade.positionFeeAmount,
          borrowingFeeAmount: trade.borrowingFeeAmount,
          fundingFeeAmount: trade.fundingFeeAmount,
          pnlUsd: trade.pnlUsd ? bigIntToDecimal(trade.pnlUsd, USD_DECIMALS) : trade.basePnlUsd ? bigIntToDecimal(trade.basePnlUsd, USD_DECIMALS) : 0,
          marketInfo: trade.marketInfo,
          indexToken: trade.indexToken,
          collateralToken: trade.initialCollateralToken || trade.targetCollateralToken,
        };
      });

      console.log(`Processed ${processedTrades.length} executed trades for dashboard`);
      return processedTrades;
    } catch (error) {
      console.error('Failed to fetch trading history:', error);
      throw error;
    }
  }

  calculatePerformanceMetrics(trades: any[]) {
    if (!trades.length) {
      return {
        totalPnl: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        averageProfit: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
      };
    }

    const executedTrades = trades.filter(trade => 
      trade.pnlUsd !== undefined && 
      trade.pnlUsd !== 0
    );

    if (!executedTrades.length) {
      return {
        totalPnl: 0,
        winRate: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        averageProfit: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        profitFactor: 0,
      };
    }

    const totalPnl = executedTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0);
    const winningTrades = executedTrades.filter(trade => trade.pnlUsd > 0);
    const losingTrades = executedTrades.filter(trade => trade.pnlUsd < 0);
    
    const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnlUsd, 0));
    
    const averageProfit = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    
    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnlUsd)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnlUsd)) : 0;
    
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    return {
      totalPnl,
      winRate: (winningTrades.length / executedTrades.length) * 100,
      totalTrades: executedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      averageProfit,
      averageLoss,
      largestWin,
      largestLoss,
      profitFactor,
    };
  }
}