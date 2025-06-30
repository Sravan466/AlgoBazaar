'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Heart, 
  Share2, 
  ExternalLink, 
  ShoppingCart, 
  Eye, 
  Star,
  Copy,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Calendar,
  Hash,
  Globe,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface NFTModalProps {
  nft: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function NFTModal({ nft, isOpen, onClose }: NFTModalProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  if (!nft) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      className: 'toast-premium',
    });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/nft/${nft.id}`;
    navigator.clipboard.writeText(url);
    toast.success('NFT link copied to clipboard!', {
      className: 'toast-premium',
    });
  };

  const handleBuy = () => {
    toast.success(`Initiating purchase of ${nft.name} for ${nft.price} ALGO`, {
      className: 'toast-premium',
    });
    onClose();
  };

  const copyAssetId = () => {
    if (nft.assetId) {
      navigator.clipboard.writeText(nft.assetId.toString());
      toast.success('Asset ID copied!', {
        className: 'toast-premium',
      });
    }
  };

  const rarityColors = {
    Common: "from-gray-500 to-gray-600",
    Rare: "from-blue-500 to-blue-600", 
    Epic: "from-purple-500 to-purple-600",
    Legendary: "from-orange-500 to-red-500"
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Eye },
    { id: 'properties', label: 'Properties', icon: Star },
    { id: 'history', label: 'History', icon: TrendingUp }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl w-full mx-4 p-0 glass-card border-0 shadow-2xl bg-gradient-to-br from-white/95 to-white/85 dark:from-gray-900/95 dark:to-gray-800/85 backdrop-blur-xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              {/* Header */}
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-2xl font-bold gradient-text">
                    {nft.name}
                  </DialogTitle>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLike}
                      className={`p-2 rounded-xl glass transition-all duration-300 ${
                        isLiked ? 'bg-red-500 text-white' : 'hover:bg-white/20'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="p-2 rounded-xl glass hover:bg-white/20 transition-all duration-300"
                    >
                      <Share2 className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 rounded-xl glass hover:bg-white/20 transition-all duration-300"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Image Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl group">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className={`badge-premium bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} border-0 text-white shadow-lg`}>
                        <Star className="h-3 w-3 mr-1" />
                        {nft.rarity}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div 
                      className="text-center p-3 glass rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Eye className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-bold">1.2K</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 glass rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Heart className="h-5 w-5 text-red-600 mx-auto mb-1" />
                      <div className="text-sm font-bold">234</div>
                      <div className="text-xs text-gray-500">Likes</div>
                    </motion.div>
                    <motion.div 
                      className="text-center p-3 glass rounded-xl"
                      whileHover={{ scale: 1.05 }}
                    >
                      <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-sm font-bold">+15%</div>
                      <div className="text-xs text-gray-500">Value</div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Details Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Collection & Creator */}
                  <div>
                    <Badge variant="outline" className="mb-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      {nft.collection}
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{nft.name}</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{nft.description}</p>
                  </div>

                  {/* Creator & Owner Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{nft.creator}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                          <p className="font-semibold text-gray-900 dark:text-white">You</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="glass p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
                        <div className="text-4xl font-bold gradient-text">{nft.price} ALGO</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">≈ ${(parseFloat(nft.price) * 0.18).toFixed(2)} USD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Asset ID</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {nft.assetId || '123456789'}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={copyAssetId}
                            className="p-1 glass rounded-lg hover:shadow-lg transition-all duration-300"
                          >
                            <Copy className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <Button 
                          onClick={handleBuy}
                          className="w-full btn-premium text-white shadow-lg border-0 relative overflow-hidden h-12"
                          size="lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                          <div className="relative z-10 flex items-center justify-center">
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Buy Now
                          </div>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          variant="outline"
                          className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 h-12 px-6"
                          size="lg"
                        >
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Make Offer
                        </Button>
                      </motion.div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="space-y-4">
                    <div className="flex space-x-1 glass p-1 rounded-xl">
                      {tabs.map((tab) => (
                        <motion.button
                          key={tab.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          <tab.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{tab.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass p-4 rounded-xl min-h-[200px]"
                      >
                        {activeTab === 'details' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              NFT Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Standard</span>
                                <p className="font-medium">ARC3</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Supply</span>
                                <p className="font-medium">1</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Decimals</span>
                                <p className="font-medium">0</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Frozen</span>
                                <p className="font-medium">No</p>
                              </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Contract Address</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm">ALGO...{nft.assetId || '123456789'}</span>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1 glass rounded-lg"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'properties' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <Star className="h-4 w-4 mr-2" />
                              Properties & Attributes
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { trait: 'Background', value: 'Cosmic Nebula', rarity: '5%' },
                                { trait: 'Armor', value: 'Stellar Plate', rarity: '2%' },
                                { trait: 'Weapon', value: 'Star Blade', rarity: '1%' },
                                { trait: 'Eyes', value: 'Galaxy Blue', rarity: '8%' }
                              ].map((attr, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-xl border"
                                >
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{attr.trait}</p>
                                  <p className="font-semibold text-gray-900 dark:text-white mb-1">{attr.value}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    {attr.rarity} have this
                                  </Badge>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeTab === 'history' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Transaction History
                            </h3>
                            <div className="space-y-3">
                              {[
                                { event: 'Minted', from: null, to: nft.creator, price: null, date: '2024-01-10' },
                                { event: 'Listed', from: nft.creator, to: null, price: `${nft.price} ALGO`, date: '2024-01-11' },
                                { event: 'Sale', from: nft.creator, to: 'You', price: `${nft.price} ALGO`, date: '2024-01-15' }
                              ].map((event, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                      {event.event === 'Minted' && <Sparkles className="h-4 w-4 text-white" />}
                                      {event.event === 'Listed' && <TrendingUp className="h-4 w-4 text-white" />}
                                      {event.event === 'Sale' && <ShoppingCart className="h-4 w-4 text-white" />}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900 dark:text-white">{event.event}</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {event.from && event.to ? `${event.from} → ${event.to}` : 
                                         event.to ? `to ${event.to}` : 
                                         event.from ? `by ${event.from}` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {event.price && <p className="font-semibold text-green-600">{event.price}</p>}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{event.date}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <div className="glass p-4 rounded-xl border border-blue-500/20">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                        Verified on Algorand MainNet
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        This NFT is verified and secured by Algorand's blockchain technology. 
                        All transactions are immutable and transparent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}