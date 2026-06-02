'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, MapPin, Layers, Loader2, Check } from 'lucide-react';
import { getShippingFeeByCountryCode } from '@/lib/shipping';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapboxSelectorProps {
  onLocationSelect: (data: { address: string; shippingFee: number; lat: number; lng: number }) => void;
  initialAddress?: string;
}

export default function MapboxSelector({ onLocationSelect, initialAddress = '' }: MapboxSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [mapStyle, setMapStyle] = useState<'satellite-streets-v12' | 'outdoors-v12' | 'streets-v12'>('satellite-streets-v12');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ address: string; shippingFee: number; lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // USA geographic center default
    const defaultCenter: [number, number] = [-98.5795, 39.8283];
    const defaultZoom = 3.2;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: defaultCenter,
      zoom: defaultZoom,
      projection: 'globe' // Enable premium HD 3D globe view
    });

    mapRef.current = map;

    // Add navigation controls (Zoom +/- & compass)
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    // Create a draggable marker
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: '#7A9E7E' // sage theme color
    });
    markerRef.current = marker;

    // Map Load - Setup globe atmosphere styling
    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(186, 210, 215)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness
        'space-color': 'rgb(11, 11, 25)', // Background space
        'star-intensity': 0.6 // Star brightness
      });
    });

    // Handle map click
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      placeMarker(lng, lat);
    });

    // Handle marker dragend
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      handleReverseGeocode(lngLat.lng, lngLat.lat);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update map style when selected style changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
    }
  }, [mapStyle]);

  // Place marker and fly map to it
  const placeMarker = (lng: number, lat: number, fly = false) => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLngLat([lng, lat]).addTo(mapRef.current);
    
    if (fly) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true
      });
    }

    handleReverseGeocode(lng, lat);
  };

  // Reverse Geocoding: Coordinate -> Address/Country
  const handleReverseGeocode = async (lng: number, lat: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const context = feature.context || [];
        
        // Extract country code (ISO code e.g. 'US', 'CA')
        const countryContext = context.find((c: any) => c.id.startsWith('country.'));
        const countryCode = countryContext ? countryContext.short_code?.toUpperCase() : '';

        const addressName = feature.place_name;
        const shippingFee = getShippingFeeByCountryCode(countryCode);

        const locData = {
          address: addressName,
          shippingFee,
          lat,
          lng
        };

        setSelectedLocation(locData);
        onLocationSelect(locData);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setGeocoding(false);
    }
  };

  // Autocomplete Search: Query -> Locations list
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (err) {
      console.error('Forward geocoding error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (feature: any) => {
    const [lng, lat] = feature.center;
    setSearchQuery(feature.place_name);
    setSearchResults([]);
    placeMarker(lng, lat, true);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Geocoder Search Bar */}
      <div className="relative">
        <div className="relative flex items-center bg-white border border-sage/20 rounded-xl px-3 py-2 shadow-sm focus-within:border-sage focus-within:ring-2 focus-within:ring-sage/10 transition-all">
          <Search className="w-4 h-4 text-sage shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search address or location..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal-light/40"
          />
          {geocoding && <Loader2 className="w-4 h-4 text-sage animate-spin shrink-0 ml-1" />}
        </div>

        {/* Autocomplete Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-sage/15 rounded-xl shadow-xl z-[150] overflow-hidden">
            {searchResults.map((feature: any) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => selectSearchResult(feature)}
                className="w-full text-left px-4 py-2.5 text-xs text-charcoal hover:bg-sage/5 transition-colors border-b border-sage/5 last:border-b-0"
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapbox Container & Overlay HUD */}
      <div className="relative rounded-2xl overflow-hidden border border-sage/15 shadow-inner">
        {/* Visual Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-80 min-h-[320px] bg-offwhite" />

        {/* Map Style Overlay Control */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur border border-sage/15 p-1 rounded-xl shadow-lg flex gap-0.5">
          {[
            { id: 'satellite-streets-v12', label: 'HD Satellite' },
            { id: 'outdoors-v12', label: 'Terrain' },
            { id: 'streets-v12', label: 'Streets' }
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setMapStyle(style.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                mapStyle === style.id
                  ? 'bg-sage text-white shadow'
                  : 'text-charcoal-light hover:text-charcoal'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Map selection helper HUD */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="bg-charcoal/80 backdrop-blur text-white text-[10px] font-medium tracking-wide uppercase px-3 py-1.5 rounded-lg shadow">
            Click Map or Drag Pin to Select
          </div>
        </div>
      </div>

      {/* Real-time calculated shipping preview HUD */}
      {selectedLocation && (
        <div className="p-4 bg-sage/5 border border-sage/10 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-sage">Selected Location</span>
            <p className="text-xs text-charcoal font-medium truncate mt-0.5" title={selectedLocation.address}>
              {selectedLocation.address}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-sage/10 px-3 py-2 rounded-xl text-sage-dark">
            <Check className="w-3.5 h-3.5" />
            <span className="text-xs font-bold font-mono">
              Shipping Fee: ${selectedLocation.shippingFee.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
