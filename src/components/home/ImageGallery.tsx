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
        className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden bg-charcoal/5 group border border-sage/10 cursor-pointer shadow-lg shadow-sage/5"
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
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-charcoal border border-sage/10 px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 shadow-md">
          <Maximize2 className="w-3.5 h-3.5 text-sage" />
          <span>Expand View</span>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md text-charcoal hover:text-sage flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 border border-sage/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md text-charcoal hover:text-sage flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 border border-sage/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicator Badge */}
        <div className="absolute bottom-4 left-4 bg-charcoal/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono tracking-widest text-white/90">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-sage/20 scrollbar-track-transparent">
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
            className="fixed inset-0 z-[110] bg-charcoal/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-[120]"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Wrapper */}
            <div className="relative w-full max-w-5xl h-[70vh] md:h-[80vh] flex items-center justify-center">
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
                    className="absolute -left-4 md:left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-2xl transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute -right-4 md:right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-2xl transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector in Lightbox */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-charcoal-light/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 max-w-[90vw] overflow-x-auto flex gap-2">
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
