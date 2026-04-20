import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-headers', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || 'https://yod.ai'),
  title: {
    default: 'Yoda.ai — The only AI that makes you wiser',
    template: '%s · Yoda.ai',
  },
  description:
    'Premium AI wisdom platform. Ancient counsel for modern decisions — business, personal, creative. Ask, and guided you will be.',
  keywords: ['Yoda AI', 'wisdom', 'AI advisor', 'mindfulness', 'decision making', 'AI chat'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Yoda.ai' },
  openGraph: {
    type: 'website',
    title: 'Yoda.ai — The only AI that makes you wiser',
    description:
      'Premium AI wisdom platform. Ancient counsel for modern decisions.',
    siteName: 'Yoda.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yoda.ai — The only AI that makes you wiser',
    description: 'Premium AI wisdom platform. Ancient counsel for modern decisions.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-void-black text-crystal-white antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
