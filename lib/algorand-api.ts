import algosdk from 'algosdk';
import { NodelyAPI } from './nodely-client';

export interface AssetInfo {
  assetId: number;
  name: string;
  unitName: string;
  total: number;
  decimals: number;
  creator: string;
  manager: string;
  reserve: string;
  freeze: string;
  clawback: string;
  url: string;
  metadataHash: string;
  defaultFrozen: boolean;
}

export interface AccountAsset {
  assetId: number;
  amount: number;
  isFrozen: boolean;
  optedInAtRound: number;
  assetInfo?: AssetInfo;
}

export interface StakingPool {
  id: number;
  name: string;
  assetId: number;
  totalStaked: number;
  apy: number;
  lockPeriod: number;
  minStake: number;
  maxStake: number;
  participants: number;
  isActive: boolean;
}

export interface SwapQuote {
  fromAsset: number;
  toAsset: number;
  fromAmount: number;
  toAmount: number;
  rate: number;
  priceImpact: number;
  fee: number;
  slippage: number;
}

export class AlgorandAPI {
  
  // Get real account information with assets
  static async getAccountInfo(address: string) {
    try {
      const accountInfo = await NodelyAPI.getAccountInformation(address);
      
      // Process assets with additional info
      const assets = await Promise.all(
        (accountInfo.assets || []).map(async (asset: any) => {
          try {
            const assetInfo = await this.getAssetInfo(asset['asset-id']);
            return {
              assetId: asset['asset-id'],
              amount: asset.amount,
              isFrozen: asset['is-frozen'] || false,
              optedInAtRound: asset['opted-in-at-round'] || 0,
              assetInfo
            };
          } catch (error) {
            console.warn(`Failed to fetch info for asset ${asset['asset-id']}`);
            return {
              assetId: asset['asset-id'],
              amount: asset.amount,
              isFrozen: asset['is-frozen'] || false,
              optedInAtRound: asset['opted-in-at-round'] || 0
            };
          }
        })
      );

      return {
        address,
        balance: accountInfo.amount / 1000000, // Convert to ALGO
        minBalance: accountInfo['min-balance'] / 1000000,
        assets,
        createdAssets: accountInfo['created-assets'] || [],
        createdApps: accountInfo['created-apps'] || [],
        totalAppsOptedIn: accountInfo['total-apps-opted-in'] || 0,
        totalAssetsOptedIn: accountInfo['total-assets-opted-in'] || 0,
        totalCreatedAssets: accountInfo['total-created-assets'] || 0,
        totalCreatedApps: accountInfo['total-created-apps'] || 0
      };
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  // Get asset information
  static async getAssetInfo(assetId: number): Promise<AssetInfo> {
    try {
      const assetInfo = await NodelyAPI.getAssetInformation(assetId);
      const params = assetInfo.params;
      
      return {
        assetId,
        name: params.name || '',
        unitName: params['unit-name'] || '',
        total: params.total || 0,
        decimals: params.decimals || 0,
        creator: params.creator || '',
        manager: params.manager || '',
        reserve: params.reserve || '',
        freeze: params.freeze || '',
        clawback: params.clawback || '',
        url: params.url || '',
        metadataHash: params['metadata-hash'] || '',
        defaultFrozen: params['default-frozen'] || false
      };
    } catch (error) {
      console.error(`Error fetching asset ${assetId} info:`, error);
      throw error;
    }
  }

  // Get transaction history
  static async getTransactionHistory(address: string, limit: number = 50) {
    try {
      const transactions = await NodelyAPI.getTransactionHistory(address, limit);
      
      return transactions.map((tx: any) => ({
        id: tx.id,
        type: tx['tx-type'],
        sender: tx.sender,
        receiver: tx['payment-transaction']?.receiver || tx['asset-transfer-transaction']?.receiver,
        amount: tx['payment-transaction']?.amount || tx['asset-transfer-transaction']?.amount || 0,
        assetId: tx['asset-transfer-transaction']?.['asset-id'] || 0,
        fee: tx.fee,
        confirmedRound: tx['confirmed-round'],
        roundTime: tx['round-time'],
        note: tx.note ? new TextDecoder().decode(new Uint8Array(tx.note)) : '',
        signature: tx.signature
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get NFTs owned by account
  static async getAccountNFTs(address: string) {
    try {
      const accountInfo = await this.getAccountInfo(address);
      
      // Filter for NFTs (assets with total supply of 1 and 0 decimals)
      const nfts = accountInfo.assets.filter(asset => 
        asset.assetInfo && 
        asset.assetInfo.total === 1 && 
        asset.assetInfo.decimals === 0 &&
        asset.amount > 0
      );

      return nfts.map(nft => ({
        assetId: nft.assetId,
        name: nft.assetInfo?.name || `Asset #${nft.assetId}`,
        unitName: nft.assetInfo?.unitName || '',
        creator: nft.assetInfo?.creator || '',
        url: nft.assetInfo?.url || '',
        amount: nft.amount,
        metadataHash: nft.assetInfo?.metadataHash
      }));
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }

  // Get real staking pools (mock for now, would connect to actual staking contracts)
  static async getStakingPools(): Promise<StakingPool[]> {
    // In a real implementation, this would query actual staking smart contracts
    // For now, returning realistic pools that could exist on Algorand
    return [
      {
        id: 1,
        name: 'ALGO Staking Pool',
        assetId: 0, // ALGO
        totalStaked: 5000000,
        apy: 6.2, // Realistic ALGO staking APY
        lockPeriod: 30,
        minStake: 1,
        maxStake: 100000,
        participants: 2500,
        isActive: true
      },
      {
        id: 2,
        name: 'USDC Yield Pool',
        assetId: 31566704, // USDC on Algorand
        totalStaked: 2000000,
        apy: 4.8,
        lockPeriod: 7,
        minStake: 100,
        maxStake: 50000,
        participants: 890,
        isActive: true
      }
    ];
  }

  // Get user's staking positions
  static async getUserStakingPositions(address: string) {
    try {
      // In a real implementation, this would query staking smart contracts
      // For now, return empty array since we don't have real staking contracts
      return [];
    } catch (error) {
      console.error('Error fetching staking positions:', error);
      return [];
    }
  }

  // Get swap quote (simplified - would integrate with actual DEX)
  static async getSwapQuote(
    fromAssetId: number,
    toAssetId: number,
    fromAmount: number
  ): Promise<SwapQuote> {
    try {
      // In a real implementation, this would query DEX pools like Tinyman, Pact, etc.
      // For now, using simplified calculation based on asset prices
      
      const fromAsset = fromAssetId === 0 ? { decimals: 6 } : await this.getAssetInfo(fromAssetId);
      const toAsset = toAssetId === 0 ? { decimals: 6 } : await this.getAssetInfo(toAssetId);
      
      // Simplified price calculation (would use real DEX prices)
      let rate = 1;
      if (fromAssetId === 0 && toAssetId === 31566704) { // ALGO to USDC
        rate = 0.18; // Approximate ALGO price in USD
      } else if (fromAssetId === 31566704 && toAssetId === 0) { // USDC to ALGO
        rate = 5.56; // Approximate USD to ALGO rate
      }
      
      const toAmount = fromAmount * rate;
      const fee = fromAmount * 0.003; // 0.3% fee
      const priceImpact = fromAmount > 1000 ? 0.5 : 0.1; // Simplified impact calculation
      
      return {
        fromAsset: fromAssetId,
        toAsset: toAssetId,
        fromAmount,
        toAmount: toAmount - fee,
        rate,
        priceImpact,
        fee,
        slippage: 0.5
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error;
    }
  }

  // Calculate portfolio value
  static async calculatePortfolioValue(address: string): Promise<number> {
    try {
      const accountInfo = await this.getAccountInfo(address);
      
      // Start with ALGO balance
      let totalValue = accountInfo.balance * 0.18; // ALGO price in USD
      
      // Add value of other assets (simplified pricing)
      for (const asset of accountInfo.assets) {
        if (asset.assetId === 31566704) { // USDC
          totalValue += asset.amount / 1000000; // USDC is 1:1 with USD
        }
        // Add other asset valuations as needed
      }
      
      return totalValue;
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      return 0;
    }
  }

  // Get asset price (simplified)
  static getAssetPrice(assetId: number): number {
    const prices: { [key: number]: number } = {
      0: 0.18, // ALGO
      31566704: 1.0, // USDC
      27165954: 0.015, // PLANET
      386192725: 43500, // WBTC (if it exists on Algorand)
    };
    
    return prices[assetId] || 0;
  }

  // Format asset amount based on decimals
  static formatAssetAmount(amount: number, decimals: number): number {
    return amount / Math.pow(10, decimals);
  }

  // Check if account has sufficient balance for transaction
  static async checkSufficientBalance(
    address: string,
    assetId: number,
    amount: number
  ): Promise<boolean> {
    try {
      const accountInfo = await this.getAccountInfo(address);
      
      if (assetId === 0) {
        // Check ALGO balance (account for minimum balance requirement)
        return accountInfo.balance - accountInfo.minBalance >= amount;
      } else {
        // Check asset balance
        const asset = accountInfo.assets.find(a => a.assetId === assetId);
        if (!asset) return false;
        
        const formattedAmount = this.formatAssetAmount(asset.amount, asset.assetInfo?.decimals || 0);
        return formattedAmount >= amount;
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      return false;
    }
  }
}