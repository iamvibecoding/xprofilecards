import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { ToastContainer } from '@/components/Toast';
import { ThemeProvider } from '@/components/ThemeProvider';

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

// --- ENHANCED METADATA ---
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
    'create twitter cards',
    'profile cards for x',
    'twitter card generator',
    'x card generator',
    'free twitter profile card',
    'best x card generator',
    'free x card maker',
    'how to add twitter cards',
    'x card generator india',
    'usa twitter card generator',
    'uk twitter card generator',
    'mumbai twitter card maker',
    'xprofilecards.com',
    'iamvibecoder',
    'siddhesh kamath',
  ],
  themeColor: '#ffffff',
  alternates: {
    canonical: 'https://xprofilecards.com',
  },
  openGraph: {
    type: 'website',
    url: 'https://xprofilecards.com',
    siteName: 'X Profile Cards',
    title: 'X Profile Cards – 100% Free X (Twitter) Profile Card Generator',
    description:
      'Transform your X profile into a beautiful, shareable card with premium themes.',
    images: [
      {
        url: '/logo.png',
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
      url: 'https://x.com/iamvibecoder',
    },
  ],
};

// --- JSON-LD SCHEMA: FULL SEO OPTIMIZED ---
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://xprofilecards.com/#organization',
      'name': 'X Profile Cards',
      'url': 'https://xprofilecards.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://xprofilecards.com/logo.png',
        'width': 512,
        'height': 512,
      },
      'sameAs': [
        'https://x.com/iamvibecoder',
        'https://github.com/iamvibecoding',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://xprofilecards.com/#website',
      'url': 'https://xprofilecards.com',
      'name': 'X Profile Cards',
      'publisher': { '@id': 'https://xprofilecards.com/#organization' },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://xprofilecards.com/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      'name': 'X Profile Cards',
      'operatingSystem': 'Web',
      'applicationCategory': 'WebApplication',
      'description':
        'A 100% free tool to transform any X (Twitter) profile into beautiful, shareable cards. Choose from 26+ premium themes and download high-quality PNGs instantly.',
      'keywords':
        'x profile cards, create twitter cards, profile cards for x, twitter card generator, free twitter profile card',
      'url': 'https://xprofilecards.com',
      'author': {
        '@type': 'Person',
        'name': 'Siddhesh Kamath',
        'url': 'https://x.com/iamvibecoder',
      },
      'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': 'https://xprofilecards.com',
      },
    },
    {
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Is X Profile Cards free to use?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'Yes, X Profile Cards is a 100% free tool for personal, non-commercial use. You can create and share cards on social media.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Why did I get an error when generating a card?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'Errors can occur if the X (Twitter) profile is private, suspended, or does not exist. It can also happen if the server is busy. Please double-check the handle and try again.',
          },
        },
        {
          '@type': 'Question',
          'name': 'Who is the author of X Profile Cards?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text':
              'This project was created by Siddhesh Kamath. You can find him on X as @iamvibecoder or on GitHub as @iamvibecoding.',
          },
        },
      ],
    },
  ],
};

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
        {/* --- SEO & STRUCTURED DATA --- */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* --- VIEWPORT & VERIFICATION --- */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        /> 
        <meta name="robots" content="index, follow" />
        <meta
          name="google-site-verification"
          content="2jGhq8msvRoHSGWxACTwTMw2ag6hr_wTk_0xhNde2yo"
        />

        {/* --- PRIMARY LOGO FAVICON --- */}
        <link rel="icon" href="/logo.png" type="image/png" />

        {/* --- ADDITIONAL ICONS & MANIFEST --- */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/web-app-manifest-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/web-app-manifest-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/web-app-manifest-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/web-app-manifest-192x192.png"
        />

        {/* --- GOOGLE ANALYTICS --- */}
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