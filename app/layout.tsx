import type {Metadata} from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const libreBaskerville = Libre_Baskerville({ weight: ['400', '700'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body className="font-sans bg-[#050608]" suppressHydrationWarning>{children}</body>
    </html>
  );
}
