'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { toast } from 'sonner';
import { PeraWalletConnect } from '@perawallet/connect';

// Define the proper chain IDs as per Pera Wallet's types
type AlgorandChainIDs = 416001 | 416002;

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: number;
  connectWallet: (provider: 'pera' | 'walletconnect') => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>;
  signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;
  walletProvider: string | null;
  isLoading: boolean;
  networkId: AlgorandChainIDs;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [peraWallet, setPeraWallet] = useState<PeraWalletConnect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get network configuration - Now defaults to MainNet
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'mainnet';
  const networkId: AlgorandChainIDs = environment === 'mainnet' ? 416001 : 416002; // MainNet: 416001, TestNet: 416002

  // Initialize wallets
  useEffect(() => {
    const initWallets = async () => {
      try {
        // Initialize Pera Wallet with MainNet configuration
        const { PeraWalletConnect } = await import('@perawallet/connect');
        
        const peraWalletConfig = {
          chainId: networkId,
          shouldShowSignTxnToast: true,
          compactMode: false,
        };

        console.log('Initializing Pera Wallet with MainNet config:', peraWalletConfig);
        
        const pera = new PeraWalletConnect(peraWalletConfig);
        setPeraWallet(pera);

        // Check for existing Pera connection
        try {
          const accounts = await pera.reconnectSession();
          if (accounts && accounts.length > 0) {
            console.log('Reconnected to existing MainNet session:', accounts[0]);
            setAddress(accounts[0]);
            setIsConnected(true);
            setWalletProvider('pera');
            await fetchRealBalance(accounts[0]);
            toast.success('🔗 Wallet reconnected to MainNet!');
          }
        } catch (reconnectError) {
          console.log('No existing session to reconnect');
        }

        // Handle disconnect events
        pera.connector?.on('disconnect', () => {
          console.log('Wallet disconnected via connector');
          disconnectWallet();
        });

        // Handle session update events
        pera.connector?.on('session_update', (error: any, payload: any) => {
          if (error) {
            console.error('Session update error:', error);
            toast.error('Wallet session error');
            disconnectWallet();
          } else {
            console.log('Session updated:', payload);
          }
        });

      } catch (error) {
        console.error('Error initializing wallets:', error);
        toast.error('Failed to initialize wallet connection');
      }
    };

    initWallets();
  }, [networkId]);

  const connectWallet = async (provider: 'pera' | 'walletconnect') => {
    setIsLoading(true);
    try {
      if (provider === 'pera' && peraWallet) {
        console.log(`Connecting to Pera Wallet on ${environment} (chainId: ${networkId})`);
        
        // Disconnect any existing session first
        try {
          await peraWallet.disconnect();
        } catch (e) {
          // Ignore disconnect errors
        }

        // Connect with MainNet configuration
        const newAccounts = await peraWallet.connect();
        
        if (newAccounts && newAccounts.length > 0) {
          console.log('Successfully connected to Pera Wallet on MainNet:', newAccounts[0]);
          setAddress(newAccounts[0]);
          setIsConnected(true);
          setWalletProvider('pera');
          await fetchRealBalance(newAccounts[0]);
          
          toast.success('🎉 Pera Wallet connected to MainNet!', {
            description: `Connected to MAINNET: ${newAccounts[0].slice(0, 6)}...${newAccounts[0].slice(-4)}`
          });
        } else {
          throw new Error('No accounts returned from wallet');
        }
      } else if (provider === 'walletconnect') {
        toast.info('WalletConnect integration coming soon!');
      } else {
        throw new Error(`${provider} wallet is not available`);
      }
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      
      // Handle specific error types
      if (error.message?.includes('User rejected')) {
        toast.error('Connection cancelled by user');
      } else if (error.message?.includes('Network mismatch') || error.message?.includes('chainId')) {
        toast.error(`Network mismatch! Please switch your wallet to ${environment.toUpperCase()}`, {
          description: `Expected network: ${environment === 'mainnet' ? 'MainNet' : 'TestNet'}`
        });
      } else if (error.message?.includes('No accounts')) {
        toast.error('No accounts found in wallet');
      } else {
        toast.error('Failed to connect wallet', {
          description: error.message || 'Please try again'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    try {
      if (walletProvider === 'pera' && peraWallet) {
        peraWallet.disconnect();
      }
      
      setIsConnected(false);
      setAddress(null);
      setBalance(0);
      setWalletProvider(null);
      toast.success('👋 Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const fetchRealBalance = async (walletAddress: string) => {
    try {
      console.log(`Fetching real balance for ${walletAddress} on ${environment}`);
      
      // Use the API route to fetch real balance from Algorand
      const response = await fetch(`/api/nodely/account?address=${walletAddress}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }
      
      const accountInfo = await response.json();
      const algoBalance = accountInfo.amount / 1000000; // Convert microAlgos to Algos
      setBalance(algoBalance);
      
      console.log(`Real ${environment} balance fetched: ${algoBalance} ALGO`);
      
      if (algoBalance === 0) {
        toast.info(`💰 Balance: ${algoBalance} ALGO`, {
          description: `Your wallet is empty on ${environment.toUpperCase()}. Add ALGO to start trading!`,
          className: 'toast-premium',
        });
      } else {
        toast.success(`💰 Balance updated: ${algoBalance.toFixed(6)} ALGO`, {
          description: `Fetched from ${environment.toUpperCase()}`,
          className: 'toast-premium',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch real balance:', error);
      
      // Show error but don't set mock balance
      setBalance(0);
      
      toast.error('Failed to fetch balance from network', {
        description: 'Please check your connection and try again',
        className: 'toast-premium',
      });
    }
  };

  const signTransaction = async (txn: algosdk.Transaction): Promise<Uint8Array> => {
    if (!walletProvider) throw new Error('No wallet connected');
    if (!address) throw new Error('No wallet address available');
    
    try {
      console.log('Signing transaction with Pera Wallet on MainNet...');
      
      if (walletProvider === 'pera' && peraWallet) {
        // Ensure transaction is properly formatted
        const txnToSign = {
          txn: txn,
          signers: [address]
        };

        const signedTxns = await peraWallet.signTransaction([[txnToSign]]);
        
        if (!signedTxns || signedTxns.length === 0) {
          throw new Error('No signed transactions returned');
        }
        
        return signedTxns[0];
      }
      throw new Error('Wallet not available for signing');
    } catch (error: any) {
      console.error('Transaction signing failed:', error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Transaction cancelled by user');
      } else if (error.message?.includes('Network mismatch')) {
        throw new Error(`Network mismatch! Please ensure your wallet is connected to ${environment.toUpperCase()}`);
      }
      throw error;
    }
  };

  const signTransactions = async (txns: algosdk.Transaction[]): Promise<Uint8Array[]> => {
    if (!walletProvider) throw new Error('No wallet connected');
    if (!address) throw new Error('No wallet address available');
    
    try {
      console.log(`Signing ${txns.length} transactions with Pera Wallet on MainNet...`);
      
      if (walletProvider === 'pera' && peraWallet) {
        // Format transactions for Pera Wallet
        const txnsToSign = txns.map(txn => ({
          txn: txn,
          signers: [address]
        }));

        const signedTxns = await peraWallet.signTransaction([txnsToSign]);
        
        if (!signedTxns || signedTxns.length !== txns.length) {
          throw new Error('Incorrect number of signed transactions returned');
        }
        
        return signedTxns;
      }
      throw new Error('Wallet not available for signing');
    } catch (error: any) {
      console.error('Transaction signing failed:', error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        throw new Error('Transaction cancelled by user');
      } else if (error.message?.includes('Network mismatch')) {
        throw new Error(`Network mismatch! Please ensure your wallet is connected to ${environment.toUpperCase()}`);
      }
      throw error;
    }
  };

  const value = {
    isConnected,
    address,
    balance,
    connectWallet,
    disconnectWallet,
    signTransaction,
    signTransactions,
    walletProvider,
    isLoading,
    networkId,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}