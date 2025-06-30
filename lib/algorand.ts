import algosdk from 'algosdk';
import { NFTMetadata, generateMetadataHash } from './ipfs';
import { NodelyAPI, nodelyAlgodClient } from './nodely-client';

// Enhanced Algorand utilities using Nodely API
export class AlgorandService {
  
  // Create ARC3 NFT with enhanced error handling
  static async createARC3NFT(
    creator: string,
    metadata: NFTMetadata,
    metadataUrl: string,
    royaltyPercentage: number = 0
  ): Promise<algosdk.Transaction> {
    try {
      const suggestedParams = await NodelyAPI.getSuggestedParams();
      
      // Generate metadata hash for ARC3 compliance
      const metadataHash = await generateMetadataHash(metadata);
      
      // Create asset creation transaction with correct parameter structure
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        sender: creator,
        note: new TextEncoder().encode(`AlgoBazaar NFT: ${metadata.name}`),
        total: 1,
        decimals: 0,
        defaultFrozen: false,
        manager: creator,
        reserve: creator,
        freeze: creator,
        clawback: creator,
        unitName: 'ARC3',
        assetName: metadata.name.substring(0, 32),
        assetURL: metadataUrl.substring(0, 96),
        assetMetadataHash: metadataHash,
        suggestedParams
      });

      return txn;
    } catch (error) {
      console.error('Error creating ARC3 NFT:', error);
      throw new Error('Failed to create NFT transaction');
    }
  }

  // Create atomic transfer for NFT marketplace
  static async createAtomicTransfer(
    buyer: string,
    seller: string,
    assetId: number,
    price: number,
    royaltyRecipient?: string,
    royaltyAmount?: number
  ): Promise<algosdk.Transaction[]> {
    try {
      const suggestedParams = await NodelyAPI.getSuggestedParams();
      const txns: algosdk.Transaction[] = [];
      
      // Calculate amounts
      const platformFee = this.calculatePlatformFee(price);
      const royaltyFee = royaltyAmount || 0;
      const sellerAmount = price - platformFee - royaltyFee;
      
      // Payment transaction from buyer to seller
      const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyer,
        to: seller,
        amount: algosdk.algosToMicroalgos(sellerAmount),
        suggestedParams,
        note: new TextEncoder().encode(`AlgoBazaar: NFT Purchase #${assetId}`),
      });
      txns.push(paymentTxn);

      // Platform fee payment
      if (platformFee > 0) {
        const platformAddress = process.env.PLATFORM_WALLET_ADDRESS || seller;
        const platformFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: buyer,
          to: platformAddress,
          amount: algosdk.algosToMicroalgos(platformFee),
          suggestedParams,
          note: new TextEncoder().encode('AlgoBazaar: Platform Fee'),
        });
        txns.push(platformFeeTxn);
      }

      // Royalty payment
      if (royaltyRecipient && royaltyFee > 0) {
        const royaltyTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: buyer,
          to: royaltyRecipient,
          amount: algosdk.algosToMicroalgos(royaltyFee),
          suggestedParams,
          note: new TextEncoder().encode('AlgoBazaar: Creator Royalty'),
        });
        txns.push(royaltyTxn);
      }

      // Asset transfer from seller to buyer
      const assetTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: seller,
        to: buyer,
        assetIndex: assetId,
        amount: 1,
        suggestedParams,
        note: new TextEncoder().encode(`AlgoBazaar: NFT Transfer #${assetId}`),
      });
      txns.push(assetTransferTxn);

      // Group transactions for atomicity
      algosdk.assignGroupID(txns);

      return txns;
    } catch (error) {
      console.error('Error creating atomic transfer:', error);
      throw new Error('Failed to create purchase transaction');
    }
  }

  // Create asset opt-in transaction
  static async createAssetOptIn(
    account: string,
    assetId: number
  ): Promise<algosdk.Transaction> {
    try {
      const suggestedParams = await NodelyAPI.getSuggestedParams();
      
      const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: account,
        to: account,
        assetIndex: assetId,
        amount: 0,
        suggestedParams,
        note: new TextEncoder().encode(`AlgoBazaar: Asset Opt-in #${assetId}`),
      });

      return optInTxn;
    } catch (error) {
      console.error('Error creating asset opt-in:', error);
      throw new Error('Failed to create opt-in transaction');
    }
  }

  // Create staking transaction
  static async createStakeTransaction(
    user: string,
    assetId: number,
    amount: number,
    stakingContract: string
  ): Promise<algosdk.Transaction> {
    try {
      const suggestedParams = await NodelyAPI.getSuggestedParams();
      
      const stakeTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: user,
        to: stakingContract,
        assetIndex: assetId,
        amount: amount,
        suggestedParams,
        note: new TextEncoder().encode(`AlgoBazaar: Stake Asset #${assetId}`),
      });

      return stakeTxn;
    } catch (error) {
      console.error('Error creating stake transaction:', error);
      throw new Error('Failed to create stake transaction');
    }
  }

  // Utility functions
  static calculateRoyalty(salePrice: number, royaltyPercentage: number): number {
    return (salePrice * royaltyPercentage) / 100;
  }

  static calculatePlatformFee(salePrice: number, feePercentage: number = 2.5): number {
    return (salePrice * feePercentage) / 100;
  }

  static formatAlgoAmount(microAlgos: number): string {
    return (microAlgos / 1000000).toFixed(6);
  }

  static formatAssetAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  // Check if account has opted into asset
  static async hasOptedIntoAsset(address: string, assetId: number): Promise<boolean> {
    try {
      const accountInfo = await NodelyAPI.getAccountInformation(address);
      return accountInfo.assets?.some((asset: any) => asset['asset-id'] === assetId) || false;
    } catch (error) {
      console.error('Error checking asset opt-in:', error);
      return false;
    }
  }

  // Get asset balance for account
  static async getAssetBalance(address: string, assetId: number): Promise<number> {
    try {
      const accountInfo = await NodelyAPI.getAccountInformation(address);
      const asset = accountInfo.assets?.find((asset: any) => asset['asset-id'] === assetId);
      return asset ? asset.amount : 0;
    } catch (error) {
      console.error('Error getting asset balance:', error);
      return 0;
    }
  }

  // Submit transaction with enhanced error handling
  static async submitTransaction(signedTxn: Uint8Array): Promise<any> {
    try {
      return await NodelyAPI.submitTransaction(signedTxn);
    } catch (error: any) {
      console.error('Error submitting transaction:', error);
      
      // Parse common Algorand errors
      if (error.message?.includes('overspend')) {
        throw new Error('Insufficient balance for transaction');
      } else if (error.message?.includes('asset not found')) {
        throw new Error('Asset not found or invalid');
      } else if (error.message?.includes('not opted in')) {
        throw new Error('Account not opted into asset');
      } else if (error.message?.includes('below min')) {
        throw new Error('Transaction amount below minimum');
      }
      
      throw new Error('Transaction failed. Please try again.');
    }
  }

  // Submit grouped transactions
  static async submitGroupedTransactions(signedTxns: Uint8Array[]): Promise<any> {
    try {
      const { txId } = await nodelyAlgodClient.sendRawTransaction(signedTxns).do();
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(nodelyAlgodClient, txId, 4);
      
      return {
        txId,
        confirmedRound: confirmedTxn['confirmed-round'],
        groupId: confirmedTxn['txn']['txn']['grp']
      };
    } catch (error: any) {
      console.error('Error submitting grouped transactions:', error);
      throw new Error('Transaction group failed. Please try again.');
    }
  }
}

// Export individual functions for backward compatibility
export const {
  createARC3NFT,
  createAtomicTransfer,
  createAssetOptIn,
  createStakeTransaction,
  calculateRoyalty,
  calculatePlatformFee,
  submitTransaction,
  submitGroupedTransactions
} = AlgorandService;