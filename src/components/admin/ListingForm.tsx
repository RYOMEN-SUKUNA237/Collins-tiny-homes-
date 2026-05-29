'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { Check, ChevronDown, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const AMENITY_OPTIONS = [
  'Loft', 'Deck', 'Hot Tub', 'Fireplace', 'Air Conditioning', 'Pet Friendly',
  'Washer/Dryer', 'Storage Loft', 'Office Space', 'Mountain View', 'Lakefront',
  'Forest Views', 'Solar Ready', 'EV Charging', 'Wheelchair Accessible',
];

interface ListingFormProps {
  mode: 'create' | 'edit';
  listing?: Record<string, any>;
}

export default function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Parse initial amenities
  const initAmenities: string[] = (() => {
    if (!listing?.amenities) return [];
    if (Array.isArray(listing.amenities)) return listing.amenities;
    try { return JSON.parse(listing.amenities); } catch { return []; }
  })();

  // Form state
  const [form, setForm] = useState({
    title: listing?.title ?? '',
    description: listing?.description ?? '',
    price: listing?.price ?? '',
    priceType: listing?.price_type ?? listing?.priceType ?? 'sale',
    homeType: listing?.home_type ?? listing?.homeType ?? 'foundation',
    sqft: listing?.sqft ?? '',
    bedrooms: listing?.bedrooms ?? '',
    bathrooms: listing?.bathrooms ?? '',
    location: listing?.location ?? '',
    state: listing?.state ?? '',
    lat: listing?.lat ?? '',
    lng: listing?.lng ?? '',
    coverImage: listing?.cover_image ?? listing?.coverImage ?? '',
    offGridScore: listing?.off_grid_score ?? listing?.offGridScore ?? 0,
    status: listing?.status ?? 'active',
    isFeatured: !!(listing?.is_featured ?? listing?.isFeatured),
    // Specs
    solarWattage: listing?.solar_wattage ?? listing?.specs?.solarWattage ?? '',
    waterSystem: listing?.water_system ?? listing?.specs?.waterSystem ?? '',
    insulationRValue: listing?.insulation_r_value ?? listing?.specs?.insulationRValue ?? '',
    toiletType: listing?.toilet_type ?? listing?.specs?.toiletType ?? '',
    loftCount: listing?.loft_count ?? listing?.specs?.loftCount ?? 0,
    heatingType: listing?.heating_type ?? listing?.specs?.heatingType ?? '',
    rainwaterCollection: !!(listing?.rainwater_collection ?? listing?.specs?.rainwaterCollection),
    greyWaterSystem: !!(listing?.grey_water_system ?? listing?.specs?.greyWaterSystem),
    // Pricing / Finance
    downPaymentPct: listing?.down_payment_pct ?? listing?.downPaymentPct ?? '',
    monthlyRent: listing?.monthly_rent ?? listing?.monthlyRent ?? '',
    deliveryFee: listing?.delivery_fee ?? listing?.deliveryFee ?? '',
    financeTermMonths: listing?.finance_term_months ?? listing?.financeTermMonths ?? '',
  });
  const [amenities, setAmenities] = useState<string[]>(initAmenities);

  // Dynamic calculations
  const priceNum = Number(form.price) || 0;
  const downPaymentPctNum = Number(form.downPaymentPct) || 0;
  const financeTermMonthsNum = Number(form.financeTermMonths) || 0;
  
  const calculatedDownPayment = (priceNum * downPaymentPctNum) / 100;
  const calculatedLoanAmount = priceNum - calculatedDownPayment;
  const calculatedMonthlyFinance = financeTermMonthsNum > 0 ? calculatedLoanAmount / financeTermMonthsNum : 0;


  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);

    const payload = {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      priceType: form.priceType,
      homeType: form.homeType,
      sqft: Number(form.sqft),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      location: form.location,
      state: form.state,
      coordinates: { lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 },
      coverImage: form.coverImage,
      offGridScore: Number(form.offGridScore),
      status: form.status,
      isFeatured: form.isFeatured,
      specs: {
        solarWattage: form.solarWattage ? Number(form.solarWattage) : null,
        waterSystem: form.waterSystem || null,
        insulationRValue: form.insulationRValue ? Number(form.insulationRValue) : null,
        toiletType: form.toiletType || null,
        loftCount: Number(form.loftCount) || 0,
        heatingType: form.heatingType || null,
        rainwaterCollection: form.rainwaterCollection,
        greyWaterSystem: form.greyWaterSystem,
      },
      amenities,
      downPaymentPct: form.downPaymentPct ? Number(form.downPaymentPct) : null,
      monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : null,
      deliveryFee: form.deliveryFee ? Number(form.deliveryFee) : null,
      financeTermMonths: form.financeTermMonths ? Number(form.financeTermMonths) : null,
    };

    try {
      let res: Response;
      if (mode === 'create') {
        res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/listings/${listing!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save listing');
      }

      const data = await res.json();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      if (mode === 'create' && data.id) {
        startTransition(() => router.push(`/admin/listings/${data.id}/edit`));
      } else {
        startTransition(() => router.refresh());
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-sage/20 bg-white px-4 py-2.5 text-sm text-charcoal placeholder-charcoal-light/60 focus:border-sage focus:ring-0 outline-none transition-colors';
  const labelClass = 'block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1.5';
  const sectionClass = 'bg-white rounded-2xl border border-sage/10 shadow-sm p-6 space-y-5';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-offwhite/90 backdrop-blur-sm py-3 flex items-center justify-between border-b border-sage/10 -mx-4 px-4 sm:-mx-8 sm:px-8 mb-2">
        <Link href="/admin/listings" className="flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Listings
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
            {mode === 'create' ? 'Create Listing' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── BASIC INFO ── */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Basic Information</h2>
        <div>
          <label className={labelClass}>Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Cedar Ridge Tiny Home" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Description *</label>
          <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe this property…" className={`${fieldClass} resize-none`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Location (City, State short) *</label>
            <input required value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Asheville, NC" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>State (Full) *</label>
            <input required value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. North Carolina" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitude</label>
            <input type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="35.5951" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} placeholder="-82.5515" className={fieldClass} />
          </div>
        </div>
      </div>

      {/* ── PRICING & TYPE ── */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Pricing & Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Price ($) *</label>
            <input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="125000" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Listing Type *</label>
            <select value={form.priceType} onChange={e => set('priceType', e.target.value)} className={fieldClass}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="both">For Sale & Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Home Type *</label>
            <select value={form.homeType} onChange={e => set('homeType', e.target.value)} className={fieldClass}>
              <option value="foundation">Foundation</option>
              <option value="on-wheels">On Wheels (THOW)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Down Payment %</label>
            <div className="flex gap-2">
              <input type="number" min="0" max="100" value={form.downPaymentPct} onChange={e => set('downPaymentPct', e.target.value)} placeholder="20" className={`${fieldClass} flex-1`} />
              <div className="w-16 sm:w-24 shrink-0 flex items-center justify-center px-2 bg-sage/5 border border-sage/15 rounded-xl text-xs text-charcoal font-semibold whitespace-nowrap overflow-hidden text-ellipsis" title={`$${calculatedDownPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}>
                ${calculatedDownPayment > 1000 ? (calculatedDownPayment/1000).toFixed(1)+'k' : calculatedDownPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Monthly Rent ($)</label>
            <input type="number" min="0" value={form.monthlyRent} onChange={e => set('monthlyRent', e.target.value)} placeholder="1500" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Delivery Fee ($)</label>
            <input type="number" min="0" value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} placeholder="5000" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Finance Term (months)</label>
            <div className="flex gap-2">
              <input type="number" min="0" value={form.financeTermMonths} onChange={e => set('financeTermMonths', e.target.value)} placeholder="120" className={`${fieldClass} flex-1`} />
              <div className="w-24 shrink-0 flex items-center justify-center px-2 bg-clay/5 border border-clay/15 rounded-xl text-xs text-charcoal font-semibold whitespace-nowrap overflow-hidden text-ellipsis" title={`$${calculatedMonthlyFinance.toLocaleString(undefined, { maximumFractionDigits: 0 })} /mo`}>
                ${calculatedMonthlyFinance.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className={fieldClass}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
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

      {/* ── SPECS ── */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Specs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Square Footage *</label>
            <input required type="number" min="0" value={form.sqft} onChange={e => set('sqft', e.target.value)} placeholder="320" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Bedrooms *</label>
            <input required type="number" min="0" max="10" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="1" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Bathrooms *</label>
            <input required type="number" min="0" max="10" step="0.5" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="1" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Loft Count</label>
            <input type="number" min="0" max="5" value={form.loftCount} onChange={e => set('loftCount', e.target.value)} placeholder="0" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Solar Wattage</label>
            <input type="number" min="0" value={form.solarWattage} onChange={e => set('solarWattage', e.target.value)} placeholder="1200" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Insulation R-Value</label>
            <input type="number" min="0" value={form.insulationRValue} onChange={e => set('insulationRValue', e.target.value)} placeholder="30" className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Water System</label>
            <select value={form.waterSystem} onChange={e => set('waterSystem', e.target.value)} className={fieldClass}>
              <option value="">None / Unknown</option>
              <option value="municipal">Municipal</option>
              <option value="well">Well</option>
              <option value="rainwater">Rainwater Catchment</option>
              <option value="tank">Water Tank</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Toilet Type</label>
            <select value={form.toiletType} onChange={e => set('toiletType', e.target.value)} className={fieldClass}>
              <option value="">None / Unknown</option>
              <option value="composting">Composting</option>
              <option value="incinerating">Incinerating</option>
              <option value="flush">Standard Flush</option>
              <option value="cassette">Cassette</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Heating Type</label>
            <select value={form.heatingType} onChange={e => set('heatingType', e.target.value)} className={fieldClass}>
              <option value="">None / Unknown</option>
              <option value="mini-split">Mini Split</option>
              <option value="propane">Propane</option>
              <option value="wood">Wood Stove</option>
              <option value="electric">Electric</option>
              <option value="radiant">Radiant Floor</option>
            </select>
          </div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.rainwaterCollection} onChange={e => set('rainwaterCollection', e.target.checked)}
              className="w-4 h-4 rounded accent-sage" />
            <span className="text-sm text-charcoal">Rainwater Collection</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.greyWaterSystem} onChange={e => set('greyWaterSystem', e.target.checked)}
              className="w-4 h-4 rounded accent-sage" />
            <span className="text-sm text-charcoal">Grey Water System</span>
          </label>
        </div>

        {/* Off-Grid Score Slider */}
        <div>
          <label className={labelClass}>Off-Grid Score: <span className="text-sage normal-case">{form.offGridScore}/10</span></label>
          <input
            type="range" min="0" max="10" step="1"
            value={form.offGridScore}
            onChange={e => set('offGridScore', Number(e.target.value))}
            className="w-full accent-sage"
          />
          <div className="flex justify-between text-[10px] text-charcoal-light mt-1">
            <span>0 — Not off-grid</span>
            <span>10 — Fully self-sufficient</span>
          </div>
        </div>
      </div>

      {/* ── AMENITIES ── */}
      <div className={sectionClass}>
        <h2 className="font-serif text-lg text-charcoal font-semibold">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                amenities.includes(a)
                  ? 'bg-sage text-white border-sage shadow-sm'
                  : 'bg-white text-charcoal-light border-sage/20 hover:border-sage hover:text-charcoal'
              }`}
            >
              {amenities.includes(a) && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
              {a}
            </button>
          ))}
        </div>
        {/* Custom amenity */}
        <div className="flex gap-2 mt-2">
          <input
            id="custom-amenity-input"
            type="text"
            placeholder="Add custom amenity…"
            className={`${fieldClass} flex-1`}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                if (val && !amenities.includes(val)) setAmenities(prev => [...prev, val]);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <span className="text-xs text-charcoal-light self-center whitespace-nowrap">Press Enter to add</span>
        </div>
      </div>

      {/* ── COVER IMAGE + GALLERY ── */}
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
              <img src={form.coverImage} alt="Cover preview" className="w-16 h-16 rounded-xl object-cover border border-sage/20 shrink-0" />
            )}
          </div>
          <p className="text-xs text-charcoal-light mt-1">Or upload below and click the ⭐ star to set as cover.</p>
        </div>

        {listing?.id ? (
          <ImageUploader
            entityType="listing"
            entityId={listing.id}
            onCoverChange={url => set('coverImage', url)}
            coverImage={form.coverImage}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-sage/20 p-6 text-center text-sm text-charcoal-light">
            Save the listing first, then you can upload gallery images.
          </div>
        )}
      </div>
    </form>
  );
}
