'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { MapPin, Maximize2, Bed, Bath, Zap } from 'lucide-react';
import { Listing } from '@/lib/types';
import OffGridBadge from './OffGridBadge';

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
  index?: number;
}

export default function ListingCard({ listing, featured = false, index = 0 }: ListingCardProps) {
  const isRent = listing.priceType === 'rent';
  const isBoth = listing.priceType === 'both';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/listings/${listing.id}`} className="block h-full group">
        <article
          className={`listing-card relative overflow-hidden rounded-2xl bg-white border border-sage/10 shadow-sm h-full flex flex-col ${
            featured ? 'min-h-[520px]' : 'min-h-[380px]'
          }`}
        >
          {/* Image */}
          <div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-52'}`}>
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-500 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-5 py-2 rounded-xl glass text-charcoal text-sm font-semibold shadow-lg">
                View Details →
              </span>
            </div>

            {/* Top badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide shadow ${
                  isRent
                    ? 'bg-clay text-white'
                    : isBoth
                    ? 'bg-gradient-to-r from-sage to-clay text-white'
                    : 'bg-sage text-white'
                }`}
              >
                {isRent ? 'Rent' : isBoth ? 'Sale & Rent' : 'For Sale'}
              </span>
              {listing.homeType === 'on-wheels' && (
                <span className="px-2.5 py-1 rounded-lg bg-charcoal/70 text-white text-xs font-medium backdrop-blur-sm">
                  🚐 THOW
                </span>
              )}
            </div>

            {/* Off-grid score badge top right */}
            <div className="absolute top-3 right-3">
              <OffGridBadge score={listing.offGridScore} compact />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-5">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-charcoal-light text-xs font-medium mb-2">
              <MapPin className="w-3 h-3 text-sage" />
              {listing.location}
            </div>

            {/* Title */}
            <h3
              className={`font-serif text-charcoal font-semibold leading-snug mb-3 group-hover:text-sage-dark transition-colors duration-200 ${
                featured ? 'text-2xl' : 'text-lg'
              }`}
            >
              {listing.title}
            </h3>

            {/* Description – only for featured */}
            {featured && (
              <p className="text-charcoal-light text-sm leading-relaxed mb-4 line-clamp-2">
                {listing.description}
              </p>
            )}

            {/* Specs row */}
            <div className="flex items-center gap-4 text-xs text-charcoal-light mt-auto mb-4">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-sage" />
                {listing.sqft.toLocaleString()} sqft
              </span>
              <span className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-sage" />
                {listing.bedrooms} bed
              </span>
              <span className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-sage" />
                {listing.bathrooms} bath
              </span>
              {listing.specs.solarWattage && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-clay" />
                  {listing.specs.solarWattage >= 1000
                    ? `${(listing.specs.solarWattage / 1000).toFixed(1)}kW`
                    : `${listing.specs.solarWattage}W`}
                </span>
              )}
            </div>

            {/* Price + CTA */}
            <div className="flex items-end justify-between border-t border-sage/10 pt-4">
              <div>
                <p className="text-[11px] text-charcoal-light uppercase tracking-wider font-medium mb-0.5">
                  {isRent ? 'per night' : isBoth ? 'sale / rent' : 'asking price'}
                </p>
                <p className="font-serif text-2xl font-bold text-charcoal flex items-baseline gap-1">
                  ${isRent ? listing.price.toLocaleString() : (listing.price / 1000).toFixed(0) + 'k'}
                  {isBoth && listing.monthlyRent && (
                    <span className="text-sm font-medium text-charcoal-light">
                      / ${listing.monthlyRent}/mo
                    </span>
                  )}
                </p>
              </div>
              <span className="text-xs font-semibold text-sage border border-sage/30 px-3 py-1.5 rounded-xl group-hover:bg-sage group-hover:text-white group-hover:border-sage transition-all duration-200">
                {isRent ? 'Book Stay' : 'View Home'}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
