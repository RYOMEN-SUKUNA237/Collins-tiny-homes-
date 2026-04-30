'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { Check, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface LandFormProps {
  mode: 'create' | 'edit';
  land?: Record<string, any>;
}

export default function LandForm({ mode, land }: LandFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const initUtilities = (() => {
    if (!land?.utilities) return { water: false, electric: false, sewage: false };
    if (typeof land.utilities === 'object') return land.utilities;
    try { return JSON.parse(land.utilities); } catch { return { water: false, electric: false, sewage: false }; }
  })();

  const [form, setForm] = useState({
    title: land?.title ?? '',
    description: land?.description ?? '',
    price: land?.price ?? '',
    priceType: land?.price_type ?? land?.priceType ?? 'sale',
    acreage: land?.acreage ?? '',
    location: land?.location ?? '',
    state: land?.state ?? '',
    lat: land?.lat ?? '',
    lng: land?.lng ?? '',
    coverImage: land?.cover_image ?? land?.coverImage ?? '',
    terrainType: land?.terrain_type ?? land?.terrainType ?? 'forest',
    zoning: land?.zoning ?? 'residential',
    status: land?.status ?? 'available',
    isFeatured: !!(land?.is_featured ?? land?.isFeatured),
    utilWater: initUtilities.water,
    utilElectric: initUtilities.electric,
    utilSewage: initUtilities.sewage,
  });

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      priceType: form.priceType,
      acreage: Number(form.acreage),
      location: form.location,
      state: form.state,
      coordinates: { lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 },
      coverImage: form.coverImage,
      terrainType: form.terrainType,
      utilities: { water: form.utilWater, electric: form.utilElectric, sewage: form.utilSewage },
      zoning: form.zoning,
      status: form.status,
      isFeatured: form.isFeatured,
    };

    try {
      let res: Response;
      if (mode === 'create') {
        res = await fetch('/api/lands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/lands/${land!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save land parcel');
      }

      const data = await res.json();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (mode === 'create' && data.id) {
        startTransition(() => router.push(`/admin/lands/${data.id}/edit`));
      } else {
        startTransition(() => router.refresh());
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-sage/20 bg-white px-4 py-2.5 text-sm text-charcoal placeholder-charcoal-light/60 focus:border-sage outline-none transition-colors';
  const labelClass = 'block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1.5';
  const sectionClass = 'bg-white rounded-2xl border border-sage/10 shadow-sm p-6 space-y-5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-offwhite/90 backdrop-blur-sm py-3 flex items-center justify-between border-b border-sage/10 -mx-8 px-8 mb-2">
        <Link href="/admin/lands" className="flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Lands
        </Link>
        <div className="flex items-center gap-3">
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}
          {success && (
            <span className="flex items-center gap-1.5 text-sage text-sm font-semibold">
              <Check className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving || isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200 disabled:opacity-60"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === 'create' ? 'Create Parcel' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Basic Information</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Pine Echo Parcel" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Description *</label>
          <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe this land parcel…" className={`${fieldClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Location (City, State) *</label>
            <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bend, OR" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>State (Full) *</label>
            <input required value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Oregon" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitude</label>
            <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="44.0582" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-121.3153" className={fieldClass} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Pricing & Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price ($) *</label>
            <input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="45000" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Listing Type *</label>
            <select value={form.priceType} onChange={e => set('priceType', e.target.value)} className={fieldClass}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent / Lease</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Acreage *</label>
            <input required type="number" min="0" step="0.01" value={form.acreage} onChange={e => set('acreage', e.target.value)} placeholder="2.5" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Terrain Type *</label>
            <select required value={form.terrainType} onChange={e => set('terrainType', e.target.value)} className={fieldClass}>
              <option value="forest">Forest</option>
              <option value="meadow">Meadow</option>
              <option value="desert">Desert</option>
              <option value="lakefront">Lakefront</option>
              <option value="mountain">Mountain</option>
              <option value="coastal">Coastal</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Zoning *</label>
            <select required value={form.zoning} onChange={e => set('zoning', e.target.value)} className={fieldClass}>
              <option value="residential">Residential</option>
              <option value="agricultural">Agricultural</option>
              <option value="mixed">Mixed Use</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldClass}>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Utilities Available</label>
          <div className="flex gap-6 mt-1">
            {(['water', 'electric', 'sewage'] as const).map(util => (
              <label key={util} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as any)[`util${util.charAt(0).toUpperCase() + util.slice(1)}`]}
                  onChange={e => set(`util${util.charAt(0).toUpperCase() + util.slice(1)}`, e.target.checked)}
                  className="w-4 h-4 rounded accent-sage"
                />
                <span className="text-sm text-charcoal capitalize">{util}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => set('isFeatured', !form.isFeatured)}
            className={`w-10 h-6 rounded-full transition-colors duration-200 ${form.isFeatured ? 'bg-sage' : 'bg-gray-200'} relative shrink-0`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isFeatured ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
          <label className="text-sm text-charcoal font-medium">Feature on homepage</label>
        </div>
      </div>

      {/* Images */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Cover Image & Gallery</h2>
        <div className="mb-4">
          <label className={labelClass}>Cover Image URL</label>
          <div className="flex gap-3">
            <input
              value={form.coverImage}
              onChange={e => set('coverImage', e.target.value)}
              placeholder="https://… or /uploads/…"
              className={`${fieldClass} flex-1`}
            />
            {form.coverImage && (
              <img src={form.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover border border-sage/20 shrink-0" />
            )}
          </div>
        </div>
        {land?.id ? (
          <ImageUploader
            entityType="land"
            entityId={land.id}
            onCoverChange={url => set('coverImage', url)}
            coverImage={form.coverImage}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-sage/20 p-6 text-center text-sm text-charcoal-light">
            Save the parcel first, then you can upload gallery images.
          </div>
        )}
      </div>
    </form>
  );
}
