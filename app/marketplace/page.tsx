'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Grid, List, Heart, TrendingUp, Sparkles, Eye, ShoppingCart, Star, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import NFTModal from '@/components/ui/nft-modal';
import { MarketplaceService } from '@/lib/marketplace';

export default function Marketplace() {
  const { isConnected, address, signTransaction, signTransactions } = useWallet();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [likedNFTs, setLikedNFTs] = useState<Set<number>>(new Set());
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchasingNFT, setPurchasingNFT] = useState<number | null>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const nfts = [
    {
      id: 1,
      name: "Cosmic Warrior #001",
      price: "150",
      image: "https://images.pexels.com/photos/1831234/pexels-photo-1831234.jpeg?auto=compress&cs=tinysrgb&w=400",
      creator: "ArtistAlgo",
      seller: "SELLER123ALGORANDADDRESS456EXAMPLE789ABCDEF", // Mock seller address
      collection: "Cosmic Warriors",
      rarity: "Legendary",
      likes: 234,
      category: "Art",
      description: "A legendary cosmic warrior from the depths of space, wielding the power of the stars.",
      assetId: 123456789, // Mock asset ID
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
      collection: "Dream Series",
      rarity: "Rare",
      likes: 156,
      category: "Art",
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
      collection: "Neon Collection",
      rarity: "Epic",
      likes: 389,
      category: "Art",
      description: "A vibrant exploration of neon aesthetics in the digital age.",
      assetId: 456789123,
      royaltyRecipient: "FUTURE789ALGORANDADDRESS123EXAMPLE456MNOPQR",
      royaltyPercentage: 10
    }
  ];

  const categories = ["all", "Art", "Gaming", "Music", "Photography", "Sports", "Collectibles"];
  const rarityColors = {
    Common: "from-gray-500 to-gray-600",
    Rare: "from-blue-500 to-blue-600",
    Epic: "from-purple-500 to-purple-600",
    Legendary: "from-orange-500 to-red-500"
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || nft.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (nftId: number) => {
    const newLikedNFTs = new Set(likedNFTs);
    if (newLikedNFTs.has(nftId)) {
      newLikedNFTs.delete(nftId);
      toast.success('Removed from favorites', {
        className: 'toast-premium',
      });
    } else {
      newLikedNFTs.add(nftId);
      toast.success('Added to favorites', {
        className: 'toast-premium',
      });
    }
    setLikedNFTs(newLikedNFTs);
  };

  const handleViewNFT = (nft: any) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  // Real NFT purchase implementation
  const handleBuyNFT = async (nft: any) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first', {
        className: 'toast-premium',
      });
      return;
    }

    setPurchasingNFT(nft.id);

    try {
      // 1. Check prerequisites
      toast.info('🔍 Checking purchase requirements...', {
        className: 'toast-premium',
      });

      const prerequisites = await MarketplaceService.checkPurchasePrerequisites(
        address,
        nft.assetId,
        parseFloat(nft.price)
      );

      if (!prerequisites.canPurchase) {
        // Handle specific issues
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

      // 2. Show purchase confirmation
      const totalCost = parseFloat(nft.price);
      const platformFee = totalCost * 0.025; // 2.5%
      const royaltyFee = totalCost * (nft.royaltyPercentage / 100);
      const networkFees = 0.004; // Estimated network fees

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

      // 3. Execute purchase
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

        // Show detailed success info
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
  };

  const NFTSkeleton = () => (
    <Card className="glass-card border-0 shadow-xl overflow-hidden">
      <Skeleton className="aspect-square" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-6xl font-bold gradient-text mb-4">
            NFT Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg sm:text-xl">
            Discover, collect, and trade unique NFTs on Algorand ✨
          </p>
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col gap-6 mb-8"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors duration-300" />
            <Input
              placeholder="Search NFTs, creators, or collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-12 h-14 text-lg glass-card border-0 shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="glass-card border-0 h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="glass-card border-0 shadow-2xl">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="hover:bg-white/10 transition-colors duration-200">
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="glass-card border-0 h-12 shadow-lg hover:shadow-xl transition-all duration-300">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="glass-card border-0 shadow-2xl">
                <SelectItem value="newest" className="hover:bg-white/10 transition-colors duration-200">Newest</SelectItem>
                <SelectItem value="oldest" className="hover:bg-white/10 transition-colors duration-200">Oldest</SelectItem>
                <SelectItem value="price-high" className="hover:bg-white/10 transition-colors duration-200">Price: High to Low</SelectItem>
                <SelectItem value="price-low" className="hover:bg-white/10 transition-colors duration-200">Price: Low to High</SelectItem>
                <SelectItem value="popular" className="hover:bg-white/10 transition-colors duration-200">Most Popular</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex glass-card border-0 rounded-xl overflow-hidden shadow-lg">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('grid')}
                className={`p-3 flex-1 sm:flex-none transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
                }`}
              >
                <Grid className="h-5 w-5 mx-auto" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('list')}
                className={`p-3 flex-1 sm:flex-none transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/10'
                }`}
              >
                <List className="h-5 w-5 mx-auto" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Showing <span className="font-bold text-blue-600">{filteredNFTs.length}</span> of <span className="font-bold">{nfts.length}</span> NFTs
          </p>
        </motion.div>

        {/* Enhanced NFT Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <NFTSkeleton />
              </motion.div>
            ))
          ) : (
            <AnimatePresence>
              {filteredNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group will-change-transform"
                >
                  <Card className="nft-card glass-card border-0 shadow-xl overflow-hidden">
                    {viewMode === 'grid' ? (
                      <>
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
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                            className="absolute top-3 right-3"
                          >
                            <Badge 
                              className={`badge-premium bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} border-0 text-white shadow-lg`}
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {nft.rarity}
                            </Badge>
                          </motion.div>
                          
                          {/* Enhanced Like Button */}
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleLike(nft.id)}
                            className="absolute top-3 left-3 glass p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group/like"
                          >
                            <Heart 
                              className={`h-4 w-4 transition-all duration-300 ${
                                likedNFTs.has(nft.id) 
                                  ? 'fill-red-500 text-red-500 scale-110' 
                                  : 'text-white group-hover/like:text-red-400'
                              }`} 
                            />
                          </motion.button>

                          {/* Enhanced Hover Actions */}
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
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuyNFT(nft)}
                                disabled={purchasingNFT === nft.id}
                                className="flex-1 btn-premium text-white px-3 py-2 rounded-xl font-medium shadow-lg border-0 relative overflow-hidden disabled:opacity-50"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                                <div className="relative z-10 flex items-center justify-center">
                                  {purchasingNFT === nft.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4 mr-1" />
                                      Buy
                                    </>
                                  )}
                                </div>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <div className="mb-3">
                            <h3 className="font-bold text-xl truncate text-gray-900 dark:text-white">{nft.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{nft.collection}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{nft.creator}</p>
                            </div>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Heart className="h-4 w-4 mr-1" />
                              <span className="text-sm">{nft.likes}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold gradient-text">
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
                                  className="btn-premium text-white shadow-lg border-0 relative overflow-hidden disabled:opacity-50"
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
                      </>
                    ) : (
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                            <Image
                              src={nft.image}
                              alt={nft.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xl truncate text-gray-900 dark:text-white">{nft.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{nft.collection}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">by {nft.creator}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                            <Badge className={`badge-premium bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} border-0 text-white`}>
                              {nft.rarity}
                            </Badge>
                            <div className="flex items-center text-gray-500 dark:text-gray-400">
                              <Heart className="h-4 w-4 mr-1" />
                              <span className="text-sm">{nft.likes}</span>
                            </div>
                            <div className="text-2xl font-bold gradient-text">
                              {nft.price} ALGO
                            </div>
                            <div className="flex gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewNFT(nft)}
                                  className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={() => handleBuyNFT(nft)}
                                  disabled={purchasingNFT === nft.id}
                                  className="btn-premium text-white shadow-lg border-0 relative overflow-hidden disabled:opacity-50"
                                  size="sm"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                                  <span className="relative z-10 flex items-center">
                                    {purchasingNFT === nft.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                    )}
                                    Buy Now
                                  </span>
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Enhanced Load More */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg"
                className="glass-card hover:glass-dark border-2 border-blue-500/50 text-blue-600 dark:text-blue-400 px-8 py-4 transition-all duration-300 group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Load More NFTs
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* NFT Modal */}
      <NFTModal 
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}