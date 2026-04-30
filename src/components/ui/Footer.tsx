'use client';

import Link from 'next/link';
import { Home, Globe, Share2, Play, Mail } from 'lucide-react';

const footerLinks = {
  Browse: [
    { label: 'Homes for Sale', href: '/listings?type=sale' },
    { label: 'Homes for Rent', href: '/listings?type=rent' },
    { label: 'On Wheels (THOW)', href: '/listings?homeType=on-wheels' },
    { label: 'Off-Grid Homes', href: '/listings?minOffGrid=80' },
    { label: 'Map View', href: '/map' },
  ],
  Company: [
    { label: 'About Collins', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Careers', href: '/careers' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Buyer Guide', href: '/guides/buying' },
    { label: 'Renter Guide', href: '/guides/renting' },
    { label: 'FAQ', href: '/faq' },
  ],
};

const socials = [
  { icon: Globe, href: '#', label: 'Instagram' },
  { icon: Share2, href: '#', label: 'Twitter' },
  { icon: Play, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center shadow-lg shadow-sage/30">
                <Home className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg text-white font-semibold tracking-tight">Collins</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-sage-light font-medium">
                  Tiny Homes
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              The premium marketplace for buying and renting handcrafted tiny homes. Live
              intentionally. Tread lightly. Find your place.
            </p>

            {/* Newsletter */}
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
                Get new listings in your inbox
              </p>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-sage/50 transition-colors">
                  <Mail className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-white/80 text-sm placeholder:text-white/25 outline-none"
                  />
                </div>
                <button
                  id="newsletter-submit"
                  className="px-4 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold hover:bg-sage-dark transition-colors duration-200 shrink-0"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/45 text-sm hover:text-white/90 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Collins Tiny Homes. All rights reserved.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-sage/20 hover:border-sage/30 transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <div className="flex gap-6 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white/60 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
