'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, GripVertical, Image as ImageIcon, Star } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  label: string;
  sort_order: number;
}

interface ImageUploaderProps {
  entityType: 'listing' | 'land';
  entityId: string;
  initialImages?: GalleryImage[];
  onCoverChange?: (url: string) => void;
  coverImage?: string;
}

export default function ImageUploader({
  entityType,
  entityId,
  initialImages = [],
  onCoverChange,
  coverImage,
}: ImageUploaderProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const fileArr = Array.from(files);

    for (const file of fileArr) {
      if (!allowed.includes(file.type)) {
        setError(`"${file.name}" is not a supported image type.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds 5MB limit.`);
        return;
      }
    }

    setError(null);
    setUploading(true);

    for (const file of fileArr) {
      try {
        // 1. Upload the file
        const form = new FormData();
        form.append('file', file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: form });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { url } = await uploadRes.json();

        // 2. Register in gallery
        const imageEndpoint = entityType === 'listing'
          ? `/api/images/listings/${entityId}`
          : `/api/images/lands/${entityId}`;

        const imgRes = await fetch(imageEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, label: file.name.replace(/\.[^/.]+$/, '') }),
        });
        if (!imgRes.ok) throw new Error('Failed to register image');
        const { image } = await imgRes.json();

        setImages(prev => [...prev, image]);

        // If no cover yet, set this as cover
        if (!coverImage && onCoverChange) {
          onCoverChange(url);
        }
      } catch (e: any) {
        setError(e.message || 'Upload error');
      }
    }

    setUploading(false);
  }, [entityType, entityId, coverImage, onCoverChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Remove this image?')) return;
    const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setImages(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleLabelChange = async (id: string, label: string) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, label } : i));
    await fetch(`/api/images/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label }),
    });
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    const updated = newImages.map((img, i) => ({ ...img, sort_order: i }));
    setImages(updated);
    for (const img of updated) {
      await fetch(`/api/images/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sort_order: img.sort_order }),
      });
    }
  };

  const handleSetCover = (url: string) => {
    if (onCoverChange) onCoverChange(url);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragging
            ? 'border-sage bg-sage/5 scale-[1.01]'
            : 'border-sage/25 hover:border-sage/50 hover:bg-sage/3'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => e.target.files && uploadFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center">
            {uploading
              ? <div className="w-5 h-5 border-2 border-sage border-t-transparent rounded-full animate-spin" />
              : <Upload className="w-5 h-5 text-sage" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
            </p>
            <p className="text-xs text-charcoal-light mt-1">JPEG, PNG, WebP · Max 5MB each</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, index) => (
            <div key={img.id} className="group relative bg-white border border-sage/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[4/3] bg-offwhite-dark">
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onCoverChange && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(img.url)}
                      title="Set as cover"
                      className={`p-1.5 rounded-lg text-white ${coverImage === img.url ? 'bg-clay' : 'bg-white/20 hover:bg-clay'} transition-colors`}
                    >
                      <Star className="w-3.5 h-3.5" fill={coverImage === img.url ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      title="Move up"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    title="Delete image"
                    className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Cover badge */}
                {coverImage === img.url && (
                  <div className="absolute top-2 left-2 bg-clay text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                    Cover
                  </div>
                )}
              </div>
              <div className="p-2">
                <input
                  type="text"
                  value={img.label}
                  onChange={e => handleLabelChange(img.id, e.target.value)}
                  className="w-full text-xs text-charcoal bg-transparent border-b border-sage/20 focus:border-sage outline-none pb-0.5 transition-colors"
                  placeholder="Label…"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 text-charcoal-light text-sm p-4 bg-offwhite-dark/60 rounded-xl">
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>No images yet. Upload images using the area above.</span>
        </div>
      )}
    </div>
  );
}
