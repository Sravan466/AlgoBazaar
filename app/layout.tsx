import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/navbar';
import ProvidersWrapper from './providers-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AlgoBazaar - Premier NFT Marketplace on Algorand',
  description: 'Discover, create, and trade NFTs on the fastest blockchain. Zero gas fees, lightning-fast transactions on Algorand MainNet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ProvidersWrapper>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>{children}</main>
          </div>
        </ProvidersWrapper>
      </body>
    </html>
  );
}