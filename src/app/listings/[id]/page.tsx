import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getListingById, getListingImages } from '@/lib/db';
import { dbRowToListing } from '@/lib/db-adapter';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import OffGridBadge from '@/components/home/OffGridBadge';
import ListingActions from '@/components/home/ListingActions';
import {
  MapPin, Maximize2, Bed, Bath, Zap, Droplets, Thermometer,
  Trash2, ChevronLeft, Sun, Home,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getListingById(id) as any;
  if (!row) return { title: 'Listing Not Found' };
  return {
    title: row.title,
    description: (row.description as string).slice(0, 160),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getListingById(id) as any;
  if (!row) notFound();

  const listing = dbRowToListing(row);

  const galleryRows = await getListingImages(id) as any[];
  const allImages = [
    listing.coverImage,
    ...galleryRows.map((r) => r.url).filter((url) => url && url !== listing.coverImage),
  ].filter(Boolean);

  const isRent = listing.priceType === 'rent';
  const isBoth = listing.priceType === 'both';

  const specItems = [
    { icon: Sun, label: 'Solar', value: listing.specs.solarWattage ? `${listing.specs.solarWattage}W` : 'None' },
    { icon: Droplets, label: 'Water', value: listing.specs.waterSystem ?? 'Municipal' },
    { icon: Thermometer, label: 'Insulation', value: listing.specs.insulationRValue ? `R-${listing.specs.insulationRValue}` : 'Standard' },
    { icon: Trash2, label: 'Toilet', value: listing.specs.toiletType ?? 'Standard' },
    { icon: Home, label: 'Lofts', value: (listing.specs.loftCount ?? 0).toString() },
    { icon: Zap, label: 'Heating', value: listing.specs.heatingType ?? 'Electric' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/listings"
            className="flex items-center gap-2 text-sm text-charcoal-light hover:text-sage transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to listings
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              {allImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden">
                  <div className="col-span-2 relative h-80 md:h-96 bg-offwhite-dark">
                    {allImages[0] && (
                      <Image
                        src={allImages[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        unoptimized={allImages[0].startsWith('https://images.unsplash.com')}
                      />
                    )}
                  </div>
                  {allImages.slice(1, 3).map((src, i) => (
                    <div key={i} className="relative h-48 bg-offwhite-dark">
                      <Image
                        src={src}
                        alt={`${listing.title} view ${i + 2}`}
                        fill
                        className="object-cover"
                        unoptimized={src.startsWith('https://images.unsplash.com')}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Header */}
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${isRent ? 'bg-clay/15 text-clay-dark' : isBoth ? 'bg-gradient-to-r from-sage/20 to-clay/20 text-charcoal' : 'bg-sage/15 text-sage-dark'}`}>
                        {isRent ? 'For Rent' : isBoth ? 'For Sale & Rent' : 'For Sale'}
                      </span>
                      {listing.homeType === 'on-wheels' && (
                        <span className="px-3 py-1 rounded-lg bg-charcoal/10 text-charcoal text-xs font-medium">🚐 THOW</span>
                      )}
                    </div>
                    <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-semibold">{listing.title}</h1>
                  </div>
                  <OffGridBadge score={listing.offGridScore} />
                </div>

                <div className="flex items-center gap-1.5 text-charcoal-light text-sm mb-6">
                  <MapPin className="w-4 h-4 text-sage" />
                  {listing.location}
                </div>

                <div className="flex flex-wrap gap-5 text-sm text-charcoal pb-6 border-b border-sage/10">
                  <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4 text-sage" />{listing.sqft} sqft</span>
                  <span className="flex items-center gap-1.5"><Bed className="w-4 h-4 text-sage" />{listing.bedrooms} bedroom</span>
                  <span className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-sage" />{listing.bathrooms} bathroom</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-serif text-2xl text-charcoal font-semibold mb-4">About This Home</h2>
                <p className="text-charcoal-light leading-relaxed">{listing.description}</p>
              </div>

              {/* Spec Bento Box */}
              <div>
                <h2 className="font-serif text-2xl text-charcoal font-semibold mb-5">Tech Specs</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="p-5 rounded-2xl bg-white border border-sage/10 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-sage/10 flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4 text-sage" />
                      </div>
                      <p className="text-[11px] text-charcoal-light uppercase tracking-wider font-medium mb-1">{label}</p>
                      <p className="text-charcoal font-semibold text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl text-charcoal font-semibold mb-5">Amenities</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {listing.amenities.map((a) => (
                      <span key={a} className="px-4 py-2 rounded-xl bg-sage/10 text-sage-dark text-sm font-medium border border-sage/15">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Floating Action Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price Summary + Payment Buttons */}
                <div className="rounded-2xl border border-sage/15 shadow-xl p-7 bg-white">
                  <p className="text-[11px] text-charcoal-light uppercase tracking-wider font-medium mb-1">
                    {isRent ? 'per month' : isBoth ? 'sale / rent' : 'asking price'}
                  </p>
                  <p className="font-serif text-4xl font-bold text-charcoal mb-1 flex items-baseline gap-2 flex-wrap">
                    ${listing.price.toLocaleString()}
                    {isBoth && listing.monthlyRent && (
                      <span className="text-xl font-medium text-charcoal-light">
                        / ${listing.monthlyRent.toLocaleString()}/mo
                      </span>
                    )}
                  </p>
                  {listing.downPaymentPct && listing.priceType !== 'rent' ? (
                    <p className="text-xs text-charcoal-light mb-6">
                      {listing.downPaymentPct}% down = ${((listing.price * listing.downPaymentPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      {listing.financeTermMonths ? ` · ${listing.financeTermMonths} months` : ''}
                    </p>
                  ) : (
                    <div className="mb-6" />
                  )}

                  <ListingActions
                    listingId={listing.id}
                    listingTitle={listing.title}
                    price={listing.price}
                    monthlyRent={listing.monthlyRent}
                    downPaymentPct={listing.downPaymentPct}
                    financeTermMonths={listing.financeTermMonths}
                    priceType={listing.priceType}
                  />
                </div>

                {/* Off-grid detail card */}
                <div className="p-5 rounded-2xl bg-sage/5 border border-sage/15">
                  <div className="flex items-center gap-3 mb-3">
                    <OffGridBadge score={listing.offGridScore} />
                    <div>
                      <p className="font-semibold text-charcoal text-sm">Off-Grid Score</p>
                      <p className="text-xs text-charcoal-light">{listing.offGridScore}/10</p>
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-light leading-relaxed">
                    Our score rates solar, water independence, insulation, and waste systems.
                    {listing.offGridScore >= 8 ? ' This home is highly self-sufficient.' :
                     listing.offGridScore >= 5 ? ' This home is moderately self-sufficient.' :
                     ' This home relies partially on grid utilities.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
