import algosdk from 'algosdk';
import { AlgorandService } from './algorand';
import { NodelyAPI } from './nodely-client';

export interface NFTPurchaseParams {
  nftId: number;
  assetId: number;
  price: number;
  seller: string;
  buyer: string;
  royaltyRecipient?: string;
  royaltyPercentage?: number;
}

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  groupId?: string;
  confirmedRound?: number;
}

export class MarketplaceService {
  
  // Real NFT purchase implementation
  static async purchaseNFT(
    params: NFTPurchaseParams,
    signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<PurchaseResult> {
    try {
      console.log('🛒 Starting real NFT purchase...', params);
      
      // 1. Validate buyer has sufficient balance
      const buyerInfo = await NodelyAPI.getAccountInformation(params.buyer);
      const buyerBalance = buyerInfo.amount / 1000000; // Convert to ALGO
      
      if (buyerBalance < params.price) {
        throw new Error(`Insufficient balance. Need ${params.price} ALGO, have ${buyerBalance.toFixed(2)} ALGO`);
      }
      
      // 2. Check if buyer has opted into the asset
      const hasOptedIn = await AlgorandService.hasOptedIntoAsset(params.buyer, params.assetId);
      
      if (!hasOptedIn) {
        throw new Error('You must opt-in to this asset before purchasing. Please opt-in first.');
      }
      
      // 3. Verify seller owns the NFT
      const sellerAssetBalance = await AlgorandService.getAssetBalance(params.seller, params.assetId);
      if (sellerAssetBalance < 1) {
        throw new Error('Seller does not own this NFT');
      }
      
      // 4. Calculate fees and royalties
      const platformFee = AlgorandService.calculatePlatformFee(params.price);
      const royaltyFee = params.royaltyPercentage ? 
        AlgorandService.calculateRoyalty(params.price, params.royaltyPercentage) : 0;
      
      console.log('💰 Purchase breakdown:', {
        price: params.price,
        platformFee,
        royaltyFee,
        sellerReceives: params.price - platformFee - royaltyFee
      });
      
      // 5. Create atomic transaction group
      const transactions = await AlgorandService.createAtomicTransfer(
        params.buyer,
        params.seller,
        params.assetId,
        params.price,
        params.royaltyRecipient,
        royaltyFee
      );
      
      console.log(`📝 Created ${transactions.length} transactions for atomic transfer`);
      
      // 6. Sign transactions
      console.log('✍️ Requesting transaction signatures...');
      const signedTransactions = await signTransactions(transactions);
      
      // 7. Submit to blockchain
      console.log('📡 Submitting to Algorand blockchain...');
      const result = await AlgorandService.submitGroupedTransactions(signedTransactions);
      
      console.log('✅ NFT purchase successful!', result);
      
      return {
        success: true,
        transactionId: result.txId,
        groupId: result.groupId,
        confirmedRound: result.confirmedRound
      };
      
    } catch (error: any) {
      console.error('❌ NFT purchase failed:', error);
      
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }
  
  // Asset opt-in helper
  static async optInToAsset(
    userAddress: string,
    assetId: number,
    signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  ): Promise<PurchaseResult> {
    try {
      console.log(`🔗 Opting in to asset ${assetId}...`);
      
      const optInTxn = await AlgorandService.createAssetOptIn(userAddress, assetId);
      const signedTxn = await signTransaction(optInTxn);
      const result = await AlgorandService.submitTransaction(signedTxn);
      
      return {
        success: true,
        transactionId: result.txId,
        confirmedRound: result.confirmedRound
      };
      
    } catch (error: any) {
      console.error('❌ Asset opt-in failed:', error);
      return {
        success: false,
        error: error.message || 'Opt-in failed'
      };
    }
  }
  
  // Check purchase prerequisites
  static async checkPurchasePrerequisites(
    buyerAddress: string,
    assetId: number,
    price: number
  ): Promise<{
    canPurchase: boolean;
    issues: string[];
    balance: number;
    hasOptedIn: boolean;
  }> {
    const issues: string[] = [];
    
    try {
      // Check balance
      const accountInfo = await NodelyAPI.getAccountInformation(buyerAddress);
      const balance = accountInfo.amount / 1000000;
      
      if (balance < price) {
        issues.push(`Insufficient balance: need ${price} ALGO, have ${balance.toFixed(2)} ALGO`);
      }
      
      // Check opt-in status
      const hasOptedIn = await AlgorandService.hasOptedIntoAsset(buyerAddress, assetId);
      if (!hasOptedIn) {
        issues.push('Must opt-in to asset before purchasing');
      }
      
      return {
        canPurchase: issues.length === 0,
        issues,
        balance,
        hasOptedIn
      };
      
    } catch (error) {
      issues.push('Failed to check purchase prerequisites');
      return {
        canPurchase: false,
        issues,
        balance: 0,
        hasOptedIn: false
      };
    }
  }
}