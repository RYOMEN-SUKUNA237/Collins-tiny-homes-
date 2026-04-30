'use client';

import { useState } from 'react';
import { Save, Check, Globe, Phone, Mail, DollarSign, Layout, Info } from 'lucide-react';

interface SettingsFormProps {
  settings: Record<string, string>;
}

type Section = {
  title: string;
  icon: React.ElementType;
  fields: { key: string; label: string; type?: string; placeholder?: string; multiline?: boolean }[];
};

const SECTIONS: Section[] = [
  {
    title: 'Site Identity',
    icon: Globe,
    fields: [
      { key: 'site_name', label: 'Site Name', placeholder: 'Collins Tiny Homes' },
      { key: 'site_tagline', label: 'Tagline', placeholder: 'Handcrafted tiny homes for sale and rent.' },
      { key: 'about_text', label: 'About Text', placeholder: 'Tell visitors about your business…', multiline: true },
    ],
  },
  {
    title: 'Hero Section',
    icon: Layout,
    fields: [
      { key: 'hero_title', label: 'Hero Headline', placeholder: 'Live smaller. Live better.' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', placeholder: 'Discover handcrafted tiny homes…', multiline: true },
    ],
  },
  {
    title: 'Contact Info',
    icon: Mail,
    fields: [
      { key: 'contact_email', label: 'Email Address', type: 'email', placeholder: 'hello@collinstinyhomes.com' },
      { key: 'contact_phone', label: 'Phone Number', type: 'tel', placeholder: '(555) 123-4567' },
    ],
  },
  {
    title: 'Financing Defaults',
    icon: DollarSign,
    fields: [
      { key: 'default_down_payment_pct', label: 'Default Down Payment (%)', type: 'number', placeholder: '20' },
      { key: 'default_finance_term_months', label: 'Default Finance Term (months)', type: 'number', placeholder: '120' },
      { key: 'default_delivery_fee', label: 'Default Delivery Fee ($)', type: 'number', placeholder: '5000' },
    ],
  },
];

export default function SettingsForm({ settings: initialSettings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = 'w-full rounded-xl border border-sage/20 bg-white px-4 py-2.5 text-sm text-charcoal placeholder-charcoal-light/60 focus:border-sage outline-none transition-colors';
  const labelClass = 'block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-1.5';

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* Save bar */}
      <div className="sticky top-0 z-30 bg-offwhite/90 backdrop-blur-sm py-3 flex items-center justify-end gap-3 border-b border-sage/10 -mx-8 px-8 mb-2">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <span className="flex items-center gap-1.5 text-sage text-sm font-semibold">
            <Check className="w-4 h-4" /> Settings saved!
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200 disabled:opacity-60"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Settings
        </button>
      </div>

      {SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="bg-white rounded-2xl border border-sage/10 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-3 pb-2 border-b border-sage/10">
              <div className="w-8 h-8 rounded-xl bg-sage/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-sage" />
              </div>
              <h2 className="font-serif text-lg text-charcoal font-semibold">{section.title}</h2>
            </div>
            {section.fields.map(field => (
              <div key={field.key}>
                <label className={labelClass}>{field.label}</label>
                {field.multiline ? (
                  <textarea
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`${fieldClass} resize-none`}
                  />
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={fieldClass}
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}

      <div className="flex items-start gap-3 bg-clay/5 border border-clay/15 rounded-2xl p-5">
        <Info className="w-4 h-4 text-clay shrink-0 mt-0.5" />
        <p className="text-sm text-charcoal-light">
          Settings are stored in the SQLite database and applied site-wide. Changes take effect immediately after saving.
        </p>
      </div>
    </form>
  );
}
