import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { ToastContainer } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';

// ---------------- Fonts ----------------
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

// ---------------- Viewport ----------------
export const viewport: Viewport = {
  themeColor: '#ffffff',
};

// ---------------- Metadata ----------------
export const metadata: Metadata = {
  metadataBase: new URL('https://xprofilecards.com'),
  title: {
    default: 'X Profile Cards – 100% Free X (Twitter) Profile Card Generator',
    template: '%s | X Profile Cards',
  },
  description:
    'Transform any X (Twitter) profile into a beautiful, shareable card with our 100% free X profile card generator. Choose from 26+ premium themes and download high-quality PNGs instantly.',
  keywords: [
    'x profile cards',
    'twitter card generator',
    'free x profile card',
    'profile cards for x',
    'xprofilecards.com',
    'iamvibecoder',
    'siddhesh kamath',
  ],
  alternates: {
    canonical: 'https://xprofilecards.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://xprofilecards.com',
    siteName: 'X Profile Cards',
    title: 'X Profile Cards – 100% Free X (Twitter) Profile Card Generator',
    description:
      'Transform your X (Twitter) profile into a beautiful, shareable card with 26+ premium themes.',
    images: [
      {
        url: 'https://xprofilecards.com/og-cover.png',
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
    title: 'X Profile Cards – 100% Free X (Twitter) Profile Card Generator',
    description:
      'Transform your X profile into a beautiful, shareable card with premium themes.',
    images: ['https://xprofilecards.com/og-cover.png'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  authors: [{ name: 'Siddhesh Kamath', url: 'https://x.com/iamvibecoder' }],
};

// ---------------- JSON-LD Schema ----------------
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://xprofilecards.com/#organization',
      name: 'X Profile Cards',
      url: 'https://xprofilecards.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://xprofilecards.com/logo.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://x.com/iamvibecoder',
        'https://github.com/iamvibecoding',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://xprofilecards.com/#website',
      url: 'https://xprofilecards.com',
      name: 'X Profile Cards',
      alternateName: ['XProfileCards', 'X Profile Card Generator'],
      publisher: { '@id': 'https://xprofilecards.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://xprofilecards.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'X Profile Cards',
      operatingSystem: 'Web',
      applicationCategory: 'WebApplication',
      description:
        'A 100% free tool to transform any X (Twitter) profile into beautiful, shareable cards with premium themes.',
      keywords:
        'x profile cards, twitter card generator, profile cards for x, free twitter profile card',
      url: 'https://xprofilecards.com',
      author: {
        '@type': 'Person',
        name: 'Siddhesh Kamath',
        url: 'https://x.com/iamvibecoder',
      },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '5',
        ratingCount: '129',
        bestRating: '5',
        worstRating: '4',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://xprofilecards.com',
      },
    },
  ],
};

// ---------------- Layout ----------------
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Basic Meta */}
        <meta name="application-name" content="X Profile Cards" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta
          name="google-site-verification"
          content="2jGhq8msvRoHSGWxACTwTMw2ag6hr_wTk_0xhNde2yo"
        />

        {/* Favicon & Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />

        {/* OG Fallback */}
        <meta
          property="og:image"
          content="https://xprofilecards.com/og-cover.png"
        />
        <meta property="og:site_name" content="X Profile Cards" />

        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CYNXJK14L1"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CYNXJK14L1');
          `}
        </Script>
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