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
      console.log(`💼 GMX SDK initialized with account: ${this.walletAddress}`);
    }
  }

  async getMarketsInfo() {
    try {
      const result = await this.sdk.markets.getMarketsInfo();
      console.log('Markets info result structure:', {
        hasMarketsInfoData: !!result.marketsInfoData,
        hasTokensData: !!result.tokensData,
        marketsCount: Object.keys(result.marketsInfoData || {}).length,
        tokensCount: Object.keys(result.tokensData || {}).length
      });

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
        console.warn('No wallet address configured');
        return [];
      }

      // First get markets and tokens data
      const marketsResult = await this.getMarketsInfo();
      
      const positionsResult = await this.sdk.positions.getPositionsInfo({
        marketsInfoData: marketsResult.markets,
        tokensData: marketsResult.tokens,
        showPnlInLeverage: false,
      });

      console.log('Positions result:', positionsResult);

      if (!positionsResult || Object.keys(positionsResult).length === 0) {
        return [];
      }

      return Object.values(positionsResult).map((position: any) => ({
        key: position.key,
        marketAddress: position.marketAddress,
        indexTokenAddress: position.indexTokenAddress,
        collateralTokenAddress: position.collateralTokenAddress,
        isLong: position.isLong,
        sizeInUsd: position.sizeInUsd ? bigIntToDecimal(position.sizeInUsd, USD_DECIMALS) : 0,
        sizeInTokens: position.sizeInTokens ? bigIntToDecimal(position.sizeInTokens, position.indexToken?.decimals || 18) : 0,
        collateralAmount: position.collateralAmount ? bigIntToDecimal(position.collateralAmount, position.collateralToken?.decimals || 18) : 0,
        collateralUsd: position.collateralUsd ? bigIntToDecimal(position.collateralUsd, USD_DECIMALS) : 0,
        markPrice: position.markPrice ? bigIntToDecimal(position.markPrice, USD_DECIMALS) : 0,
        entryPrice: position.entryPrice ? bigIntToDecimal(position.entryPrice, USD_DECIMALS) : 0,
        unrealizedPnl: position.pnl ? bigIntToDecimal(position.pnl, USD_DECIMALS) : 0,
        unrealizedPnlPercentage: position.pnlPercentage ? bigIntToDecimal(position.pnlPercentage, 4) : 0,
        leverage: position.leverage ? bigIntToDecimal(position.leverage, 4) : 0,
        liquidationPrice: position.liquidationPrice ? bigIntToDecimal(position.liquidationPrice, USD_DECIMALS) : 0,
        marketInfo: position.marketInfo,
        indexToken: position.indexToken,
        collateralToken: position.collateralToken,
      }));
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
        console.warn('No wallet address configured');
        return [];
      }

      // Get markets and tokens data first
      const marketsResult = await this.getMarketsInfo();

      const history = await this.sdk.trades.getTradeHistory({
        forAllAccounts: false,
        pageSize: 100,
        pageIndex: 0,
        marketsInfoData: marketsResult.markets,
        tokensData: marketsResult.tokens,
      });

      console.log('Raw trading history from SDK:', history);
      console.log('History length:', history.length);
      if (history.length > 0) {
        console.log('First trade sample:', history[0]);
      }


      const processedTrades = history.map((trade: any) => {
        console.log('Processing trade:', trade.id, {
          pnlUsd: trade.pnlUsd,
          basePnlUsd: trade.basePnlUsd,
          sizeDeltaUsd: trade.sizeDeltaUsd,
          executionPrice: trade.executionPrice
        });

        return {
          id: trade.id || `${trade.transaction?.hash}-${Date.now()}`,
          txHash: trade.transaction?.hash,
          blockNumber: trade.transaction?.blockNumber,
          timestamp: trade.timestamp || Date.now() / 1000,
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

      console.log('Processed trades sample:', processedTrades[0]);
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
      trade.eventName === 'OrderExecuted' && 
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