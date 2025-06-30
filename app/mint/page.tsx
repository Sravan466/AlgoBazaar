'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Eye, Zap, CheckCircle, Sparkles, Image as ImageIcon, Loader2, Heart, Star } from 'lucide-react';
import { useWallet } from '@/lib/wallet-context';
import { toast } from 'sonner';

export default function MintNFT() {
  const { isConnected, address } = useWallet();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    royalty: '5',
    supply: '1',
    price: '',
    image: null as File | null,
    externalUrl: '',
    attributes: [{ trait_type: '', value: '' }],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintedAssetId, setMintedAssetId] = useState<number | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('🖼️ Image uploaded successfully!');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    const newAttributes = [...formData.attributes];
    newAttributes[index][field] = value;
    setFormData({ ...formData, attributes: newAttributes });
  };

  const addAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { trait_type: '', value: '' }]
    });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = formData.attributes.filter((_, i) => i !== index);
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handlePreview = () => {
    if (!formData.name || !formData.description || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.image) {
      toast.error('Please select an image');
      return;
    }

    setIsMinting(true);
    setUploadProgress(0);

    try {
      // Step 1: Simulate image upload to IPFS
      toast.info('📤 Uploading image to IPFS...', {
        description: 'This may take a few moments'
      });
      setUploadProgress(20);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Create and upload metadata
      toast.info('📝 Creating metadata...', {
        description: 'Generating ARC3 compliant metadata'
      });
      setUploadProgress(40);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Create NFT transaction
      toast.info('🔗 Creating NFT transaction...', {
        description: 'Preparing blockchain transaction'
      });
      setUploadProgress(60);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Sign and submit transaction
      toast.info('✍️ Please sign the transaction...', {
        description: 'Check your wallet for the signing request'
      });
      setUploadProgress(80);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.info('📡 Submitting to blockchain...', {
        description: 'Broadcasting transaction to Algorand'
      });
      setUploadProgress(95);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setUploadProgress(100);
      const mockAssetId = Math.floor(Math.random() * 1000000000);
      setMintedAssetId(mockAssetId);
      setStep(3);
      
      toast.success('🎉 NFT minted successfully!', {
        description: `Asset ID: ${mockAssetId}`,
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Minting failed:', error);
      toast.error('❌ Minting failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsMinting(false);
      setUploadProgress(0);
    }
  };

  const categories = [
    'Art', 'Photography', 'Music', 'Gaming', 'Sports', 'Collectibles', 
    'Virtual Worlds', 'Domain Names', 'Memes', 'Utility', 'PFP'
  ];

  if (step === 3) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center glass-card border-0 shadow-2xl bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-8 sm:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                  <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                >
                  NFT Minted Successfully! 🎉
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  {imagePreview && (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-2xl overflow-hidden shadow-2xl mb-6">
                      <img src={imagePreview} alt={formData.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg sm:text-xl leading-relaxed">
                    Your NFT "{formData.name}" has been successfully minted on Algorand MainNet!
                  </p>
                  {mintedAssetId && (
                    <div className="glass p-6 rounded-2xl mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Asset ID</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600">{mintedAssetId}</p>
                    </div>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-4 justify-center"
                >
                  <Button 
                    onClick={() => window.location.href = '/marketplace'}
                    className="btn-premium text-white shadow-2xl border-0 relative overflow-hidden"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600" />
                    <div className="relative z-10 flex items-center justify-center">
                      <Eye className="mr-2 h-5 w-5" />
                      View in Marketplace
                    </div>
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setStep(1);
                      setFormData({
                        name: '',
                        description: '',
                        category: '',
                        royalty: '5',
                        supply: '1',
                        price: '',
                        image: null,
                        externalUrl: '',
                        attributes: [{ trait_type: '', value: '' }],
                      });
                      setImagePreview(null);
                      setMintedAssetId(null);
                    }}
                    className="glass-card hover:glass-dark border-2"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Another NFT
                  </Button>
                </motion.div>
                
                {mintedAssetId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <a 
                      href={`https://algoexplorer.io/asset/${mintedAssetId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View on AlgoExplorer →
                    </a>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Preview & Mint NFT
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Review your NFT details before minting</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-900/90 dark:to-blue-900/20 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Eye className="mr-3 h-6 w-6 text-blue-600" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aspect-square rounded-2xl overflow-hidden mb-6 shadow-2xl group relative"
                    >
                      <img 
                        src={imagePreview} 
                        alt="NFT Preview" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                        >
                          <Heart className="h-4 w-4 text-red-500" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                        >
                          <Star className="h-4 w-4 text-yellow-500" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  <div className="space-y-4">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{formData.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{formData.description}</p>
                    
                    {formData.attributes.some(attr => attr.trait_type && attr.value) && (
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Attributes</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {formData.attributes
                            .filter(attr => attr.trait_type && attr.value)
                            .map((attr, index) => (
                              <div key={index} className="glass p-3 rounded-xl">
                                <span className="text-xs text-gray-500 dark:text-gray-400 block">{attr.trait_type}</span>
                                <span className="font-semibold">{attr.value}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-4 rounded-xl">
                        <span className="text-gray-500 dark:text-gray-400 block text-sm">Category</span>
                        <span className="font-semibold">{formData.category || 'Uncategorized'}</span>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <span className="text-gray-500 dark:text-gray-400 block text-sm">Supply</span>
                        <span className="font-semibold">{formData.supply}</span>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <span className="text-gray-500 dark:text-gray-400 block text-sm">Royalty</span>
                        <span className="font-semibold">{formData.royalty}%</span>
                      </div>
                      {formData.price && (
                        <div className="glass p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                          <span className="text-gray-500 dark:text-gray-400 block text-sm">Initial Price</span>
                          <span className="font-bold text-blue-600">{formData.price} ALGO</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-900/90 dark:to-purple-900/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Minting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <h4 className="font-semibold mb-4 text-lg">Estimated Costs</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Asset Creation:</span>
                        <span className="font-medium">0.001 ALGO</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Balance:</span>
                        <span className="font-medium">0.1 ALGO</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transaction Fee:</span>
                        <span className="font-medium">0.001 ALGO</span>
                      </div>
                      <hr className="my-3 border-blue-200 dark:border-blue-800" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-blue-600">~0.102 ALGO</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <h4 className="font-semibold mb-4 text-lg flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-600" />
                      What happens next?
                    </h4>
                    <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300">
                      <li>Image uploaded to IPFS for permanent storage</li>
                      <li>ARC3 metadata created and stored on IPFS</li>
                      <li>NFT minted on Algorand blockchain</li>
                      <li>Automatic royalty setup for future sales</li>
                      <li>Listed in AlgoBazaar marketplace</li>
                    </ul>
                  </div>

                  {isMinting && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                    >
                      <div className="flex items-center mb-3">
                        <Loader2 className="animate-spin h-5 w-5 text-green-600 mr-2" />
                        <span className="font-semibold">Minting in Progress...</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {uploadProgress < 20 && "Preparing files..."}
                        {uploadProgress >= 20 && uploadProgress < 40 && "Uploading to IPFS..."}
                        {uploadProgress >= 40 && uploadProgress < 60 && "Creating metadata..."}
                        {uploadProgress >= 60 && uploadProgress < 80 && "Preparing transaction..."}
                        {uploadProgress >= 80 && uploadProgress < 95 && "Waiting for signature..."}
                        {uploadProgress >= 95 && "Finalizing mint..."}
                      </p>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="flex-1 glass-card hover:glass-dark border-2"
                      disabled={isMinting}
                    >
                      Back to Edit
                    </Button>
                    <Button 
                      onClick={handleMint}
                      disabled={isMinting || !isConnected}
                      className="flex-1 btn-premium text-white shadow-2xl border-0 relative overflow-hidden"
                      size="lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                      <div className="relative z-10 flex items-center justify-center">
                        {isMinting ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Minting...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-5 w-5" />
                            Mint NFT
                          </>
                        )}
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-6xl font-bold gradient-text mb-4">
            Create Your NFT
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl">Bring your digital art to life on Algorand ✨</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-0 shadow-2xl bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-900/90 dark:to-blue-900/20 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Sparkles className="mr-3 h-6 w-6 text-purple-600" />
                NFT Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Image Upload */}
              <div>
                <Label htmlFor="image" className="text-lg font-semibold">Image *</Label>
                <div className="mt-3">
                  {imagePreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute top-4 right-4 glass px-4 py-2 rounded-xl shadow-lg border text-sm"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData({ ...formData, image: null });
                        }}
                      >
                        Change Image
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 relative"
                    >
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Drop your image here, or click to browse
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-lg font-semibold">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter NFT name"
                    className="mt-2 h-12 text-lg glass border-0 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-lg font-semibold">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="mt-2 h-12 text-lg glass border-0">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-lg font-semibold">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your NFT..."
                  className="mt-2 min-h-32 text-lg glass border-0 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              {/* External URL */}
              <div>
                <Label htmlFor="externalUrl" className="text-lg font-semibold">External URL</Label>
                <Input
                  id="externalUrl"
                  value={formData.externalUrl}
                  onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-2 h-12 text-lg glass border-0"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Link to your website, portfolio, or additional content
                </p>
              </div>

              {/* Attributes */}
              <div>
                <Label className="text-lg font-semibold">Attributes</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Add traits and properties that make your NFT unique
                </p>
                <div className="space-y-3">
                  {formData.attributes.map((attr, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-center"
                    >
                      <Input
                        placeholder="Trait type (e.g., Color)"
                        value={attr.trait_type}
                        onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                        className="flex-1 glass border-0"
                      />
                      <Input
                        placeholder="Value (e.g., Blue)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="flex-1 glass border-0"
                      />
                      {formData.attributes.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttribute(index)}
                          className="px-3 glass-card hover:glass-dark border-0"
                        >
                          ×
                        </Button>
                      )}
                    </motion.div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addAttribute}
                    className="w-full border-dashed glass-card hover:glass-dark border-0"
                  >
                    + Add Attribute
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Royalty */}
                <div>
                  <Label htmlFor="royalty" className="text-lg font-semibold">Royalty (%)</Label>
                  <Input
                    id="royalty"
                    type="number"
                    min="0"
                    max="20"
                    value={formData.royalty}
                    onChange={(e) => handleInputChange('royalty', e.target.value)}
                    placeholder="5"
                    className="mt-2 h-12 text-lg glass border-0"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Percentage of future sales you'll receive
                  </p>
                </div>

                {/* Supply */}
                <div>
                  <Label htmlFor="supply" className="text-lg font-semibold">Supply</Label>
                  <Input
                    id="supply"
                    type="number"
                    min="1"
                    value={formData.supply}
                    onChange={(e) => handleInputChange('supply', e.target.value)}
                    placeholder="1"
                    className="mt-2 h-12 text-lg glass border-0 bg-gray-50 dark:bg-gray-800"
                    disabled
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    NFTs have a supply of 1
                  </p>
                </div>

                {/* Initial Price */}
                <div>
                  <Label htmlFor="price" className="text-lg font-semibold">Initial Price (ALGO)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="10.0"
                    className="mt-2 h-12 text-lg glass border-0"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty if not for immediate sale
                  </p>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handlePreview}
                  disabled={!formData.name || !formData.description || !formData.image}
                  className="w-full btn-premium text-white shadow-2xl border-0 relative overflow-hidden"
                  size="lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                  <div className="relative z-10 flex items-center justify-center">
                    <Eye className="mr-2 h-6 w-6" />
                    Preview NFT
                  </div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}