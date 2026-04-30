'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import ListingCard from './ListingCard';
import type { Listing } from '@/lib/types';

interface BentoGridProps {
  saleListings: Listing[];
  rentListings: Listing[];
}

export default function BentoGrid({ saleListings, rentListings }: BentoGridProps) {
  const [activeMode, setActiveMode] = useState<'sale' | 'rent'>('sale');
  const displayed = (activeMode === 'sale' ? saleListings : rentListings).slice(0, 4);

  return (
    <section className="py-24 px-6 bg-offwhite" aria-labelledby="listings-heading">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-sage text-sm font-semibold uppercase tracking-[0.15em] mb-3">
              Curated Listings
            </p>
            <h2
              id="listings-heading"
              className="font-serif text-4xl md:text-5xl text-charcoal font-semibold leading-tight max-w-lg"
            >
              Homes That Feel{' '}
              <span className="italic text-clay">Alive</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center gap-4"
          >
            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-offwhite-dark border border-sage/15">
              {(['sale', 'rent'] as const).map((mode) => (
                <button
                  key={mode}
                  id={`bento-${mode}`}
                  onClick={() => setActiveMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeMode === mode
                      ? 'bg-sage text-white shadow-sm shadow-sage/30'
                      : 'text-charcoal-light hover:text-charcoal'
                  }`}
                >
                  {mode === 'sale' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>

            <Link
              href={`/listings?type=${activeMode}`}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-sage hover:text-sage-dark transition-colors duration-200 group"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
          {displayed.length > 0 ? (
            displayed.map((listing, i) => (
              <div
                key={listing.id}
                className={
                  i === 0
                    ? 'md:col-span-2 lg:col-span-2 lg:row-span-1'
                    : ''
                }
              >
                <ListingCard
                  listing={listing}
                  featured={i === 0}
                  index={i}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sage/10 flex items-center justify-center mb-4">
                <SlidersHorizontal className="w-7 h-7 text-sage" />
              </div>
              <p className="font-serif text-xl text-charcoal mb-2">
                {activeMode === 'rent' ? 'No rentals listed yet' : 'No listings yet'}
              </p>
              <p className="text-charcoal-light text-sm">Check back soon — we curate new homes weekly.</p>
            </div>
          )}
        </div>

        {/* Mobile View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-10 md:hidden"
        >
          <Link
            href={`/listings?type=${activeMode}`}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border-2 border-sage text-sage font-semibold hover:bg-sage hover:text-white transition-all duration-200"
          >
            View All Homes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
