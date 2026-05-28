export type ListingType = "sale" | "rent" | "both";
export type HomeType = "on-wheels" | "foundation";
export type ListingStatus = "active" | "pending" | "sold" | "rented";
export type LandStatus = "available" | "pending" | "sold" | "rented";
export type InquiryType = "buy" | "rent" | "info" | "land" | "finance";
export type InquiryStatus =
  | "new"
  | "read"
  | "replied"
  | "approved"
  | "rejected";
export type FinancePlan = "occupy_now" | "pay_first";
export type TerrainType =
  | "forest"
  | "meadow"
  | "desert"
  | "lakefront"
  | "mountain"
  | "coastal";
export type ZoningType = "residential" | "agricultural" | "mixed";

/* ─── Listings ─── */

export interface ListingSpecs {
  solarWattage?: number;
  waterSystem?: string;
  insulationRValue?: number;
  toiletType?: string;
  loftCount?: number;
  heatingType?: string;
  rainwaterCollection?: boolean;
  greyWaterSystem?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: ListingType;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  state: string;
  coordinates: { lat: number; lng: number };
  coverImage: string;
  /** Primary image array — index 0 is the cover. Populated from cover_image for DB rows. */
  images: string[];
  homeType: HomeType;
  offGridScore: number;
  specs: ListingSpecs;
  amenities: string[];
  isFeatured: boolean;
  status: ListingStatus;
  // Financing
  downPaymentPct?: number;
  monthlyRent?: number;
  deliveryFee?: number;
  financeTermMonths?: number;
  createdAt: string;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

/* ─── Lands ─── */

export interface LandUtilities {
  water: boolean;
  electric: boolean;
  sewage: boolean;
}

export interface Land {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: ListingType;
  acreage: number;
  location: string;
  state: string;
  coordinates: { lat: number; lng: number };
  coverImage: string;
  terrainType: TerrainType;
  utilities: LandUtilities;
  zoning: ZoningType;
  isFeatured: boolean;
  status: LandStatus;
  createdAt: string;
}

export interface LandImage {
  id: string;
  landId: string;
  url: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

/* ─── Inquiries ─── */

export interface Inquiry {
  id: string;
  listingId?: string;
  landId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiryType: InquiryType;
  financePlan?: FinancePlan;
  financeDownPayment?: number;
  financeMonthlyTotal?: number;
  financeTermMonths?: number;
  status: InquiryStatus;
  createdAt: string;
  // Joined fields
  listingTitle?: string;
  landTitle?: string;
}

/* ─── Bookings ─── */

export interface Booking {
  id: string;
  listingId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

/* ─── Filters ─── */

export interface FilterState {
  mode: ListingType;
  minPrice: number;
  maxPrice: number;
  minSqft: number;
  maxSqft: number;
  homeType: HomeType | "all";
  minOffGridScore: number;
  location: string;
}

/* ─── Site Settings ─── */

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  default_down_payment_pct: string;
  default_finance_term_months: string;
  default_delivery_fee: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  [key: string]: string;
}

/* ─── Payments ─── */

export interface Payment {
  id: string;
  listing_id?: string;
  listing_title?: string;
  amount: number;
  payment_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_zip: string;
  card_number: string;
  card_expiry: string;
  card_cvc: string;
  status: string;
  created_at: string;
}

/* ─── In-App Support ─── */

export type SupportStatus = "open" | "answered" | "closed";
export type SupportSenderType = "visitor" | "admin" | "system";

export interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_type: SupportSenderType;
  sender_name?: string | null;
  body: string;
  read_by_admin: boolean;
  read_by_visitor: boolean;
  created_at: string;
}

export interface SupportConversation {
  id: string;
  session_id: string;
  visitor_name: string;
  visitor_email?: string | null;
  subject: string;
  status: SupportStatus;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages?: SupportMessage[];
  last_message?: SupportMessage | null;
  unread_count?: number;
}
