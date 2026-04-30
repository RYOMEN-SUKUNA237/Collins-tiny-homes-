import type { Metadata } from 'next';
import { inter, playfair } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Collins Tiny Homes — Buy & Rent Tiny Homes',
    template: '%s | Collins Tiny Homes',
  },
  description:
    'Discover handcrafted tiny homes for sale and rent across the United States. From off-grid forest retreats to coastal cottages — find your perfect tiny living space with Collins Tiny Homes.',
  keywords: ['tiny homes', 'tiny house', 'THOW', 'off-grid', 'tiny house for sale', 'tiny house rental'],
  openGraph: {
    title: 'Collins Tiny Homes — Buy & Rent Tiny Homes',
    description: 'Discover handcrafted tiny homes for sale and rent across the United States.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} scroll-smooth`}
    >
      <body className="font-sans bg-[#FAFAF9] text-[#2D2D2D] antialiased">
        {children}
      </body>
    </html>
  );
}
