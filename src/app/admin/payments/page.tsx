import type { Metadata } from 'next';
import { getAllPayments } from '@/lib/db';
import { Payment } from '@/lib/types';
import {
  CreditCard, TrendingUp, CheckCircle2, Clock, XCircle,
  Phone, MapPin, Mail, Globe, Building2, User,
} from 'lucide-react';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata: Metadata = { title: 'Payments | Admin' };
export const dynamic = 'force-dynamic';

function maskCard(card: string) {
  const c = card.replace(/\s/g, '');
  return '•••• •••• •••• ' + c.slice(-4);
}

function getCardBrand(card: string) {
  const c = card.replace(/\s/g, '');
  if (/^4/.test(c)) return 'Visa';
  if (/^5[1-5]/.test(c)) return 'Mastercard';
  if (/^3[47]/.test(c)) return 'Amex';
  if (/^6/.test(c)) return 'Discover';
  return 'Card';
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const typeLabel: Record<string, string> = {
  full_purchase: 'Full Purchase',
  down_payment: 'Down Payment',
  monthly_rent: 'Monthly Rent',
};

const typeColor: Record<string, string> = {
  full_purchase: 'bg-sage/15 text-sage-dark',
  down_payment: 'bg-clay/15 text-clay-dark',
  monthly_rent: 'bg-blue-100 text-blue-700',
};

const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
  completed: { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Completed' },
  declined: { bg: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Declined' },
  pending: { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Pending' },
};

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments() as Payment[];
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const declinedPayments = payments.filter(p => p.status === 'declined');
  const completedPayments = payments.filter(p => p.status === 'completed');
  const fullPurchases = payments.filter(p => p.payment_type === 'full_purchase');
  const downPayments = payments.filter(p => p.payment_type === 'down_payment');

  return (
    <>
      {/* Header */}
      <header className="lg:sticky lg:top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-4 py-4 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">Payments</h1>
          <p className="text-charcoal-light text-xs mt-0.5">{payments.length} transaction{payments.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sage/10 border border-sage/20 w-full sm:w-auto shrink-0">
          <TrendingUp className="w-4 h-4 text-sage" />
          <span className="text-sm font-bold text-charcoal">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Attempts', value: payments.length, icon: TrendingUp, color: 'text-sage', bg: 'bg-sage/10' },
            { label: 'Declined', value: declinedPayments.length, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Completed', value: completedPayments.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Full Purchases', value: fullPurchases.length, icon: CreditCard, color: 'text-clay', bg: 'bg-clay/10' },
            { label: 'Down Payments', value: downPayments.length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-sage/10 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-[11px] text-charcoal-light uppercase tracking-wider font-medium mb-1">{label}</p>
              <p className="font-serif text-2xl font-bold text-charcoal">{value}</p>
            </div>
          ))}
        </div>

        {/* Payment Cards — detailed view of each payment */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sage/10 shadow-sm p-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-sage/50" />
              </div>
              <p className="text-charcoal-light text-sm">No payments yet.</p>
              <p className="text-charcoal-light/60 text-xs">Payments from customers will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => {
              const brand = getCardBrand(p.card_number);
              const sc = statusConfig[p.status] ?? statusConfig.pending;
              const fullAddress = [p.shipping_address, p.shipping_city, p.shipping_state, p.shipping_zip, p.shipping_country].filter(Boolean).join(', ');

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card top bar — amount, status, type, date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-4 sm:px-6 bg-gradient-to-r from-offwhite/80 to-white border-b border-sage/10">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-serif text-2xl font-bold text-charcoal">
                        ${p.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex gap-2">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${typeColor[p.payment_type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {typeLabel[p.payment_type] ?? p.payment_type}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${sc.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t border-sage/10 sm:border-t-0 pt-3 sm:pt-0">
                      <p className="text-xs text-charcoal-light whitespace-nowrap">{formatDate(p.created_at)}</p>
                      <DeleteButton id={p.id} entityType="payments" />
                    </div>
                  </div>

                  {/* Card body — 3 column grid */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Customer Info */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Customer Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sage/30 to-clay/30 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-charcoal font-bold text-sm">
                              {p.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-charcoal text-sm">{p.customer_name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Mail className="w-3 h-3 text-charcoal-light/60" />
                              <p className="text-xs text-charcoal-light">{p.customer_email}</p>
                            </div>
                            {p.customer_phone && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Phone className="w-3 h-3 text-charcoal-light/60" />
                                <p className="text-xs text-charcoal-light">{p.customer_phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Property */}
                      {p.listing_title && (
                        <div className="pt-3 border-t border-sage/10">
                          <p className="text-[10px] uppercase tracking-widest text-charcoal-light font-medium mb-1">Property</p>
                          <p className="text-sm font-medium text-charcoal">{p.listing_title}</p>
                        </div>
                      )}
                    </div>

                    {/* Column 2: Shipping Address */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Shipping / Billing Address
                      </h3>
                      {fullAddress ? (
                        <div className="bg-offwhite/50 rounded-xl p-4 border border-sage/8 space-y-2">
                          {p.shipping_address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-sage mt-0.5 shrink-0" />
                              <p className="text-sm text-charcoal">{p.shipping_address}</p>
                            </div>
                          )}
                          {(p.shipping_city || p.shipping_state) && (
                            <div className="flex items-center gap-2 ml-5">
                              <Building2 className="w-3 h-3 text-charcoal-light/50" />
                              <p className="text-xs text-charcoal-light">
                                {[p.shipping_city, p.shipping_state].filter(Boolean).join(', ')}
                              </p>
                            </div>
                          )}
                          {p.shipping_zip && (
                            <div className="flex items-center gap-2 ml-5">
                              <Mail className="w-3 h-3 text-charcoal-light/50" />
                              <p className="text-xs text-charcoal-light font-mono">{p.shipping_zip}</p>
                            </div>
                          )}
                          {p.shipping_country && (
                            <div className="flex items-center gap-2 ml-5">
                              <Globe className="w-3 h-3 text-charcoal-light/50" />
                              <p className="text-xs text-charcoal-light">{p.shipping_country}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-charcoal-light italic">No address provided</p>
                      )}
                    </div>

                    {/* Column 3: Card Details */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold flex items-center gap-1.5">
                        <CreditCard className="w-3 h-3" /> Payment Card
                      </h3>
                      {/* Mini card visual */}
                      <div className="bg-gradient-to-br from-charcoal to-charcoal-light rounded-xl p-4 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #7a9e7e 0%, transparent 50%)' }}
                        />
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-5 rounded bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-80" />
                            <span className="text-white/70 text-[10px] font-bold tracking-widest uppercase">{brand}</span>
                          </div>
                          <p className="font-mono text-sm tracking-widest">{maskCard(p.card_number)}</p>
                          <div className="flex justify-between text-[10px]">
                            <div>
                              <p className="text-white/50 uppercase tracking-widest">Holder</p>
                              <p className="text-white font-medium truncate max-w-[120px]">{p.customer_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white/50 uppercase tracking-widest">Expires</p>
                              <p className="text-white font-medium font-mono">{p.card_expiry}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Raw card details */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-offwhite/50 rounded-lg p-2.5 border border-sage/8">
                          <p className="text-[9px] uppercase tracking-wider text-charcoal-light font-medium">Card Number</p>
                          <p className="text-xs font-mono text-charcoal mt-0.5">{p.card_number}</p>
                        </div>
                        <div className="bg-offwhite/50 rounded-lg p-2.5 border border-sage/8">
                          <p className="text-[9px] uppercase tracking-wider text-charcoal-light font-medium">CVC</p>
                          <p className="text-xs font-mono text-charcoal mt-0.5">{p.card_cvc}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction ID footer */}
                  <div className="px-4 py-3 sm:px-6 bg-offwhite/30 border-t border-sage/8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[10px] text-charcoal-light font-mono">
                      TXN: {p.id.slice(0, 20).toUpperCase()}
                    </p>
                    <p className="text-[10px] text-charcoal-light">
                      {p.listing_title ? `Property: ${p.listing_title}` : 'No property linked'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
