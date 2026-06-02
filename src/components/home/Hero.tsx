'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, ChevronDown } from 'lucide-react';

export default function Hero() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'buy' | 'rent'>('buy');
  const [budget, setBudget] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('type', activeMode === 'buy' ? 'sale' : 'rent');
    if (budget) {
      const [min, max] = budget.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <section className="hero-container relative min-h-screen flex flex-col" aria-label="Hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png"
          alt="A beautiful tiny home nestled in a forest at golden hour"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="gradient-hero absolute inset-0" />
        {/* Texture overlay for warmth */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-white/90 text-xs font-medium tracking-wider uppercase mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
          200+ Tiny Homes Nationwide
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-semibold tracking-tight text-balance max-w-5xl mb-6"
        >
          Find Your{' '}
          <span className="italic text-clay">Tiny</span>
          <br />
          Dream Home
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-white/75 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed font-light"
        >
          Handcrafted tiny homes for sale and rent. Off-grid retreats, lakefront cabins,
          and wandering THOWs — curated with purpose, priced with transparency.
        </motion.p>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="w-full max-w-2xl"
        >
          {/* Buy / Rent Toggle */}
          <div className="flex justify-center mb-4">
            <div className="relative flex items-center gap-1 p-1 rounded-2xl glass-dark">
              {/* Animated pill */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl bg-sage shadow-lg"
                animate={{ x: activeMode === 'buy' ? 4 : 112 }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                style={{ width: 104 }}
              />
              <button
                id="mode-buy"
                onClick={() => setActiveMode('buy')}
                className={`relative z-10 px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  activeMode === 'buy' ? 'text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                Buy
              </button>
              <button
                id="mode-rent"
                onClick={() => setActiveMode('rent')}
                className={`relative z-10 px-8 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  activeMode === 'rent' ? 'text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                Rent
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="glass rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
            {/* Price filter */}
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-offwhite-dark/60 transition-colors">
              <span className="text-sage text-sm font-medium">Budget</span>
              <select
                id="budget-filter"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1 bg-transparent text-charcoal-light text-sm outline-none cursor-pointer"
              >
                <option value="">Any price</option>
                {activeMode === 'buy' ? (
                  <>
                    <option value="15000-30000">$15k – $30k</option>
                    <option value="30000-45000">$30k – $45k</option>
                    <option value="45000-60000">$45k – $60k</option>
                  </>
                ) : (
                  <>
                    <option value="0-500">Under $500/mo</option>
                    <option value="500-1000">$500 – $1,000/mo</option>
                    <option value="1000-2000">$1,000+/mo</option>
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-charcoal-light/60 shrink-0" />
            </div>

            <div className="w-px bg-sage/20 hidden sm:block self-stretch" />

            {/* Search button */}
            <button
              onClick={handleSearch}
              id="search-cta"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sage text-white font-semibold text-sm shadow-lg shadow-sage/30 hover:bg-sage-dark hover:shadow-sage/50 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Quick filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-2 mt-4"
          >
            {['🌲 Forest', '🏔️ Mountains', '🌊 Coastal', '🌵 Desert', '⚡ Off-Grid'].map(
              (tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 rounded-full glass-dark text-white/80 text-xs font-medium hover:text-white hover:bg-white/15 transition-all duration-200"
                >
                  {tag}
                </button>
              )
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 flex justify-center pb-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/50"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
