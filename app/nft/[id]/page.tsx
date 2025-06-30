'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ExternalLink, 
  ShoppingCart, 
  Eye, 
  Star,
  Clock,
  TrendingUp,
  User,
  Globe,
  Copy,
  Zap,
  Shield,
  Sparkles
} from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function NFTDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isConnected } = useWallet();
  const [nft, setNft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // Mock NFT data - In production, this would fetch from Algorand/API
  const mockNFTs = {
    '1': {
      id: 1,
      name: "Cosmic Warrior #001",
      price: "150",
      image: "https://images.pexels.com/photos/1831234/pexels-photo-1831234.jpeg?auto=compress&cs=tinysrgb&w=800",
      creator: "ArtistAlgo",
      owner: "CollectorDAO",
      collection: "Cosmic Warriors",
      rarity: "Legendary",
      likes: 234,
      views: 1847,
      category: "Art",
      description: "A legendary cosmic warrior from the depths of space, wielding the power of the stars. This unique piece represents the eternal struggle between light and darkness in the universe.",
      attributes: [
        { trait_type: "Background", value: "Cosmic Nebula", rarity: "5%" },
        { trait_type: "Armor", value: "Stellar Plate", rarity: "2%" },
        { trait_type: "Weapon", value: "Star Blade", rarity: "1%" },
        { trait_type: "Eyes", value: "Galaxy Blue", rarity: "8%" },
        { trait_type: "Aura", value: "Divine Light", rarity: "3%" }
      ],
      history: [
        { event: "Minted", from: null, to: "ArtistAlgo", price: null, date: "2024-01-10", txId: "ABC123..." },
        { event: "Listed", from: "ArtistAlgo", to: null, price: "100 ALGO", date: "2024-01-11", txId: "DEF456..." },
        { event: "Sale", from: "ArtistAlgo", to: "CollectorDAO", price: "120 ALGO", date: "2024-01-15", txId: "GHI789..." },
        { event: "Listed", from: "CollectorDAO", to: null, price: "150 ALGO", date: "2024-01-20", txId: "JKL012..." }
      ],
      metadata: {
        standard: "ARC3",
        assetId: "123456789",
        totalSupply: 1,
        decimals: 0,
        frozen: false,
        royalty: 5,
        mintedOn: "2024-01-10T10:30:00Z",
        ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
      },
      externalUrl: "https://cosmicwarriors.io/001",
      contractAddress: "COSMIC123...WARRIOR789"
    },
    '2': {
      id: 2,
      name: "Digital Dreams",
      price: "85",
      image: "https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=800",
      creator: "CryptoCreator",
      owner: "DreamCollector",
      collection: "Dream Series",
      rarity: "Rare",
      likes: 156,
      views: 892,
      category: "Art",
      description: "An ethereal journey through the digital realm where dreams become reality. This piece captures the essence of imagination in the digital age.",
      attributes: [
        { trait_type: "Style", value: "Abstract", rarity: "15%" },
        { trait_type: "Colors", value: "Neon Spectrum", rarity: "12%" },
        { trait_type: "Mood", value: "Dreamy", rarity: "20%" },
        { trait_type: "Complexity", value: "High", rarity: "8%" }
      ],
      history: [
        { event: "Minted", from: null, to: "CryptoCreator", price: null, date: "2024-01-12", txId: "MNO345..." },
        { event: "Sale", from: "CryptoCreator", to: "DreamCollector", price: "75 ALGO", date: "2024-01-18", txId: "PQR678..." }
      ],
      metadata: {
        standard: "ARC3",
        assetId: "987654321",
        totalSupply: 1,
        decimals: 0,
        frozen: false,
        royalty: 7.5,
        mintedOn: "2024-01-12T14:20:00Z",
        ipfsHash: "QmXwBPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH"
      },
      externalUrl: "https://dreamseries.art/digital-dreams",
      contractAddress: "DREAM456...SERIES123"
    }
  };

  useEffect(() => {
    const fetchNFT = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const nftId = params.id as string;
        const nftData = mockNFTs[nftId as keyof typeof mockNFTs];
        
        if (nftData) {
          setNft(nftData);
          setViewCount(nftData.views);
          // Increment view count
          setViewCount(prev => prev + 1);
        } else {
          toast.error('NFT not found');
          router.push('/marketplace');
        }
      } catch (error) {
        console.error('Error fetching NFT:', error);
        toast.error('Failed to load NFT details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFT();
  }, [params.id, router]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      className: 'toast-premium',
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('NFT link copied to clipboard!', {
      className: 'toast-premium',
    });
  };

  const handleBuy = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    toast.success(`Initiating purchase of ${nft.name} for ${nft.price} ALGO`, {
      className: 'toast-premium',
    });
  };

  const handleMakeOffer = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    toast.info('Make Offer feature coming soon!', {
      className: 'toast-premium',
    });
  };

  const rarityColors = {
    Common: "from-gray-500 to-gray-600",
    Rare: "from-blue-500 to-blue-600",
    Epic: "from-purple-500 to-purple-600",
    Legendary: "from-orange-500 to-red-500"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading NFT details...</p>
        </motion.div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">NFT Not Found</h1>
          <Button onClick={() => router.push('/marketplace')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="glass hover:glass-dark transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* NFT Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-card border-0 shadow-2xl overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLike}
                    className={`p-3 rounded-full glass shadow-lg transition-all duration-300 ${
                      isLiked ? 'bg-red-500 text-white' : 'hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-3 rounded-full glass shadow-lg hover:bg-white/20 transition-all duration-300"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge className={`badge-premium bg-gradient-to-r ${rarityColors[nft.rarity as keyof typeof rarityColors]} border-0 text-white shadow-lg`}>
                    <Star className="h-3 w-3 mr-1" />
                    {nft.rarity}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center glass px-3 py-1 rounded-full">
                      <Eye className="h-4 w-4 mr-1" />
                      {viewCount.toLocaleString()} views
                    </div>
                    <div className="flex items-center glass px-3 py-1 rounded-full">
                      <Heart className="h-4 w-4 mr-1" />
                      {nft.likes} likes
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* NFT Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Collection */}
            <div>
              <Link href={`/collection/${nft.collection.toLowerCase().replace(/\s+/g, '-')}`}>
                <Badge variant="outline" className="mb-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  {nft.collection}
                </Badge>
              </Link>
              <h1 className="text-4xl font-bold gradient-text mb-2">{nft.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{nft.description}</p>
            </div>

            {/* Creator and Owner */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                      <p className="font-semibold">{nft.creator}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                      <p className="font-semibold">{nft.owner}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price and Actions */}
            <Card className="glass-card border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
                    <div className="text-4xl font-bold gradient-text">{nft.price} ALGO</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">≈ ${(parseFloat(nft.price) * 0.18).toFixed(2)} USD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Royalty</p>
                    <p className="text-lg font-semibold">{nft.metadata.royalty}%</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button 
                      onClick={handleBuy}
                      className="w-full btn-premium text-white shadow-lg border-0 relative overflow-hidden"
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
                      onClick={handleMakeOffer}
                      className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                      size="lg"
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Make Offer
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="glass-card border-0 shadow-lg text-center">
                <CardContent className="p-4">
                  <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Listed</p>
                  <p className="font-semibold">3 days ago</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-0 shadow-lg text-center">
                <CardContent className="p-4">
                  <Zap className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                  <p className="font-semibold">MainNet</p>
                </CardContent>
              </Card>
              <Card className="glass-card border-0 shadow-lg text-center">
                <CardContent className="p-4">
                  <Sparkles className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Standard</p>
                  <p className="font-semibold">ARC3</p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>

        {/* Detailed Information Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="attributes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>

            <TabsContent value="attributes">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nft.attributes.map((attr: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border"
                      >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{attr.trait_type}</p>
                        <p className="font-semibold text-lg mb-2">{attr.value}</p>
                        <Badge variant="secondary" className="text-xs">
                          {attr.rarity} have this
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {nft.history.map((event: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            {event.event === 'Minted' && <Sparkles className="h-5 w-5 text-white" />}
                            {event.event === 'Listed' && <TrendingUp className="h-5 w-5 text-white" />}
                            {event.event === 'Sale' && <ShoppingCart className="h-5 w-5 text-white" />}
                          </div>
                          <div>
                            <p className="font-semibold">{event.event}</p>
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
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(event.txId);
                              toast.success('Transaction ID copied!');
                            }}
                            className="text-xs text-blue-500 hover:underline flex items-center"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {event.txId}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Technical Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Asset ID</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm">{nft.metadata.assetId}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(nft.metadata.assetId);
                              toast.success('Asset ID copied!');
                            }}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Standard</p>
                        <p className="font-semibold">{nft.metadata.standard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Supply</p>
                        <p className="font-semibold">{nft.metadata.totalSupply}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Decimals</p>
                        <p className="font-semibold">{nft.metadata.decimals}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Minted On</p>
                        <p className="font-semibold">{new Date(nft.metadata.mintedOn).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">IPFS Hash</p>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm truncate">{nft.metadata.ipfsHash}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(nft.metadata.ipfsHash);
                              toast.success('IPFS hash copied!');
                            }}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Frozen</p>
                        <Badge variant={nft.metadata.frozen ? "destructive" : "default"}>
                          {nft.metadata.frozen ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Royalty</p>
                        <p className="font-semibold">{nft.metadata.royalty}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="more">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {nft.externalUrl && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">External Link</p>
                      <a 
                        href={nft.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Collection Website
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Contract Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-sm">{nft.contractAddress}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(nft.contractAddress);
                          toast.success('Contract address copied!');
                        }}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">View on Explorer</p>
                    <a 
                      href={`https://algoexplorer.io/asset/${nft.metadata.assetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      AlgoExplorer
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}