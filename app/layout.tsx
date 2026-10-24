import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getProfile } from '@/lib/data';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const brand = profile?.brand_name ?? 'Mesca CL';
  const name = profile?.full_name ?? 'Chineke Olisadubem Louis';
  const description =
    profile?.short_bio ??
    'Personal brand website of Mesca CL — technology, AI and entrepreneurship journey.';

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: {
      default: `${brand} — ${name}`,
      template: `%s | ${brand}`,
    },
    description,
    keywords: [
      'Mesca CL',
      'Chineke Olisadubem Louis',
      'software engineer',
      'AI',
      'artificial intelligence',
      'entrepreneur',
      'Nigeria',
      'Enugu',
      'personal brand',
    ],
    authors: [{ name }],
    creator: name,
    openGraph: {
      type: 'website',
      locale: 'en_NG',
      siteName: brand,
      title: `${brand} — ${name}`,
      description,
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand} — ${name}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    icons: {
      icon: '/favicon.svg',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable} bg-background text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
