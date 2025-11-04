import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { ToastContainer } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider'; // Import the provider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://xprofilecards.com'),
  title: {
    default: 'X Profile Cards – Create Beautiful X Profile Cards',
    template: '%s | X Profile Cards',
  },
  description:
    'Transform any X profile into a stunning, shareable card. Choose from 26+ premium themes and download high-quality PNGs instantly.',
  keywords: [
    'X profile card',
    'Twitter profile card',
    'profile generator',
    'card maker',
    'X.com',
    'profile art',
    'social media',
  ],
  
  manifest: '', 
  icons: {},
  
  themeColor: '#ffffff',
  
  alternates: {
    canonical: 'https://xprofilecards.com',
  },

  openGraph: {
    type: 'website',
    url: 'https://xprofilecards.com',
    siteName: 'X Profile Cards',
    title: 'X Profile Cards – Create Beautiful X Profile Cards',
    description:
      'Transform your X profile into a beautiful, shareable card with premium themes.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'X Profile Cards - Profile Card Generator',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@iamvibecoder',
    creator: '@iamvibecoder',
    title: 'X Profile Cards – Create Beautiful X Profile Cards',
    description:
      'Transform your X profile into a beautiful, shareable card with premium themes.',
    images: ['/twitter.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  authors: [
    {
      name: 'Siddhesh',
      url: 'https.com/iamvibecoder',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="canonical" href="https://xprofilecards.com" />
        
        {/* === START MANUAL FAVICON/MANIFEST LINKS === */}
        
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/web-app-manifest-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/web-app-manifest-512x512.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/web-app-manifest-512x512.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        
        {/* === END MANUAL FAVICON/MANIFEST LINKS === */}
      </head>
      
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="container py-0">{children}</main>
          <Footer />
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}