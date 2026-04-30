'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const perks = [
  'No listing fees for the first 30 days',
  'Professional photography support',
  'Nationwide buyer and renter network',
  'Get inquiries within 48 hours',
];

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-offwhite" aria-label="Call to Action">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #4A5D4B 0%, #7D8E7E 50%, #D4A373 100%)' }}
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%),
                                radial-gradient(circle at 80% 20%, rgba(212,163,115,0.4) 0%, transparent 50%)`,
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 p-10 md:p-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-clay-light text-sm font-semibold uppercase tracking-[0.15em] mb-4"
              >
                For Builders & Owners
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-serif text-4xl md:text-5xl text-white font-semibold leading-tight mb-6"
              >
                List Your Tiny Home{' '}
                <span className="italic text-clay-light">Today</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg"
              >
                Join 200+ owners and builders who trust Collins Tiny Homes to connect their craft
                with people ready to live differently.
              </motion.p>

              {/* Perks list */}
              <ul className="flex flex-col gap-3 mb-10 text-left inline-block">
                {perks.map((perk, i) => (
                  <motion.li
                    key={perk}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-center gap-3 text-white/80 text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-clay-light shrink-0" />
                    {perk}
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Image collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hidden lg:grid grid-cols-2 gap-3 w-80 shrink-0"
            >
              {['/listing-1.png', '/listing-2.png', '/listing-5.png', '/listing-4.png'].map(
                (src, i) => (
                  <div
                    key={src}
                    className={`relative overflow-hidden rounded-2xl ${i === 0 ? 'row-span-2 h-64' : 'h-[120px]'}`}
                  >
                    <Image
                      src={src}
                      alt="Tiny home listing"
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                )
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
