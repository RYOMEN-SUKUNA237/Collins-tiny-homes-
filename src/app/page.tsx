import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/home/Hero';
import BentoGrid from '@/components/home/BentoGrid';
import FeaturesSection from '@/components/home/FeaturesSection';
import StatsBar from '@/components/home/StatsBar';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/ui/Footer';
import { getAllListings } from '@/lib/db';
import { dbRowToListing } from '@/lib/db-adapter';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch from the live DB — prefer featured listings; fall back to all active
  const allRows = await getAllListings({ status: 'active' }) as any[];
  const allListings = allRows.map(dbRowToListing);

  const saleListings = allListings
    .filter((l) => l.priceType === 'sale' || l.priceType === 'both')
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  const rentListings = allListings
    .filter((l) => l.priceType === 'rent' || l.priceType === 'both')
    .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BentoGrid saleListings={saleListings} rentListings={rentListings} />
        <FeaturesSection />
        <StatsBar />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
