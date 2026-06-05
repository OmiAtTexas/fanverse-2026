import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FanVerse 2026 — Your World Cup Companion',
  description: 'AI-powered social & travel companion for FIFA World Cup 2026 fans',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FanVerse 2026' },
  openGraph: {
    title: 'FanVerse 2026',
    description: 'Meet fans. Explore cities. Live the World Cup.',
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${bebas.variable} ${dmSans.variable}`}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <meta name="mobile-web-app-capable" content="yes" />
        </head>
        <body className="bg-background text-foreground antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}