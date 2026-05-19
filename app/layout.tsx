import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { WalletProviders } from '@/components/WalletProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'VitaPass • Biometric Authentication',
  description: 'Passwordless login for real humans only. Powered by WebAuthn + AI Liveness.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-zinc-950 text-white antialiased">
        <WalletProviders>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </WalletProviders>
      </body>
    </html>
  );
}