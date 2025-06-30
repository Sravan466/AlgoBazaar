'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  Gem, 
  Eye, 
  ShoppingCart,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  PieChart,
  Copy,
  ExternalLink,
  Settings,
  Shield,
  Plus,
  Loader2
} from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';
import Image from 'next/image';
import NFTModal from '@/components/ui/nft-modal';
import { AlgorandAPI } from '@/lib/algorand-api';

export default function Dashboard() {
  const { isConnected, address, balance } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [accountData, setAccountData] = useState<any>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [portfolioValue, setPortfolioValue] = useState(0);

  // Load real dashboard data
  useEffect(() => {
    if (isConnected && address) {
      loadDashboardData();
    }
  }, [isConnected, address]);

  const loadDashboardData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      console.log('Loading real dashboard data...');
      
      // Load account info, NFTs, transactions, and portfolio value in parallel
      const [accountInfo, userNFTs, txHistory, portfolioVal] = await Promise.all([
        AlgorandAPI.getAccountInfo(address),
        AlgorandAPI.getAccountNFTs(address),
        AlgorandAPI.getTransactionHistory(address, 20),
        AlgorandAPI.calculatePortfolioValue(address)
      ]);

      setAccountData(accountInfo);
      setNfts(userNFTs);
      setTransactions(txHistory);
      setPortfolioValue(portfolioVal);

      console.log('Dashboard data loaded:', {
        assets: accountInfo.assets.length,
        nfts: userNFTs.length,
        transactions: txHistory.length,
        portfolioValue: portfolioVal
      });

      if (userNFTs.length === 0) {
        toast.info('No NFTs found in your wallet', {
          description: 'Visit the marketplace to discover and purchase NFTs',
          className: 'toast-premium',
        });
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data', {
        description: 'Please check your connection and try again',
        className: 'toast-premium',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isConnected && address) {
      loadDashboardData();
      toast.success('Dashboard refreshed!', {
        className: 'toast-premium',
      });
    }
  };

  const handleViewNFT = (nft: any) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied! 📋', {
        className: 'toast-premium',
      });
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, trend, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
            {change !== undefined && (
              <motion.div
                className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(change).toFixed(1)}%
                </span>
              </motion.div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <motion.p 
              className="text-2xl font-bold text-gray-900 dark:text-white"
              whileHover={{ scale: 1.05 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md mx-auto text-center glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-900/90 dark:to-blue-900/20 backdrop-blur-xl">
            <CardContent className="p-8">
              <motion.div
                className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Wallet className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-4 gradient-text">Connect Your Wallet</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                Please connect your wallet to view your dashboard and portfolio.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="btn-premium text-white px-8 py-4 text-lg shadow-2xl border-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                  <div className="relative z-10 flex items-center">
                    <Wallet className="mr-3 h-5 w-5" />
                    Connect Wallet
                  </div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Welcome back! Here's your live portfolio overview.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="glass-card hover:glass-dark border-0 text-blue-600 dark:text-blue-400 shadow-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={copyAddress}
                  className="glass-card hover:glass-dark border-0 text-gray-600 dark:text-gray-300 shadow-lg"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Portfolio Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toFixed(2)}`}
            change={portfolioValue > 0 ? 5.2 : 0}
            icon={TrendingUp}
            color="from-blue-500 to-cyan-500"
            trend="up"
            subtitle="Live market value"
          />
          <StatCard
            title="ALGO Balance"
            value={`${balance.toFixed(6)}`}
            icon={Coins}
            color="from-green-500 to-emerald-500"
            subtitle="Available balance"
          />
          <StatCard
            title="NFTs Owned"
            value={nfts.length}
            icon={Gem}
            color="from-purple-500 to-pink-500"
            subtitle="Unique assets"
          />
          <StatCard
            title="Total Assets"
            value={accountData?.assets.length || 0}
            icon={Award}
            color="from-orange-500 to-red-500"
            subtitle="Including tokens"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading your portfolio data...</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Main Content Tabs */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-14 glass-card border-0 shadow-lg">
                <TabsTrigger value="overview" className="text-sm font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <PieChart className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="nfts" className="text-sm font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Gem className="h-4 w-4 mr-2" />
                  NFTs ({nfts.length})
                </TabsTrigger>
                <TabsTrigger value="tokens" className="text-sm font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Coins className="h-4 w-4 mr-2" />
                  Assets ({accountData?.assets.length || 0})
                </TabsTrigger>
                <TabsTrigger value="activity" className="text-sm font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Activity className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <PieChart className="mr-3 h-5 w-5 text-blue-600" />
                          Asset Allocation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {accountData?.assets.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">ALGO</span>
                              <span className="font-bold text-blue-600">
                                {((balance / (portfolioValue / AlgorandAPI.getAssetPrice(0))) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(balance / (portfolioValue / AlgorandAPI.getAssetPrice(0))) * 100}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            
                            {accountData.assets.slice(0, 3).map((asset: any, index: number) => (
                              <div key={asset.assetId}>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium">
                                    {asset.assetInfo?.unitName || `Asset ${asset.assetId}`}
                                  </span>
                                  <span className="font-bold text-purple-600">
                                    {((AlgorandAPI.formatAssetAmount(asset.amount, asset.assetInfo?.decimals || 0) * AlgorandAPI.getAssetPrice(asset.assetId)) / portfolioValue * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(AlgorandAPI.formatAssetAmount(asset.amount, asset.assetInfo?.decimals || 0) * AlgorandAPI.getAssetPrice(asset.assetId)) / portfolioValue * 100}%` }}
                                    transition={{ duration: 1, delay: 0.7 + index * 0.2 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">No assets found</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">Add assets to see allocation</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                          <Settings className="mr-3 h-5 w-5 text-purple-600" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full btn-premium text-white shadow-lg border-0 relative overflow-hidden h-12">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                            <div className="relative z-10 flex items-center">
                              <Plus className="mr-2 h-4 w-4" />
                              Create New NFT
                            </div>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full glass-card hover:glass-dark border-0 text-green-600 dark:text-green-400 shadow-lg h-12">
                            <Award className="mr-2 h-4 w-4" />
                            Stake Assets
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full glass-card hover:glass-dark border-0 text-orange-600 dark:text-orange-400 shadow-lg h-12">
                            <Shield className="mr-2 h-4 w-4" />
                            View Analytics
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="nfts">
                {nfts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {nfts.map((nft, index) => (
                        <motion.div
                          key={nft.assetId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -12, scale: 1.02 }}
                          className="group"
                        >
                          <Card className="nft-card glass-card border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                            <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                              {nft.url ? (
                                <Image
                                  src={nft.url}
                                  alt={nft.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                                  onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gem className="h-16 w-16 text-gray-400" />
                                </div>
                              )}
                              
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                                className="absolute top-3 right-3"
                              >
                                <Badge className="badge-premium bg-gradient-to-r from-blue-500 to-purple-500 border-0 text-white shadow-lg">
                                  <Star className="h-3 w-3 mr-1" />
                                  NFT
                                </Badge>
                              </motion.div>

                              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleViewNFT(nft)}
                                    className="flex-1 glass text-white px-3 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                                  >
                                    <Eye className="h-4 w-4 mr-1 inline" />
                                    View
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                            
                            <CardContent className="p-6">
                              <div className="mb-3">
                                <h3 className="font-bold text-xl truncate text-gray-900 dark:text-white">{nft.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400">Asset ID: {nft.assetId}</p>
                              </div>
                              
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {nft.creator.slice(0, 8)}...
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{nft.amount}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleViewNFT(nft)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </motion.div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                    <CardContent className="p-12 text-center">
                      <Gem className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No NFTs Found</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You don't have any NFTs in your wallet yet.
                      </p>
                      <Button className="btn-premium text-white shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <div className="relative z-10 flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Explore Marketplace
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tokens">
                <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Asset Holdings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {accountData?.assets.length > 0 ? (
                      <div className="space-y-4">
                        {/* ALGO Balance */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.02, x: 8 }}
                          className="flex items-center justify-between p-4 glass rounded-2xl hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              <span className="text-white font-bold text-lg">A</span>
                            </motion.div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white">ALGO</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {balance.toFixed(6)} ALGO
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Native Currency
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900 dark:text-white">
                              ${(balance * AlgorandAPI.getAssetPrice(0)).toFixed(2)}
                            </p>
                            <div className="flex items-center">
                              <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                              <p className="text-sm font-medium text-green-600">Live Price</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Other Assets */}
                        {accountData.assets.map((asset: any, index: number) => (
                          <motion.div
                            key={asset.assetId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            className="flex items-center justify-between p-4 glass rounded-2xl hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <motion.div 
                                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <span className="text-white font-bold text-lg">
                                  {asset.assetInfo?.unitName?.[0] || 'A'}
                                </span>
                              </motion.div>
                              <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                  {asset.assetInfo?.unitName || `Asset ${asset.assetId}`}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {AlgorandAPI.formatAssetAmount(asset.amount, asset.assetInfo?.decimals || 0).toLocaleString()} {asset.assetInfo?.unitName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Asset ID: {asset.assetId}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                ${(AlgorandAPI.formatAssetAmount(asset.amount, asset.assetInfo?.decimals || 0) * AlgorandAPI.getAssetPrice(asset.assetId)).toFixed(2)}
                              </p>
                              <div className="flex items-center">
                                <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                                <p className="text-sm font-medium text-blue-600">
                                  ${AlgorandAPI.getAssetPrice(asset.assetId).toFixed(4)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Assets Found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          You only have ALGO in your wallet. Explore the marketplace to discover more assets.
                        </p>
                        <Button className="btn-premium text-white shadow-lg border-0 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                          <div className="relative z-10 flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Discover Assets
                          </div>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 10).map((tx, index) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, x: 8 }}
                            className="flex items-center justify-between p-4 border-l-4 border-blue-500 glass rounded-r-2xl hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center space-x-4">
                              <motion.div 
                                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <Activity className="h-5 w-5 text-white" />
                              </motion.div>
                              <div>
                                <p className="font-bold capitalize text-gray-900 dark:text-white">
                                  {tx.type.replace('-', ' ')}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {tx.assetId > 0 ? `Asset ${tx.assetId}` : 'ALGO'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {tx.id.slice(0, 8)}...{tx.id.slice(-8)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Round {tx.confirmedRound}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Fee: {(tx.fee / 1000000).toFixed(6)} ALGO
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="ml-2 p-1 glass rounded-lg hover:shadow-lg transition-all duration-300"
                                onClick={() => window.open(`https://algoexplorer.io/tx/${tx.id}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your transaction history will appear here once you start using the platform.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* NFT Modal */}
        <NFTModal 
          nft={selectedNFT}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}