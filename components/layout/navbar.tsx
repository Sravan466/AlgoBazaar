'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/lib/wallet-context';
import { useTheme } from 'next-themes';
import { 
  Wallet, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Gem, 
  ArrowUpDown,
  Coins,
  BarChart3,
  Moon,
  Sun,
  Sparkles,
  Loader2,
  Copy,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function Navbar() {
  const { isConnected, address, balance, connectWallet, disconnectWallet, isLoading, networkId } = useWallet();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Get environment info - Now defaults to MainNet
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'mainnet';
  const isMainnet = environment === 'mainnet';

  // Handle scroll effect with enhanced glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWalletConnect = async (provider: 'pera' | 'walletconnect') => {
    try {
      await connectWallet(provider);
      setShowWalletModal(false);
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard! 📋', {
        className: 'toast-premium',
      });
    }
  };

  const navItems = [
    { href: '/marketplace', label: 'Marketplace', icon: Gem, color: 'from-blue-500 to-cyan-500' },
    { href: '/mint', label: 'Create', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { href: '/swap', label: 'Swap', icon: ArrowUpDown, color: 'from-green-500 to-emerald-500' },
    { href: '/stake', label: 'Stake', icon: BarChart3, color: 'from-orange-500 to-red-500' },
  ];

  return (
    <>
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'glass-card shadow-2xl' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Enhanced Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div 
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 animate-glow" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Gem className="h-5 w-5 sm:h-7 sm:w-7 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </motion.div>
              <div className="flex flex-col">
                <motion.span 
                  className="text-xl sm:text-2xl font-bold gradient-text"
                  whileHover={{ scale: 1.05 }}
                >
                  AlgoBazaar
                </motion.span>
                {isMainnet && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-1"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow" />
                    <span className="text-xs text-green-600 font-semibold">MAINNET</span>
                  </motion.div>
                )}
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={item.href}
                    className="group relative flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-white transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl backdrop-blur-sm" />
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="relative z-10"
                    >
                      <item.icon className="h-4 w-4" />
                    </motion.div>
                    <span className="font-medium relative z-10">{item.label}</span>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Enhanced Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Enhanced Network indicator for MainNet */}
              {isMainnet && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="hidden sm:flex badge-premium border-0 text-white shadow-lg">
                    <Shield className="h-3 w-3 mr-1" />
                    MainNet
                    <Zap className="h-3 w-3 ml-1" />
                  </Badge>
                </motion.div>
              )}

              {/* Enhanced Theme toggle */}
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 180 }} 
                whileTap={{ scale: 0.9 }}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative rounded-full p-2 glass hover:glass-dark transition-all duration-300 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {theme === 'dark' ? 
                    <Sun className="h-4 w-4 text-yellow-500 relative z-10" /> : 
                    <Moon className="h-4 w-4 text-blue-500 relative z-10" />
                  }
                </Button>
              </motion.div>

              {/* Enhanced Wallet Connection */}
              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -2 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button className="relative flex items-center space-x-2 glass-card hover:glass-dark border-0 shadow-xl p-2 sm:px-4 sm:py-2 group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10 flex items-center space-x-2">
                          <div className="relative">
                            <Wallet className="h-4 w-4 text-green-600" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>
                          <div className="hidden sm:flex flex-col items-start">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Balance</span>
                            <span className="text-sm font-bold text-green-600">{balance.toFixed(2)} ALGO</span>
                          </div>
                          <Badge className="badge-premium border-0 text-white text-xs">
                            {formatAddress(address!)}
                          </Badge>
                        </div>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-card border-0 shadow-2xl">
                    <DropdownMenuItem onClick={copyAddress} className="cursor-pointer hover:bg-white/10 transition-colors duration-200">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer hover:bg-white/10 transition-colors duration-200">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a 
                        href={`https://algoexplorer.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center cursor-pointer hover:bg-white/10 transition-colors duration-200"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -2 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setShowWalletModal(true)}
                    disabled={isLoading}
                    className="btn-premium text-white shadow-2xl text-sm px-4 py-2 sm:px-6 sm:py-3 border-0 relative overflow-hidden group"
                    size="sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                    <div className="relative z-10 flex items-center">
                      {isLoading ? (
                        <div className="spinner-premium w-4 h-4" />
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline font-semibold">Connect</span>
                        </>
                      )}
                    </div>
                  </Button>
                </motion.div>
              )}

              {/* Enhanced Mobile Menu Button */}
              <motion.button
                className="lg:hidden p-2 rounded-xl glass hover:glass-dark transition-all duration-300 group"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden glass-card border-t border-white/20"
            >
              <div className="container mx-auto px-4 py-6 space-y-4">
                {/* Network indicator for mobile */}
                {isMainnet && (
                  <motion.div 
                    className="flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Badge className="badge-premium border-0 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      MainNet Mode
                      <Zap className="h-3 w-3 ml-1" />
                    </Badge>
                  </motion.div>
                )}

                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className="group relative flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 overflow-hidden"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl`} />
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <span className="font-medium text-lg relative z-10">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="flex items-center justify-between pt-4 border-t border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="glass hover:glass-dark rounded-xl flex items-center space-x-2 transition-all duration-300"
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </Button>
                </motion.div>
                
                {isConnected ? (
                  <motion.div 
                    className="space-y-3 pt-4 border-t border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="glass-card p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                        <span className="font-bold text-green-600 text-lg">{balance.toFixed(2)} ALGO</span>
                      </div>
                    </div>
                    <Badge className="w-full justify-center py-3 text-sm badge-premium border-0 text-white">
                      {formatAddress(address!)}
                    </Badge>
                    <Button onClick={copyAddress} className="w-full py-3 glass hover:glass-dark transition-all duration-300">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </Button>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full py-3 glass hover:glass-dark transition-all duration-300">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      className="w-full text-red-600 py-3 glass hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                      onClick={() => {
                        disconnectWallet();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={() => {
                        setShowWalletModal(true);
                        setIsMenuOpen(false);
                      }}
                      disabled={isLoading}
                      className="w-full btn-premium text-white py-4 text-lg border-0 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                      <div className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <div className="spinner-premium w-5 h-5 mr-2" />
                        ) : (
                          <Wallet className="h-5 w-5 mr-2" />
                        )}
                        Connect Wallet
                      </div>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Enhanced Wallet Connection Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass-card max-w-md w-full mx-4 shadow-2xl border-0 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
                    Connect Wallet
                  </h2>
                  <motion.button
                    onClick={() => setShowWalletModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-xl glass hover:glass-dark transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                
                {/* MainNet Notice */}
                {isMainnet && (
                  <motion.div 
                    className="mb-6 p-4 glass rounded-xl border border-green-500/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        MainNet Mode
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow" />
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      You're connecting to Algorand MainNet. Real transactions will occur.
                    </p>
                  </motion.div>
                )}
                
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={() => handleWalletConnect('pera')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-start space-x-4 p-6 h-auto glass hover:glass-dark border-0 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                        {isLoading ? (
                          <div className="spinner-premium w-6 h-6" />
                        ) : (
                          <Wallet className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="text-left relative z-10">
                        <div className="font-semibold text-lg">Pera Wallet</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Most popular Algorand wallet
                        </div>
                      </div>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpDown className="h-5 w-5 text-green-500" />
                      </div>
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02, y: -2 }} 
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      onClick={() => handleWalletConnect('walletconnect')}
                      disabled={isLoading}
                      className="w-full flex items-center justify-start space-x-4 p-6 h-auto glass hover:glass-dark border-0 transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
                        <Wallet className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left relative z-10">
                        <div className="font-semibold text-lg">WalletConnect</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Connect any compatible wallet
                        </div>
                      </div>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpDown className="h-5 w-5 text-purple-500" />
                      </div>
                    </Button>
                  </motion.div>
                </div>

                <motion.div 
                  className="mt-6 p-4 glass rounded-xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Ready for MainNet?</strong> Make sure you have real ALGO in your wallet for transactions and fees.
                  </p>
                  {isMainnet && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      <strong>Important:</strong> Ensure your wallet is connected to MainNet for real transactions.
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}