'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Coins, Gem, TrendingUp, Users, Zap, Shield, Sparkles, Rocket, Star, Eye, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import NFTModal from '@/components/ui/nft-modal';
import { useWallet } from '@/lib/wallet-context';
import { MarketplaceService } from '@/lib/marketplace';

export default function Home() {
  const { isConnected, address, signTransaction, signTransactions } = useWallet();
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchasingNFT, setPurchasingNFT] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const featuredNFTs = [
    {
      id: 1,
      name: "Cosmic Warrior #001",
      price: "150",
      image: "https://images.pexels.com/photos/1831234/pexels-photo-1831234.jpeg?auto=compress&cs=tinysrgb&w=400",
      creator: "ArtistAlgo",
      seller: "SELLER123ALGORANDADDRESS456EXAMPLE789ABCDEF",
      rarity: "Legendary",
      likes: 234,
      collection: "Cosmic Warriors",
      description: "A legendary cosmic warrior from the depths of space, wielding the power of the stars.",
      assetId: 123456789,
      royaltyRecipient: "ARTIST123ALGORANDADDRESS456EXAMPLE789ABCDEF",
      royaltyPercentage: 5
    },
    {
      id: 2,
      name: "Digital Dreams",
      price: "85",
      image: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=400",
      creator: "CryptoCreator",
      seller: "SELLER456ALGORANDADDRESS789EXAMPLE123GHIJKL",
      rarity: "Rare",
      likes: 156,
      collection: "Dream Series",
      description: "An ethereal journey through the digital realm where dreams become reality.",
      assetId: 987654321,
      royaltyRecipient: "CREATOR456ALGORANDADDRESS789EXAMPLE123GHIJKL",
      royaltyPercentage: 7.5
    },
    {
      id: 3,
      name: "Neon Genesis",
      price: "220",
      image: "https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=400",
      creator: "FutureArt",
      seller: "SELLER789ALGORANDADDRESS123EXAMPLE456MNOPQR",
      rarity: "Epic",
      likes: 389,
      collection: "Neon Collection",
      description: "A vibrant exploration of neon aesthetics in the digital age.",
      assetId: 456789123,
      royaltyRecipient: "FUTURE789ALGORANDADDRESS123EXAMPLE456MNOPQR",
      royaltyPercentage: 10
    }
  ];

  const handleViewNFT = (nft: any) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  // Real NFT purchase implementation for homepage
  const handleBuyNFT = useCallback(async (nft: any) => {
    if (!isClient || !isConnected || !address) {
      toast.error('Please connect your wallet first', {
        className: 'toast-premium',
      });
      return;
    }

    setPurchasingNFT(nft.id);

    try {
      // Check prerequisites
      const prerequisites = await MarketplaceService.checkPurchasePrerequisites(
        address,
        nft.assetId,
        parseFloat(nft.price)
      );

      if (!prerequisites.canPurchase) {
        // Handle opt-in requirement
        for (const issue of prerequisites.issues) {
          if (issue.includes('opt-in')) {
            const shouldOptIn = confirm(
              `You need to opt-in to this asset before purchasing.\n\n` +
              `This will cost 0.001 ALGO for the opt-in transaction.\n\n` +
              `Would you like to opt-in now?`
            );

            if (shouldOptIn) {
              toast.info('🔗 Processing asset opt-in...', {
                className: 'toast-premium',
              });

              const optInResult = await MarketplaceService.optInToAsset(
                address,
                nft.assetId,
                signTransaction
              );

              if (optInResult.success) {
                toast.success('✅ Successfully opted into asset!', {
                  description: `Transaction: ${optInResult.transactionId}`,
                  className: 'toast-premium',
                });
                
                // Retry purchase after opt-in
                setTimeout(() => handleBuyNFT(nft), 2000);
                return;
              } else {
                throw new Error(optInResult.error || 'Opt-in failed');
              }
            } else {
              toast.info('Purchase cancelled - opt-in required');
              return;
            }
          } else {
            toast.error(issue, {
              className: 'toast-premium',
            });
            return;
          }
        }
      }

      // Show purchase confirmation
      const totalCost = parseFloat(nft.price);
      const platformFee = totalCost * 0.025;
      const royaltyFee = totalCost * (nft.royaltyPercentage / 100);
      const networkFees = 0.004;

      const confirmed = confirm(
        `🛒 Confirm NFT Purchase\n\n` +
        `NFT: ${nft.name}\n` +
        `Price: ${nft.price} ALGO\n` +
        `Platform Fee: ${platformFee.toFixed(3)} ALGO\n` +
        `Creator Royalty: ${royaltyFee.toFixed(3)} ALGO\n` +
        `Network Fees: ${networkFees} ALGO\n` +
        `Total Cost: ${(totalCost + platformFee + royaltyFee + networkFees).toFixed(3)} ALGO\n\n` +
        `Your Balance: ${prerequisites.balance.toFixed(3)} ALGO\n\n` +
        `Proceed with purchase?`
      );

      if (!confirmed) {
        toast.info('Purchase cancelled by user');
        return;
      }

      // Execute purchase
      toast.info('💳 Processing purchase...', {
        description: 'Please sign the transaction in your wallet',
        className: 'toast-premium',
      });

      const purchaseParams = {
        nftId: nft.id,
        assetId: nft.assetId,
        price: parseFloat(nft.price),
        seller: nft.seller,
        buyer: address,
        royaltyRecipient: nft.royaltyRecipient,
        royaltyPercentage: nft.royaltyPercentage
      };

      const result = await MarketplaceService.purchaseNFT(
        purchaseParams,
        signTransactions
      );

      if (result.success) {
        toast.success('🎉 NFT Purchase Successful!', {
          description: `Transaction: ${result.transactionId}`,
          duration: 10000,
          className: 'toast-premium',
        });

        setTimeout(() => {
          toast.success('🏆 NFT Added to Your Collection!', {
            description: `${nft.name} is now in your wallet`,
            className: 'toast-premium',
          });
        }, 2000);

      } else {
        throw new Error(result.error || 'Purchase failed');
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let errorMessage = 'Purchase failed';
      if (error.message?.includes('Insufficient balance')) {
        errorMessage = 'Insufficient ALGO balance';
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message?.includes('Network mismatch')) {
        errorMessage = 'Please ensure your wallet is connected to MainNet';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`❌ ${errorMessage}`, {
        className: 'toast-premium',
      });
    } finally {
      setPurchasingNFT(null);
    }
  }, [isClient, isConnected, address, signTransaction, signTransactions]);

  const stats = [
    { label: "Total Volume", value: "24.8M ALGO", icon: Coins, color: "from-blue-500 to-cyan-500", bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20" },
    { label: "NFTs Minted", value: "158,470", icon: Gem, color: "from-purple-500 to-pink-500", bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20" },
    { label: "Active Users", value: "89,320", icon: Users, color: "from-green-500 to-emerald-500", bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" },
    { label: "Staking Rewards", value: "12.5%", icon: TrendingUp, color: "from-orange-500 to-red-500", bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20" }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built on Algorand MainNet with 4.5 second finality and near-zero fees for all transactions.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
    },
    {
      icon: Shield,
      title: "Secure & Trustless",
      description: "Smart contracts handle all transactions with automatic royalty distribution and escrow on MainNet.",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
    },
    {
      icon: TrendingUp,
      title: "Earn Real Rewards",
      description: "Stake your NFTs and ASAs to earn passive rewards up to 12.5% APY on the live network.",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section with Premium Typography */}
      <section className="relative py-24 sm:py-36 mb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute top-20 left-10 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 60, 0],
              y: [0, -40, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4],
              x: [0, -40, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-cyan-400/8 to-blue-400/8 rounded-full blur-3xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Floating Crypto Elements */}
          <motion.div
            className="absolute top-32 right-1/4 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-20"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-25"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute top-1/3 left-1/6 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm opacity-30"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto text-center"
          >
            {/* Enhanced Logo with Brand Tagline */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-2xl mr-5 overflow-hidden group"
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 animate-glow" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Gem className="h-10 w-10 sm:h-12 sm:w-12 text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200" />
                </motion.div>
                <div className="flex flex-col items-start">
                  <motion.h1 
                    className="text-6xl sm:text-8xl md:text-9xl font-black gradient-text tracking-tight leading-none"
                    style={{ letterSpacing: '-0.02em' }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    AlgoBazaar
                  </motion.h1>
                  <motion.div
                    className="mt-2 ml-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <span className="text-lg sm:text-xl font-medium text-gray-600 dark:text-gray-400 tracking-wide">
                      Trade. Earn. Stake. ⚡
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Typography Hierarchy */}
            <motion.div
              variants={itemVariants}
              className="mb-12 space-y-6"
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 leading-tight tracking-tight max-w-6xl mx-auto">
                The premier decentralized marketplace for NFTs and ASAs on{' '}
                <span className="gradient-text font-black">Algorand MainNet</span>
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-5xl mx-auto font-light tracking-wide">
                Create, trade, and stake with{' '}
                <span className="font-semibold gradient-text">zero gas fees</span>{' '}
                on the live network
              </p>
            </motion.div>

            {/* Enhanced CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Link href="/marketplace">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -8 }} 
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Button size="lg" className="btn-premium text-white px-12 py-5 text-xl font-semibold shadow-2xl border-0 relative overflow-hidden tracking-wide">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                    <div className="relative z-10 flex items-center">
                      <Rocket className="mr-3 h-6 w-6" />
                      Explore Marketplace
                      <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/mint">
                <motion.div 
                  whileHover={{ scale: 1.05, y: -8 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="glass-card hover:glass-dark border-2 border-purple-500/50 text-purple-600 dark:text-purple-400 px-12 py-5 text-xl font-semibold transition-all duration-300 group tracking-wide">
                    <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Create NFT
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Enhanced Trust Indicators with Crypto Animation */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-12 text-gray-500 dark:text-gray-400"
            >
              {[
                { icon: Star, text: "Zero Gas Fees", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
                { icon: Zap, text: "4.5s Finality", color: "text-blue-500", bgColor: "bg-blue-500/10" },
                { icon: Shield, text: "MainNet Secure", color: "text-green-500", bgColor: "bg-green-500/10" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center group cursor-pointer"
                  whileHover={{ scale: 1.15, y: -4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className={`p-3 rounded-2xl ${item.bgColor} mr-3 group-hover:shadow-lg transition-all duration-300`}>
                    <item.icon className={`h-6 w-6 ${item.color} group-hover:animate-pulse`} />
                  </div>
                  <span className="font-semibold text-lg group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 tracking-wide">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating NFT Gem Animation - LEFT SIDE */}
            <motion.div
              className="absolute top-20 left-20 hidden lg:block"
              animate={{
                y: [-15, 25, -15],
                rotate: [-5, 5, -5],
                scale: [1, 1.15, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl opacity-20 relative overflow-hidden">
                <Gem className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer" />
              </div>
            </motion.div>

            {/* Floating Algorand Logo Animation - RIGHT SIDE */}
            <motion.div
              className="absolute top-20 right-20 hidden lg:block"
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl opacity-20">
                <Coins className="h-8 w-8 text-white" />
              </div>
            </motion.div>

            {/* Flowing Gradient Lines */}
            <motion.div
              className="absolute bottom-10 left-10 hidden lg:block"
              animate={{
                x: [-30, 30, -30],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-32 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full blur-sm" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="mb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group"
              >
                <Card className={`stats-card glass-card border-0 shadow-xl bg-gradient-to-br ${stat.bgColor} overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="pt-8 pb-6 px-6 text-center relative z-10">
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.div 
                      className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 font-medium tracking-wide">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Featured NFTs */}
      <section className="mb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl font-bold gradient-text tracking-tight"
              >
                🔥 Trending NFTs
              </motion.h2>
              <Link href="/marketplace">
                <motion.div 
                  whileHover={{ scale: 1.05, x: 8 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="glass-card hover:glass-dark border-0 text-blue-600 dark:text-blue-400 text-lg group font-semibold tracking-wide">
                    View All 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </Button>
                </motion.div>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  variants={itemVariants}
                  whileHover={{ y: -15, scale: 1.02 }}
                  className="group"
                >
                  <Card className="nft-card glass-card border-0 shadow-xl overflow-hidden">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Enhanced Rarity Badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="absolute top-4 right-4"
                      >
                        <Badge className="badge-premium border-0 text-white shadow-lg font-semibold tracking-wide">
                          {nft.rarity}
                        </Badge>
                      </motion.div>
                      
                      {/* Enhanced Hover Actions */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewNFT(nft)}
                            className="flex-1 glass text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 backdrop-blur-sm tracking-wide"
                          >
                            <Eye className="h-4 w-4 mr-2 inline" />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleBuyNFT(nft)}
                            disabled={purchasingNFT === nft.id}
                            className="flex-1 btn-premium text-white px-4 py-2 rounded-xl font-medium shadow-lg border-0 relative overflow-hidden tracking-wide disabled:opacity-50"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                            <div className="relative z-10 flex items-center justify-center">
                              {purchasingNFT === nft.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Buy
                                </>
                              )}
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white truncate tracking-tight">{nft.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 tracking-wide">by {nft.creator}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold gradient-text tracking-tight">
                          {nft.price} ALGO
                        </div>
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewNFT(nft)}
                              className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              size="sm" 
                              onClick={() => handleBuyNFT(nft)}
                              disabled={purchasingNFT === nft.id}
                              className="btn-premium text-white shadow-lg border-0 relative overflow-hidden font-semibold tracking-wide disabled:opacity-50"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                              <span className="relative z-10 flex items-center">
                                {purchasingNFT === nft.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Buy Now'
                                )}
                              </span>
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="mb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold text-center mb-6 gradient-text tracking-tight"
            >
              Why Choose AlgoBazaar? ✨
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl text-center text-gray-600 dark:text-gray-300 mb-16 font-light tracking-wide max-w-4xl mx-auto"
            >
              Experience the future of NFT trading on Algorand's network
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group"
                >
                  <Card className={`card-premium glass-card border-0 shadow-xl bg-gradient-to-br ${feature.bgColor} h-full overflow-hidden relative`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="pb-4 relative z-10">
                      <motion.div
                        className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                      >
                        <feature.icon className="h-10 w-10 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white text-center font-bold tracking-tight">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg text-center tracking-wide">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute top-10 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              variants={itemVariants}
              className="glass-card p-16 text-center shadow-2xl border-0 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/8 via-purple-600/8 to-cyan-600/8" />
              <div className="relative z-10">
                <motion.h2
                  className="text-5xl sm:text-6xl font-bold mb-8 gradient-text tracking-tight"
                  whileHover={{ scale: 1.02 }}
                >
                  Ready to Start Trading? 🚀
                </motion.h2>
                <motion.p
                  className="text-2xl sm:text-3xl mb-12 text-gray-600 dark:text-gray-300 leading-relaxed font-light tracking-wide"
                  variants={itemVariants}
                >
                  Join thousands of creators and collectors on the premier Algorand marketplace.
                </motion.p>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-8 justify-center"
                >
                  <Link href="/mint">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -8 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="glass-card hover:glass-dark border-2 border-blue-500/50 text-blue-600 dark:text-blue-400 px-12 py-5 text-xl font-semibold transition-all duration-300 group tracking-wide">
                        <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        Start Creating
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/marketplace">
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -8 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button size="lg" className="btn-premium text-white px-12 py-5 text-xl font-semibold shadow-2xl border-0 relative overflow-hidden group tracking-wide">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600" />
                        <div className="relative z-10 flex items-center">
                          <Gem className="mr-3 h-6 w-6" />
                          Browse Collections
                          <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* NFT Modal */}
      <NFTModal 
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}