import type { Metadata } from 'next';
import { getAllSettings } from '@/lib/db';
import SettingsForm from '@/components/admin/SettingsForm';

export const metadata: Metadata = { title: 'Site Settings | Admin' };
export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  const settings = getAllSettings();

  // Ensure all expected keys exist with defaults
  const defaults: Record<string, string> = {
    site_name: 'Collins Tiny Homes',
    site_tagline: 'Handcrafted tiny homes for sale and rent.',
    contact_email: 'hello@collinstinyhomes.com',
    contact_phone: '(555) 123-4567',
    default_down_payment_pct: '20',
    default_finance_term_months: '120',
    default_delivery_fee: '5000',
    hero_title: 'Live smaller. Live better.',
    hero_subtitle: 'Discover handcrafted tiny homes built for minimalism, freedom, and connection to nature.',
    about_text: 'Collins Tiny Homes is dedicated to making quality, sustainable tiny homes accessible to everyone.',
  };

  const merged = { ...defaults, ...settings };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-8 py-4">
        <h1 className="font-serif text-2xl text-charcoal font-semibold">Site Settings</h1>
        <p className="text-charcoal-light text-xs mt-0.5">Configure site-wide content, contact info, and financing defaults</p>
      </header>

      <div className="p-8 pb-24">
        <SettingsForm settings={merged} />
      </div>
    </>
  );
}
