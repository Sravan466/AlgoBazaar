'use client';

import { WalletProvider } from '@/lib/wallet-context';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </WalletProvider>
  );
}