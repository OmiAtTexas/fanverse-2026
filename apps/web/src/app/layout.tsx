import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: 'FanVerse 2026 — FIFA World Cup Fan Companion App',
  description: 'Connect with fans worldwide at FIFA World Cup 2026. Live scores, fan matching, group chat, AI travel guide. Your ultimate World Cup companion.',
  keywords: 'FIFA World Cup 2026, fan app, live scores, fan groups, travel guide, USA Canada Mexico, football fans',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'FanVerse 2026' },
  openGraph: {
    title: 'FanVerse 2026 — Your World Cup Companion',
    description: 'Connect with fans, get live scores, find meetups and explore 16 host cities.',
    type: 'website',
    siteName: 'FanVerse 2026',
  },
  twitter: { card: 'summary_large_image', title: 'FanVerse 2026', description: 'Your FIFA World Cup 2026 companion app' },
};

export const viewport: Viewport = {
  themeColor: '#020F2A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        </head>
        <body>
          <ThemeProvider>{children}</ThemeProvider>
          <script dangerouslySetInnerHTML={{ __html: `
            const t=localStorage.getItem('theme')||'dark';
            document.documentElement.setAttribute('data-theme',t);
          `}} />
        </body>
      </html>
    </ClerkProvider>
  );
}
