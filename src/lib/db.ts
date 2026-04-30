import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

// Keep the old getDb function for backwards compatibility in seed (but we don't really need it anymore)
export function getDb() {
  throw new Error('SQLite getDb() is no longer available. Use supabase directly.');
}

/* ─── Listing Helpers ─── */

export async function getAllListings(filters?: {
  priceType?: string;
  homeType?: string;
  minOffGrid?: number;
  status?: string;
  search?: string;
}) {
  let query = supabase.from('listings').select('*').order('created_at', { ascending: false });

  if (filters?.priceType && filters.priceType !== 'both') {
    query = query.in('price_type', [filters.priceType, 'both']);
  }
  if (filters?.homeType) {
    query = query.eq('home_type', filters.homeType);
  }
  if (filters?.minOffGrid) {
    query = query.gte('off_grid_score', filters.minOffGrid);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getListingById(id: string) {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createListing(data: Record<string, any>) {
  const { data: result, error } = await supabase.from('listings').insert([data]).select();
  if (error) throw error;
  return result;
}

export async function updateListing(id: string, data: Record<string, any>) {
  const { data: result, error } = await supabase.from('listings').update(data).eq('id', id).select();
  if (error) throw error;
  return result;
}

export async function deleteListing(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

/* ─── Listing Images ─── */

export async function getListingImages(listingId: string) {
  const { data, error } = await supabase.from('listing_images').select('*').eq('listing_id', listingId).order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createListingImage(data: { id: string; listing_id: string; url: string; label: string; sort_order: number }) {
  const { error } = await supabase.from('listing_images').insert([data]);
  if (error) throw error;
}

export async function updateListingImage(id: string, data: { label?: string; sort_order?: number }) {
  const { error } = await supabase.from('listing_images').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteListingImage(id: string) {
  const { error } = await supabase.from('listing_images').delete().eq('id', id);
  if (error) throw error;
}

/* ─── Lands ─── */

export async function getAllLands(filters?: {
  priceType?: string;
  terrainType?: string;
  zoning?: string;
  status?: string;
  search?: string;
}) {
  let query = supabase.from('lands').select('*').order('created_at', { ascending: false });

  if (filters?.priceType) {
    query = query.eq('price_type', filters.priceType);
  }
  if (filters?.terrainType) {
    query = query.eq('terrain_type', filters.terrainType);
  }
  if (filters?.zoning) {
    query = query.eq('zoning', filters.zoning);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getLandById(id: string) {
  const { data, error } = await supabase.from('lands').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function createLand(data: Record<string, any>) {
  const { error } = await supabase.from('lands').insert([data]);
  if (error) throw error;
}

export async function updateLand(id: string, data: Record<string, any>) {
  const { error } = await supabase.from('lands').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteLand(id: string) {
  const { error } = await supabase.from('lands').delete().eq('id', id);
  if (error) throw error;
}

/* ─── Land Images ─── */

export async function getLandImages(landId: string) {
  const { data, error } = await supabase.from('land_images').select('*').eq('land_id', landId).order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createLandImage(data: { id: string; land_id: string; url: string; label: string; sort_order: number }) {
  const { error } = await supabase.from('land_images').insert([data]);
  if (error) throw error;
}

export async function updateLandImage(id: string, data: { label?: string; sort_order?: number }) {
  const { error } = await supabase.from('land_images').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteLandImage(id: string) {
  const { error } = await supabase.from('land_images').delete().eq('id', id);
  if (error) throw error;
}

/* ─── Inquiries ─── */

export async function getAllInquiries(filters?: { type?: string; status?: string }) {
  let query = supabase.from('inquiries').select('*, listings(title), lands(title)').order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('inquiry_type', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map((item: any) => ({
    ...item,
    listing_title: item.listings?.title,
    land_title: item.lands?.title,
  }));
}

export async function createInquiry(data: Record<string, any>) {
  const { error } = await supabase.from('inquiries').insert([data]);
  if (error) throw error;
}

export async function updateInquiry(id: string, data: Record<string, any>) {
  const { error } = await supabase.from('inquiries').update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteInquiry(id: string) {
  const { error } = await supabase.from('inquiries').delete().eq('id', id);
  if (error) throw error;
}

/* ─── Site Settings ─── */

export async function getAllSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) throw error;
  const settings: Record<string, string> = {};
  for (const row of (data || [])) {
    settings[row.key] = row.value;
  }
  return settings;
}

export async function getSetting(key: string): Promise<string | undefined> {
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', key).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.value;
}

export async function upsertSetting(key: string, value: string) {
  const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/* ─── Stats ─── */

export async function getDashboardStats() {
  const [listings, activeListings, lands, totalInquiries, newInquiries, financeApps, recentInquiries] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('lands').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('inquiry_type', 'finance'),
    supabase.from('inquiries').select('*, listings(title), lands(title)').order('created_at', { ascending: false }).limit(5)
  ]);

  return {
    totalListings: listings.count || 0,
    activeListings: activeListings.count || 0,
    totalLands: lands.count || 0,
    totalInquiries: totalInquiries.count || 0,
    newInquiries: newInquiries.count || 0,
    financeApps: financeApps.count || 0,
    recentInquiries: (recentInquiries.data || []).map((item: any) => ({
      ...item,
      listing_title: item.listings?.title,
      land_title: item.lands?.title,
    })),
  };
}

/* ─── Payments ─── */

export async function getAllPayments() {
  const { data, error } = await supabase.from('payments').select('*, listings(title)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    listing_title: item.listings?.title,
  }));
}

export async function getPaymentById(id: string) {
  const { data, error } = await supabase.from('payments').select('*, listings(title)').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;
  return {
    ...data,
    listing_title: data.listings?.title,
  };
}

export async function createPayment(data: Record<string, any>) {
  const { error } = await supabase.from('payments').insert([data]);
  if (error) throw error;
}

export async function deletePayment(id: string) {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
}
