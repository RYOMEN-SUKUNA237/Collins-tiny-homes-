import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import ListingCard from '@/components/home/ListingCard';
import { SlidersHorizontal } from 'lucide-react';
import { getAllListings } from '@/lib/db';
import { dbRowToListing } from '@/lib/db-adapter';

export const metadata: Metadata = {
  title: 'Browse Tiny Homes',
  description: 'Browse all tiny homes for sale and rent on Collins Tiny Homes.',
};

export const dynamic = 'force-dynamic';

interface ListingsPageProps {
  searchParams: Promise<{ type?: string; homeType?: string; minOffGrid?: string; minPrice?: string; maxPrice?: string; search?: string }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const params = await searchParams;
  const mode = params.type === 'rent' ? 'rent' : 'sale';
  const homeTypeFilter = params.homeType;
  const minOffGrid = params.minOffGrid ? parseInt(params.minOffGrid) : 0;
  const minPrice = params.minPrice ? parseInt(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice) : undefined;
  const searchQuery = params.search;

  // Pull from Supabase DB
  const rows = await getAllListings({
    priceType: mode,
    homeType: homeTypeFilter,
    minOffGrid: minOffGrid > 0 ? minOffGrid : undefined,
    status: 'active',
    minPrice,
    maxPrice,
    search: searchQuery,
  }) as any[];

  const listings = rows.map(dbRowToListing);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="font-serif text-4xl text-charcoal font-semibold">
                {mode === 'sale' ? 'Homes for Sale' : 'Homes for Rent'}
              </h1>
              <p className="text-charcoal-light mt-2">{listings.length} listing{listings.length !== 1 ? 's' : ''} found</p>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-offwhite-dark border border-sage/15">
                <Link
                  href="/listings?type=sale"
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === 'sale' ? 'bg-sage text-white shadow-sm' : 'text-charcoal-light hover:text-charcoal'
                  }`}
                >
                  Buy
                </Link>
                <Link
                  href="/listings?type=rent"
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    mode === 'rent' ? 'bg-clay text-white shadow-sm' : 'text-charcoal-light hover:text-charcoal'
                  }`}
                >
                  Rent
                </Link>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {[
              { label: 'All Types', href: `/listings?type=${mode}` },
              { label: 'On Wheels (THOW)', href: `/listings?type=${mode}&homeType=on-wheels` },
              { label: 'Foundation', href: `/listings?type=${mode}&homeType=foundation` },
              { label: 'Off-Grid (7+)', href: `/listings?type=${mode}&minOffGrid=7` },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  (label === 'On Wheels (THOW)' && homeTypeFilter === 'on-wheels') ||
                  (label === 'Foundation' && homeTypeFilter === 'foundation') ||
                  (label === 'Off-Grid (7+)' && minOffGrid >= 7)
                    ? 'border-sage bg-sage text-white'
                    : (label === 'All Types' && !homeTypeFilter && minOffGrid === 0)
                    ? 'border-sage text-sage'
                    : 'border-sage/20 text-charcoal-light hover:border-sage hover:text-sage'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Grid */}
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-32 text-center">
              <div className="w-20 h-20 rounded-2xl bg-sage/10 flex items-center justify-center mb-6">
                <SlidersHorizontal className="w-9 h-9 text-sage" />
              </div>
              <h2 className="font-serif text-2xl text-charcoal mb-3">No homes found</h2>
              <p className="text-charcoal-light mb-8">
                {mode === 'rent'
                  ? 'No rentals listed yet — check back soon.'
                  : 'No homes for sale right now — try adjusting your filters.'}
              </p>
              <Link href="/listings" className="px-6 py-3 rounded-xl bg-sage text-white font-semibold hover:bg-sage-dark transition-colors">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
