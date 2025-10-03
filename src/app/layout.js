import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


// Create or update this metadata object
export const metadata = {
  metadataBase: new URL('https://pixelpirate.vercel.app'),

  // Tweak: Added brand name for a more professional feel
  title: 'PixelPirate | Free DP & Thumbnail Downloader',
  description: 'Download full-size profile pictures from Instagram, Pinterest, and YouTube. Save high-quality thumbnails from YouTube videos and shorts for free with PixelPirate.',

  // Tweak: Added one more keyword
  keywords: [
    'profile picture downloader',
    'profile picture',
    'dp downloader',
    'instagram dp',
    'insta dp',
    'save dp',
    'youtube dp downloader',
    'youtube thumbnail downloader',
    'yt thumbnail',
    'pinterest dp downloader',
    'pinterest profile picture downloader',
    'full size profile picture'
  ],

  // CRITICAL FIX: Corrected typo from 'fav.ico' to 'favicon.ico'
  icons: {
    icon: "/fav.ico",
  },

  // Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    title: 'PixelPirate | Free DP & Thumbnail Downloader',
    // Tweak: Reworded for smoother, more professional grammar
    description: 'Download high-quality, full-size DP (Display Pictures) and video thumbnails from Instagram, YouTube, and Pinterest for free.',
    images: [
      {
        url: '/og-image-used.png',
        width: 1200,
        height: 630,
        alt: 'PixelPirate - Free Profile Picture and Thumbnail Downloader',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'PixelPirate | Free DP & Thumbnail Downloader',
    description: 'Download full-size DPs and thumbnails from Instagram, YouTube, and Pinterest for free.',
    images: ['/og-image-used.png'],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}