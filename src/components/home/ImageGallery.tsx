'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div 
        onClick={() => setLightboxOpen(true)}
        className="group relative h-[260px] w-full cursor-pointer overflow-hidden rounded-2xl border border-sage/10 bg-charcoal/5 shadow-lg shadow-sage/5 sm:h-[360px] sm:rounded-3xl md:h-[500px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIdx]}
              alt={`${title} - image ${activeIdx + 1}`}
              fill
              priority
              className="object-cover"
              unoptimized={images[activeIdx].startsWith('https://images.unsplash.com')}
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Zoom Button */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl border border-sage/10 bg-white/90 px-3 py-2 text-xs font-semibold text-charcoal opacity-100 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 sm:right-4 sm:top-4 sm:rounded-2xl sm:opacity-0 sm:group-hover:opacity-100">
          <Maximize2 className="w-3.5 h-3.5 text-sage" />
          <span className="hidden sm:inline">Expand View</span>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-sage/10 bg-white/90 text-charcoal opacity-100 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:text-sage sm:left-4 sm:h-11 sm:w-11 sm:rounded-2xl sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-sage/10 bg-white/90 text-charcoal opacity-100 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:text-sage sm:right-4 sm:h-11 sm:w-11 sm:rounded-2xl sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Badge */}
        <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-charcoal/70 px-3 py-1.5 font-mono text-[11px] tracking-widest text-white/90 backdrop-blur-md sm:bottom-4 sm:left-4">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex w-full max-w-full gap-2.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-sage/20 scrollbar-track-transparent">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`relative h-20 w-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:-translate-y-0.5 shadow-sm bg-charcoal/5 ${
                activeIdx === i ? 'border-sage ring-4 ring-sage/15' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                unoptimized={src.startsWith('https://images.unsplash.com')}
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-charcoal/95 p-3 backdrop-blur-md sm:p-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-[120] flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition-all hover:bg-white/20 sm:right-6 sm:top-6 sm:h-12 sm:w-12 sm:rounded-2xl"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Wrapper */}
            <div className="relative flex h-[68dvh] w-full max-w-5xl items-center justify-center md:h-[80vh]">
              <Image
                src={images[activeIdx]}
                alt={`${title} expanded`}
                fill
                className="object-contain"
                unoptimized={images[activeIdx].startsWith('https://images.unsplash.com')}
              />

              {/* Navigation inside Modal */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xl transition-all hover:bg-white/20 md:left-4 md:h-14 md:w-14 md:rounded-2xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl bg-white/10 text-white shadow-2xl transition-all hover:bg-white/20 md:right-4 md:h-14 md:w-14 md:rounded-2xl"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector in Lightbox */}
            <div className="absolute bottom-4 left-1/2 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-charcoal-light/30 p-2 backdrop-blur-md sm:bottom-6 sm:p-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative h-12 w-16 rounded-xl overflow-hidden border transition-all ${
                    activeIdx === i ? 'border-white scale-105' : 'border-transparent opacity-55 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={src.startsWith('https://images.unsplash.com')}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
