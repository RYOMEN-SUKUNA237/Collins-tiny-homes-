'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'Browse Homes', href: '/listings' },
  { label: 'Rentals', href: '/listings?type=rent' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-md shadow-sage/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center shadow-lg shadow-sage/30 group-hover:scale-110 transition-transform duration-300">
              <Home className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className={`font-serif text-lg font-semibold tracking-tight transition-colors duration-300 ${
                  scrolled ? 'text-charcoal' : 'text-white'
                }`}
              >
                Collins
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.12em] font-medium transition-colors duration-300 ${
                  scrolled ? 'text-sage' : 'text-clay-light'
                }`}
              >
                Tiny Homes
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium tracking-wide hover:text-clay transition-colors duration-200 ${
                    scrolled ? 'text-charcoal-light' : 'text-white/90'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark hover:shadow-sage/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              List Your Home
            </Link>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-200 ${
                scrolled ? 'hover:bg-offwhite-dark text-charcoal' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-offwhite shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-offwhite-dark">
                <span className="font-serif text-xl text-charcoal">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-offwhite-dark transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-charcoal-light" />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-2">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal font-medium hover:bg-sage/10 hover:text-sage transition-colors duration-200"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90 text-sage" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-6 border-t border-offwhite-dark">
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-sage text-white font-semibold text-sm shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200"
                >
                  List Your Home
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
