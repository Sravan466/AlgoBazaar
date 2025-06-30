import algosdk from 'algosdk';

// Nodely API configuration - Using server-side environment variables
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || '';
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'mainnet';

// Nodely endpoints - CORRECTED WITH 4160 SUBDOMAIN
const MAINNET_ALGOD_SERVER = 'https://mainnet-api.4160.nodely.io';
const MAINNET_INDEXER_SERVER = 'https://mainnet-idx.4160.nodely.io';
const TESTNET_ALGOD_SERVER = 'https://testnet-api.4160.nodely.io';
const TESTNET_INDEXER_SERVER = 'https://testnet-idx.4160.nodely.io';

// Select endpoints based on environment
const ALGOD_SERVER = ENVIRONMENT === 'mainnet' ? MAINNET_ALGOD_SERVER : TESTNET_ALGOD_SERVER;
const INDEXER_SERVER = ENVIRONMENT === 'mainnet' ? MAINNET_INDEXER_SERVER : TESTNET_INDEXER_SERVER;

// Initialize Nodely clients (for server-side operations only) - CORRECTED AUTH HEADER
export const nodelyAlgodClient = new algosdk.Algodv2(
  { 'X-Algo-Api-Token': ALGOD_TOKEN },
  ALGOD_SERVER,
  undefined
);

export const nodelyIndexerClient = new algosdk.Indexer(
  { 'X-Algo-Api-Token': INDEXER_TOKEN },
  INDEXER_SERVER,
  undefined
);

// Enhanced API functions using Next.js API routes to bypass CORS
export class NodelyAPI {
  static async getAccountInformation(address: string) {
    try {
      console.log(`Fetching account information for ${address} via API route`);
      
      const response = await fetch(`/api/nodely/account?address=${address}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const account = await response.json();
      console.log(`Successfully fetched account info for ${address}`);
      return account;
    } catch (error: any) {
      console.error('Error fetching account information:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to API');
      } else if (error.message?.includes('Invalid API key')) {
        throw new Error('API authentication failed');
      } else if (error.message?.includes('Account not found')) {
        throw new Error('Account not found on the network');
      } else if (error.message?.includes('Rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      throw new Error(error.message || 'Failed to fetch account information');
    }
  }

  static async getAccountAssets(address: string) {
    try {
      const response = await nodelyIndexerClient
        .lookupAccountByID(address)
        .includeAll(true)
        .do();
      return response.account.assets || [];
    } catch (error) {
      console.error('Error fetching account assets:', error);
      throw new Error('Failed to fetch account assets');
    }
  }

  static async getAccountNFTs(address: string) {
    try {
      const response = await nodelyIndexerClient
        .lookupAccountByID(address)
        .includeAll(true)
        .do();
      
      const assets = response.account.assets || [];
      // Filter for NFTs (assets with total supply of 1 and 0 decimals)
      const nfts = assets.filter((asset: any) => 
        asset['asset-params'] && 
        asset['asset-params'].total === 1 && 
        asset['asset-params'].decimals === 0
      );
      
      return nfts;
    } catch (error) {
      console.error('Error fetching account NFTs:', error);
      throw new Error('Failed to fetch account NFTs');
    }
  }

  static async getAssetInformation(assetId: number) {
    try {
      const response = await nodelyIndexerClient.lookupAssetByID(assetId).do();
      return response.asset;
    } catch (error) {
      console.error('Error fetching asset information:', error);
      throw new Error('Failed to fetch asset information');
    }
  }

  static async getTransactionHistory(address: string, limit: number = 50) {
    try {
      const response = await nodelyIndexerClient
        .lookupAccountTransactions(address)
        .limit(limit)
        .do();
      return response.transactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return []; // Return empty array instead of throwing
    }
  }

  static async submitTransaction(signedTxn: Uint8Array) {
    try {
      const { txId } = await nodelyAlgodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(nodelyAlgodClient, txId, 4);
      
      return {
        txId,
        confirmedRound: confirmedTxn['confirmed-round'],
        assetIndex: confirmedTxn['asset-index'],
        applicationIndex: confirmedTxn['application-index']
      };
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw new Error('Failed to submit transaction');
    }
  }

  static async getSuggestedParams() {
    try {
      return await nodelyAlgodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Error getting suggested params:', error);
      throw new Error('Failed to get suggested params');
    }
  }

  static async searchAssets(query: string, limit: number = 20) {
    try {
      const response = await nodelyIndexerClient
        .searchForAssets()
        .name(query)
        .limit(limit)
        .do();
      return response.assets || [];
    } catch (error) {
      console.error('Error searching assets:', error);
      throw new Error('Failed to search assets');
    }
  }

  static async getMarketplaceNFTs(limit: number = 50) {
    try {
      // Search for NFTs (assets with total supply of 1)
      const response = await nodelyIndexerClient
        .searchForAssets()
        .limit(limit)
        .do();
      
      const assets = response.assets || [];
      // Filter for NFTs
      const nfts = assets.filter((asset: any) => 
        asset.params && 
        asset.params.total === 1 && 
        asset.params.decimals === 0 &&
        asset.params.url // Has metadata URL
      );
      
      return nfts;
    } catch (error) {
      console.error('Error fetching marketplace NFTs:', error);
      throw new Error('Failed to fetch marketplace NFTs');
    }
  }
}