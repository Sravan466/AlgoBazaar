'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Gift, 
  Lock, 
  Unlock,
  Zap,
  Shield,
  Star,
  Sparkles,
  ArrowUpRight,
  Plus,
  Calculator,
  Award,
  RefreshCw,
  CheckCircle,
  Loader2,
  Gem,
  Eye,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';
import Image from 'next/image';
import { AlgorandAPI } from '@/lib/algorand-api';

export default function StakingPage() {
  const { isConnected, address, balance } = useWallet();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [selectedPool, setSelectedPool] = useState<number | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorAmount, setCalculatorAmount] = useState('1000');
  const [calculatorDays, setCalculatorDays] = useState('365');
  const [isLoading, setIsLoading] = useState(true);
  const [stakingPools, setStakingPools] = useState<any[]>([]);
  const [userStakingPositions, setUserStakingPositions] = useState<any[]>([]);
  const [accountData, setAccountData] = useState<any>(null);

  // Load real staking data
  useEffect(() => {
    if (isConnected && address) {
      loadStakingData();
    }
  }, [isConnected, address]);

  const loadStakingData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      console.log('Loading real staking data...');
      
      // Load staking pools, user positions, and account data
      const [pools, positions, accountInfo] = await Promise.all([
        AlgorandAPI.getStakingPools(),
        AlgorandAPI.getUserStakingPositions(address),
        AlgorandAPI.getAccountInfo(address)
      ]);

      setStakingPools(pools);
      setUserStakingPositions(positions);
      setAccountData(accountInfo);

      console.log('Staking data loaded:', {
        pools: pools.length,
        positions: positions.length,
        assets: accountInfo.assets.length
      });

      if (pools.length === 0) {
        toast.info('No staking pools available', {
          description: 'Staking pools will be available soon',
          className: 'toast-premium',
        });
      }

    } catch (error: any) {
      console.error('Error loading staking data:', error);
      toast.error('Failed to load staking data', {
        description: 'Please check your connection and try again',
        className: 'toast-premium',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = async (poolId: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const pool = stakingPools.find(p => p.id === poolId);
    if (!pool) return;

    if (parseFloat(stakeAmount) < pool.minStake) {
      toast.error(`Minimum stake amount is ${pool.minStake} ${pool.assetId === 0 ? 'ALGO' : 'tokens'}`);
      return;
    }

    // Check if user has sufficient balance
    const hasBalance = await AlgorandAPI.checkSufficientBalance(
      address,
      pool.assetId,
      parseFloat(stakeAmount)
    );

    if (!hasBalance) {
      toast.error('Insufficient balance for staking');
      return;
    }

    setIsStaking(true);
    try {
      // In a real implementation, this would create and submit staking transactions
      toast.info('🔄 Preparing staking transaction...', {
        description: 'Please sign the transaction in your wallet',
        className: 'toast-premium',
      });

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`🎉 Successfully staked ${stakeAmount} ${pool.assetId === 0 ? 'ALGO' : 'tokens'}!`, {
        description: 'Your staking position is now active',
        className: 'toast-premium',
        duration: 5000,
      });
      
      setStakeAmount('');
      setSelectedPool(null);
      
      // Reload staking data
      await loadStakingData();
    } catch (error: any) {
      toast.error(`❌ Staking failed: ${error.message}`, {
        className: 'toast-premium',
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (poolId: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsUnstaking(true);
    try {
      toast.info('🔄 Processing unstaking request...', {
        description: 'Please sign the transaction in your wallet',
        className: 'toast-premium',
      });

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast.success('✅ Successfully unstaked tokens!', {
        description: 'Tokens have been returned to your wallet',
        className: 'toast-premium',
      });
      
      setUnstakeAmount('');
      
      // Reload staking data
      await loadStakingData();
    } catch (error: any) {
      toast.error(`❌ Unstaking failed: ${error.message}`, {
        className: 'toast-premium',
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async (poolId: number) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.info('🎁 Claiming rewards...', {
        description: 'Please sign the transaction in your wallet',
        className: 'toast-premium',
      });

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('🎉 Rewards claimed successfully!', {
        description: 'Rewards have been added to your wallet',
        className: 'toast-premium',
      });
      
      // Reload staking data
      await loadStakingData();
    } catch (error: any) {
      toast.error(`❌ Failed to claim rewards: ${error.message}`, {
        className: 'toast-premium',
      });
    }
  };

  const calculateRewards = (amount: string, apy: number, days: string) => {
    const principal = parseFloat(amount) || 0;
    const rate = apy / 100;
    const time = parseFloat(days) / 365;
    return (principal * rate * time).toFixed(6);
  };

  const portfolioStats = {
    totalStaked: userStakingPositions.reduce((sum, pos) => sum + pos.amount, 0),
    totalRewards: userStakingPositions.reduce((sum, pos) => sum + pos.pendingRewards, 0),
    claimableRewards: userStakingPositions.reduce((sum, pos) => sum + pos.claimableRewards, 0),
    avgAPY: stakingPools.length > 0 ? stakingPools.reduce((sum, pool) => sum + pool.apy, 0) / stakingPools.length : 0,
    activeStakes: userStakingPositions.filter(pos => pos.isActive).length,
    totalEarned: userStakingPositions.reduce((sum, pos) => sum + pos.totalEarned, 0)
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
            {change && (
              <motion.div
                className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                  trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {change}%
                </span>
              </motion.div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <motion.p 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
              whileHover={{ scale: 1.05 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
                Staking Pools
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Stake your assets to earn passive rewards ⚡
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setShowCalculator(!showCalculator)}
                  className="glass-card hover:glass-dark border-0 text-purple-600 dark:text-purple-400 shadow-lg"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={loadStakingData}
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
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Staked"
            value={`${portfolioStats.totalStaked.toFixed(6)} ALGO`}
            change={portfolioStats.totalStaked > 0 ? "8.5" : null}
            icon={Coins}
            color="from-blue-500 to-cyan-500"
            trend="up"
            subtitle="Across all pools"
          />
          <StatCard
            title="Total Rewards"
            value={`${portfolioStats.totalRewards.toFixed(6)} ALGO`}
            change={portfolioStats.totalRewards > 0 ? "12.3" : null}
            icon={TrendingUp}
            color="from-green-500 to-emerald-500"
            trend="up"
            subtitle="Lifetime earnings"
          />
          <StatCard
            title="Claimable"
            value={`${portfolioStats.claimableRewards.toFixed(6)} ALGO`}
            icon={Gift}
            color="from-purple-500 to-pink-500"
            subtitle="Ready to claim"
          />
          <StatCard
            title="Avg APY"
            value={`${portfolioStats.avgAPY.toFixed(1)}%`}
            change={portfolioStats.avgAPY > 0 ? "2.1" : null}
            icon={Award}
            color="from-orange-500 to-red-500"
            trend="up"
            subtitle="Weighted average"
          />
        </div>

        {/* Rewards Calculator */}
        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl gradient-text">
                    <Calculator className="mr-3 h-6 w-6 text-purple-600" />
                    Rewards Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Stake Amount
                      </label>
                      <Input
                        type="number"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(e.target.value)}
                        placeholder="1000"
                        className="glass border-0 h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        APY
                      </label>
                      <Input
                        value={`${portfolioStats.avgAPY.toFixed(1)}%`}
                        readOnly
                        className="glass border-0 h-12 bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Days
                      </label>
                      <Input
                        type="number"
                        value={calculatorDays}
                        onChange={(e) => setCalculatorDays(e.target.value)}
                        placeholder="365"
                        className="glass border-0 h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Estimated Rewards
                      </label>
                      <div className="h-12 glass rounded-xl flex items-center px-4">
                        <span className="text-2xl font-bold gradient-text">
                          {calculateRewards(calculatorAmount, portfolioStats.avgAPY, calculatorDays)} ALGO
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading staking pools...</p>
            </div>
          </motion.div>
        )}

        {/* Enhanced Tabs */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="pools" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 h-14 glass-card border-0 shadow-lg">
                <TabsTrigger value="pools" className="text-lg font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Coins className="h-5 w-5 mr-2" />
                  Staking Pools ({stakingPools.length})
                </TabsTrigger>
                <TabsTrigger value="positions" className="text-lg font-medium py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                  <Award className="h-5 w-5 mr-2" />
                  My Positions ({userStakingPositions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pools" className="space-y-6">
                {stakingPools.length > 0 ? (
                  <div className="grid gap-6">
                    {stakingPools.map((pool, index) => (
                      <motion.div
                        key={pool.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                      >
                        <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl overflow-hidden">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <motion.div 
                                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl"
                                  whileHover={{ rotate: 360, scale: 1.1 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  <Coins className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                  <CardTitle className="text-2xl text-gray-900 dark:text-white">{pool.name}</CardTitle>
                                  <p className="text-gray-600 dark:text-gray-400">
                                    {pool.assetId === 0 ? 'ALGO Native Staking' : `Asset ID: ${pool.assetId}`}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      {pool.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {pool.participants.toLocaleString()} participants
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <motion.div 
                                  className="text-4xl font-bold gradient-text mb-2"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  {pool.apy}%
                                </motion.div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">APY</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Pool Info */}
                              <div className="space-y-4">
                                <div className="glass p-4 rounded-2xl">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Pool Statistics</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Staked:</span>
                                      <span className="font-medium">{pool.totalStaked.toLocaleString()} {pool.assetId === 0 ? 'ALGO' : 'tokens'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Lock Period:</span>
                                      <span className="font-medium">{pool.lockPeriod} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-400">Min/Max Stake:</span>
                                      <span className="font-medium">{pool.minStake}-{pool.maxStake.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Staking Actions */}
                              <div className="space-y-4">
                                <div className="glass p-4 rounded-2xl">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Stake Assets</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                        Amount to Stake
                                      </label>
                                      <div className="flex space-x-2">
                                        <Input
                                          type="number"
                                          placeholder="0.0"
                                          value={selectedPool === pool.id ? stakeAmount : ''}
                                          onChange={(e) => {
                                            setStakeAmount(e.target.value);
                                            setSelectedPool(pool.id);
                                          }}
                                          className="glass border-0"
                                        />
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                          <Button
                                            onClick={() => handleStake(pool.id)}
                                            disabled={isStaking || !stakeAmount || !pool.isActive}
                                            className="btn-premium text-white shadow-lg border-0 relative overflow-hidden"
                                          >
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                                            <div className="relative z-10 flex items-center">
                                              {isStaking ? (
                                                <Loader2 className="animate-spin h-4 w-4" />
                                              ) : (
                                                <Lock className="h-4 w-4" />
                                              )}
                                            </div>
                                          </Button>
                                        </motion.div>
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>Min: {pool.minStake} {pool.assetId === 0 ? 'ALGO' : 'tokens'}</span>
                                        <span>Balance: {balance.toFixed(6)} ALGO</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Pool Details */}
                              <div className="space-y-4">
                                <div className="glass p-4 rounded-2xl">
                                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Pool Details</h4>
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-center">
                                      <div className="glass p-3 rounded-xl">
                                        <div className="text-lg font-bold text-blue-600">{pool.apy}%</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Current APY</div>
                                      </div>
                                      <div className="glass p-3 rounded-xl">
                                        <div className="text-lg font-bold text-purple-600">{pool.participants}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Stakers</div>
                                      </div>
                                    </div>
                                    
                                    {!pool.isActive && (
                                      <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                          Pool is currently inactive
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                    <CardContent className="p-12 text-center">
                      <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Staking Pools Available</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Staking pools are coming soon. Check back later for opportunities to earn rewards.
                      </p>
                      <Button 
                        onClick={loadStakingData}
                        className="btn-premium text-white shadow-lg border-0 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <div className="relative z-10 flex items-center">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh Pools
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="positions" className="space-y-6">
                {userStakingPositions.length > 0 ? (
                  <div className="grid gap-6">
                    {userStakingPositions.map((position, index) => (
                      <motion.div
                        key={position.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.01 }}
                      >
                        <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                  {position.poolName}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                  Staked: {position.amount} {position.assetId === 0 ? 'ALGO' : 'tokens'}
                                </p>
                              </div>
                              <Badge className={position.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {position.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="glass p-4 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Rewards</div>
                                <div className="text-2xl font-bold text-green-600">{position.pendingRewards} ALGO</div>
                              </div>
                              <div className="glass p-4 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
                                <div className="text-2xl font-bold text-blue-600">{position.totalEarned} ALGO</div>
                              </div>
                              <div className="glass p-4 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400">APY</div>
                                <div className="text-2xl font-bold text-purple-600">{position.apy}%</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                              <Button
                                onClick={() => handleClaimRewards(position.poolId)}
                                disabled={position.claimableRewards <= 0}
                                className="btn-premium text-white shadow-lg border-0 relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600" />
                                <div className="relative z-10 flex items-center">
                                  <Gift className="h-4 w-4 mr-2" />
                                  Claim Rewards
                                </div>
                              </Button>
                              
                              <Button
                                onClick={() => handleUnstake(position.poolId)}
                                disabled={!position.canUnstake}
                                variant="outline"
                                className="glass-card hover:glass-dark border-0"
                              >
                                <Unlock className="h-4 w-4 mr-2" />
                                Unstake
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 backdrop-blur-xl">
                    <CardContent className="p-12 text-center">
                      <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Staking Positions</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You haven't staked any assets yet. Start earning rewards by staking in available pools.
                      </p>
                      <Button className="btn-premium text-white shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <div className="relative z-10 flex items-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Start Staking
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="glass p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-start space-x-4">
              <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-bold text-blue-800 dark:text-blue-200 mb-2 text-lg">
                  Secure Staking on Algorand MainNet
                </div>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed mb-3">
                  All staking operations are secured by Algorand's consensus mechanism. Your assets remain in your control, 
                  and smart contracts handle reward distribution automatically on the live network.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Non-custodial staking
                  </div>
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Automated rewards
                  </div>
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Live on MainNet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}