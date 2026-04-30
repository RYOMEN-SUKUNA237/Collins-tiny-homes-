'use client';

import { motion } from 'motion/react';
import { Sun, Droplets, Leaf, Users, Star, Globe } from 'lucide-react';

const features = [
  {
    icon: Sun,
    emoji: '☀️',
    title: 'Solar-First Homes',
    description:
      'Every listing includes detailed solar specs — wattage, battery storage, and monthly output estimates — so you know exactly what you\'re getting.',
    color: 'clay',
    span: 'col-span-1',
  },
  {
    icon: Droplets,
    emoji: '💧',
    title: 'Water Independence',
    description:
      'From rainwater collection to gravity-fed springs, we catalogue every water system for complete transparency.',
    color: 'sage',
    span: 'col-span-1',
  },
  {
    icon: Leaf,
    emoji: '🌿',
    title: 'Sustainability Score',
    description:
      'Our proprietary Off-Grid Score rates each home across solar, water, waste, and insulation — 0 to 100.',
    color: 'sage-dark',
    span: 'col-span-1 md:col-span-2 lg:col-span-1',
  },
  {
    icon: Users,
    emoji: '🤝',
    title: 'Verified Community',
    description:
      'Every builder and seller is vetted. We partner only with NATHO-certified builders and community-reviewed hosts.',
    color: 'clay',
    span: 'col-span-1',
  },
  {
    icon: Star,
    emoji: '⭐',
    title: 'Concierge Support',
    description:
      'From your first inquiry to closing day, our tiny home specialists guide you through every step of the journey.',
    color: 'sage',
    span: 'col-span-1',
  },
  {
    icon: Globe,
    emoji: '🗺️',
    title: 'Nationwide Network',
    description:
      'Listings in all 50 states. Filter by region, climate, zoning laws, and HOA restrictions — all in one search.',
    color: 'clay',
    span: 'col-span-1',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-cream" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <p className="text-clay text-sm font-semibold uppercase tracking-[0.15em] mb-3">
            Why Collins
          </p>
          <h2
            id="features-heading"
            className="font-serif text-4xl md:text-5xl text-charcoal font-semibold leading-tight max-w-2xl mx-auto"
          >
            Built for People Who{' '}
            <span className="italic text-sage">Live Intentionally</span>
          </h2>
          <p className="text-charcoal-light mt-5 text-lg max-w-xl mx-auto leading-relaxed">
            Tiny living is a philosophy. We built a marketplace that respects that — with the
            details, data, and community to match.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`${feature.span} group`}
              >
                <div className="h-full p-7 rounded-2xl bg-white border border-sage/10 shadow-sm hover:shadow-md hover:border-sage/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-sage/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sage/20 transition-all duration-300">
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-charcoal-light text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
