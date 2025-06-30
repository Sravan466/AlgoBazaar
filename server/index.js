const express = require('express');
const cors = require('cors');
const multer = require('multer');
const algosdk = require('algosdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Algorand client setup
const algodToken = process.env.ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // Testnet token
const algodServer = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
const algodPort = '';
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'AlgoBazaar API is running', timestamp: new Date().toISOString() });
});

// Get account information
app.get('/api/account/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const accountInfo = await algodClient.accountInformation(address).do();
    res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: 'Failed to fetch account information' });
  }
});

// Mint NFT
app.post('/api/mint-nft', upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, royalty, supply, price, creatorAddress } = req.body;
    const imageFile = req.file;

    // In a real implementation, you would:
    // 1. Upload image to IPFS/Pinata
    // 2. Create metadata JSON
    // 3. Upload metadata to IPFS
    // 4. Create ARC3 NFT on Algorand

    // Mock response for demo
    const mockResponse = {
      success: true,
      nftId: Math.random().toString(36).substr(2, 9),
      transactionId: algosdk.generateAccount().addr,
      ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
      metadata: {
        name,
        description,
        category,
        royalty: parseFloat(royalty),
        supply: parseInt(supply),
        price: price ? parseFloat(price) : null,
        creator: creatorAddress
      }
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error minting NFT:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

// List NFTs in marketplace
app.get('/api/marketplace/nfts', async (req, res) => {
  try {
    // Mock marketplace data
    const mockNFTs = [
      {
        id: 1,
        name: "Cosmic Warrior #001",
        price: "150",
        creator: "ArtistAlgo",
        collection: "Cosmic Warriors",
        rarity: "Legendary",
        image: "https://images.pexels.com/photos/1831234/pexels-photo-1831234.jpeg"
      },
      // Add more mock data as needed
    ];

    res.json({ nfts: mockNFTs, total: mockNFTs.length });
  } catch (error) {
    console.error('Error fetching marketplace NFTs:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace NFTs' });
  }
});

// Buy NFT
app.post('/api/buy-nft', async (req, res) => {
  try {
    const { nftId, buyerAddress, sellerAddress, price } = req.body;

    // In a real implementation, this would:
    // 1. Create atomic transaction group
    // 2. Transfer NFT from seller to buyer
    // 3. Transfer ALGO from buyer to seller
    // 4. Calculate and transfer royalties
    // 5. Deduct platform fee

    const mockResponse = {
      success: true,
      transactionId: algosdk.generateAccount().addr,
      nftId,
      buyer: buyerAddress,
      seller: sellerAddress,
      price: parseFloat(price),
      platformFee: parseFloat(price) * 0.025, // 2.5% fee
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error buying NFT:', error);
    res.status(500).json({ error: 'Failed to buy NFT' });
  }
});

// Token swap
app.post('/api/swap-tokens', async (req, res) => {
  try {
    const { fromToken, toToken, fromAmount, toAmount, userAddress } = req.body;

    // Mock swap response
    const mockResponse = {
      success: true,
      transactionId: algosdk.generateAccount().addr,
      fromToken,
      toToken,
      fromAmount: parseFloat(fromAmount),
      toAmount: parseFloat(toAmount),
      rate: parseFloat(toAmount) / parseFloat(fromAmount),
      fee: parseFloat(fromAmount) * 0.003, // 0.3% fee
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error swapping tokens:', error);
    res.status(500).json({ error: 'Failed to swap tokens' });
  }
});

// Stake tokens/NFTs
app.post('/api/stake', async (req, res) => {
  try {
    const { assetId, amount, poolId, userAddress, stakingType } = req.body;

    const mockResponse = {
      success: true,
      transactionId: algosdk.generateAccount().addr,
      assetId,
      amount: stakingType === 'token' ? parseFloat(amount) : parseInt(amount),
      poolId,
      userAddress,
      stakingType,
      apy: poolId === 1 ? 12.5 : poolId === 2 ? 8.2 : 15.8,
      lockPeriod: poolId === 1 ? 30 : poolId === 2 ? 7 : 90,
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error staking:', error);
    res.status(500).json({ error: 'Failed to stake' });
  }
});

// Unstake tokens/NFTs
app.post('/api/unstake', async (req, res) => {
  try {
    const { stakeId, userAddress } = req.body;

    const mockResponse = {
      success: true,
      transactionId: algosdk.generateAccount().addr,
      stakeId,
      userAddress,
      unstakedAmount: 500, // Mock amount
      rewards: 15.25, // Mock rewards
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error unstaking:', error);
    res.status(500).json({ error: 'Failed to unstake' });
  }
});

// Claim staking rewards
app.post('/api/claim-rewards', async (req, res) => {
  try {
    const { poolId, userAddress } = req.body;

    const mockResponse = {
      success: true,
      transactionId: algosdk.generateAccount().addr,
      poolId,
      userAddress,
      rewardsClaimed: 15.25, // Mock rewards
      timestamp: new Date().toISOString()
    };

    res.json(mockResponse);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

// Get user dashboard data
app.get('/api/dashboard/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Mock dashboard data
    const mockData = {
      address,
      balance: 1250.50,
      totalValue: 2845.67,
      nfts: [
        {
          id: 1,
          name: "Cosmic Warrior #001",
          collection: "Cosmic Warriors",
          value: 150,
          purchasePrice: 120,
          rarity: "Legendary"
        }
      ],
      tokens: [
        { symbol: 'ALGO', amount: 1250.50, value: 225.09 },
        { symbol: 'USDC', amount: 500.00, value: 500.00 }
      ],
      stakingRewards: 156.78,
      transactions: [
        {
          type: 'buy',
          item: 'Cosmic Warrior #001',
          amount: '120 ALGO',
          date: '2024-01-15',
          status: 'completed'
        }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`AlgoBazaar API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;