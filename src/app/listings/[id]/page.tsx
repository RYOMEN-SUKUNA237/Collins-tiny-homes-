import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListingById, getListingImages } from '@/lib/db';
import { dbRowToListing } from '@/lib/db-adapter';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import OffGridBadge from '@/components/home/OffGridBadge';
import ListingActions from '@/components/home/ListingActions';
import ImageGallery from '@/components/home/ImageGallery';
import {
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Zap,
  Droplets,
  Thermometer,
  Trash2,
  ChevronLeft,
  Sun,
  Home,
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
      <main className="pt-16 sm:pt-20">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href="/listings"
            className="flex items-center gap-2 text-sm text-charcoal-light transition-colors hover:text-sage"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to listings
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10 min-w-0 overflow-x-hidden">
            <div className="min-w-0 space-y-8 lg:col-span-2">
              <ImageGallery images={allImages} title={listing.title} />

              <div>
                <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wide ${isRent ? 'bg-clay/15 text-clay-dark' : isBoth ? 'bg-gradient-to-r from-sage/20 to-clay/20 text-charcoal' : 'bg-sage/15 text-sage-dark'}`}>
                        {isRent ? 'For Rent' : isBoth ? 'For Sale & Rent' : 'For Sale'}
                      </span>
                      {listing.homeType === 'on-wheels' && (
                        <span className="rounded-lg bg-charcoal/10 px-3 py-1 text-xs font-medium text-charcoal">THOW</span>
                      )}
                    </div>
                    <h1 className="font-serif text-3xl font-semibold text-charcoal sm:text-4xl">
                      {listing.title}
                    </h1>
                  </div>
                  <OffGridBadge score={listing.offGridScore} />
                </div>

                <div className="mb-6 flex items-start gap-1.5 text-sm text-charcoal-light">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  <span className="min-w-0">{listing.location}</span>
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-sage/10 pb-6 text-sm text-charcoal min-[420px]:grid-cols-3">
                  <span className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4 text-sage" />{listing.sqft} sqft</span>
                  <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-sage" />{listing.bedrooms} bedroom</span>
                  <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-sage" />{listing.bathrooms} bathroom</span>
                </div>
              </div>

              <div>
                <h2 className="mb-4 font-serif text-2xl font-semibold text-charcoal">About This Home</h2>
                <p className="leading-relaxed text-charcoal-light">{listing.description}</p>
              </div>

              <div>
                <h2 className="mb-5 font-serif text-2xl font-semibold text-charcoal">Tech Specs</h2>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3">
                  {specItems.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="rounded-2xl border border-white/60 glass-card p-5 shadow-sm hover:shadow-md hover:border-white/90 hover:shadow-sage/5 transition-all duration-300">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sage/10">
                        <Icon className="h-4 w-4 text-sage" />
                      </div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-charcoal-light">{label}</p>
                      <p className="text-sm font-semibold text-charcoal">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {listing.amenities.length > 0 && (
                <div>
                  <h2 className="mb-5 font-serif text-2xl font-semibold text-charcoal">Amenities</h2>
                  <div className="flex flex-wrap gap-2.5">
                    {listing.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-xl border border-sage/15 bg-sage/10 px-4 py-2 text-sm font-medium text-sage-dark">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 lg:col-span-1">
              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-white/60 glass-card p-5 shadow-xl sm:p-7">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-charcoal-light">
                    {isRent ? 'per month' : isBoth ? 'sale / rent' : 'asking price'}
                  </p>
                  <p className="mb-1 flex flex-wrap items-baseline gap-2 font-serif text-3xl font-bold text-charcoal sm:text-4xl">
                    ${listing.price.toLocaleString()}
                    {isBoth && listing.monthlyRent && (
                      <span className="text-lg font-medium text-charcoal-light sm:text-xl">
                        / ${listing.monthlyRent.toLocaleString()}/mo
                      </span>
                    )}
                  </p>
                  {listing.downPaymentPct && listing.priceType !== 'rent' ? (
                    <p className="mb-6 text-xs text-charcoal-light">
                      {listing.downPaymentPct}% down = ${((listing.price * listing.downPaymentPct) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      {listing.financeTermMonths ? ` - ${listing.financeTermMonths} months` : ''}
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
                    homeType={listing.homeType}
                  />
                </div>

                <div className="rounded-2xl border border-white/50 glass p-5 shadow-inner">
                  <div className="mb-3 flex items-center gap-3">
                    <OffGridBadge score={listing.offGridScore} />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">Off-Grid Score</p>
                      <p className="text-xs text-charcoal-light">{listing.offGridScore}/10</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-charcoal-light">
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
