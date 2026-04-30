'use client';

import { useState } from 'react';
import { CreditCard, Home, CalendarDays, ArrowRight } from 'lucide-react';
import PaymentModal from './PaymentModal';

interface ListingActionsProps {
  listingId: string;
  listingTitle: string;
  price: number;
  monthlyRent?: number;
  downPaymentPct?: number;
  financeTermMonths?: number;
  priceType: string; // 'sale' | 'rent' | 'both'
}

type PaymentType = 'full_purchase' | 'down_payment' | 'monthly_rent';

export default function ListingActions({
  listingId,
  listingTitle,
  price,
  monthlyRent,
  downPaymentPct,
  financeTermMonths,
  priceType,
}: ListingActionsProps) {
  const [modal, setModal] = useState<{ open: boolean; type: PaymentType; amount: number }>({
    open: false, type: 'full_purchase', amount: 0,
  });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const isRent = priceType === 'rent';
  const isBoth = priceType === 'both';
  const isSale = priceType === 'sale';

  const downPaymentAmount = downPaymentPct ? (price * downPaymentPct) / 100 : 0;
  const loanAmount = price - downPaymentAmount;
  const monthlyFinance = financeTermMonths && financeTermMonths > 0 ? loanAmount / financeTermMonths : 0;

  const openPayment = (type: PaymentType, amount: number) => {
    setModal({ open: true, type, amount });
  };

  return (
    <>
      <div className="space-y-3">
        {/* SALE OPTIONS */}
        {(isSale || isBoth) && (
          <div className="space-y-3">
            {/* Full Purchase */}
            <button
              onClick={() => openPayment('full_purchase', price)}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl bg-gradient-to-r from-sage to-sage-dark text-white font-bold text-sm shadow-lg shadow-sage/30 hover:shadow-sage/50 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Buy Now — ${price.toLocaleString()}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Down Payment */}
            {downPaymentPct && downPaymentAmount > 0 && (
              <button
                onClick={() => openPayment('down_payment', downPaymentAmount)}
                className="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl border-2 border-sage/30 text-charcoal font-semibold text-sm hover:border-sage/60 hover:bg-sage/5 transition-all duration-200 group"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sage" />
                  Pay Down Payment ({downPaymentPct}%) — ${downPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <ArrowRight className="w-4 h-4 text-sage group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Monthly Finance */}
            {monthlyFinance > 0 && financeTermMonths && (
              <div className="p-4 rounded-2xl bg-clay/5 border border-clay/15 text-sm text-charcoal-light">
                <p className="font-semibold text-charcoal mb-1">Finance Option</p>
                <p>
                  ${monthlyFinance.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  <span className="ml-1 text-xs">× {financeTermMonths} months</span>
                </p>
                <button
                  onClick={() => openPayment('monthly_rent', monthlyFinance)}
                  className="mt-2 text-xs font-semibold text-clay hover:underline"
                >
                  Pay first month →
                </button>
              </div>
            )}
          </div>
        )}

        {/* RENT OPTIONS */}
        {(isRent || isBoth) && (
          <div className="space-y-3">
            {isBoth && (
              <div className="h-px bg-sage/10 my-1" />
            )}
            {/* Date pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-sage/20 hover:border-sage/40 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium mb-1">Check-in</p>
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="text-sm text-charcoal bg-transparent w-full outline-none"
                />
              </div>
              <div className="p-3 rounded-xl border border-sage/20 hover:border-sage/40 transition-colors">
                <p className="text-[10px] uppercase tracking-wider text-charcoal-light font-medium mb-1">Check-out</p>
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  className="text-sm text-charcoal bg-transparent w-full outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => openPayment('monthly_rent', monthlyRent ?? price)}
              className="w-full flex items-center justify-between py-4 px-5 rounded-2xl bg-clay text-white font-bold text-sm shadow-lg shadow-clay/30 hover:shadow-clay/50 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Book — ${(monthlyRent ?? price).toLocaleString()}/mo
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        <p className="text-center text-xs text-charcoal-light">
          🔒 Simulated secure payment · No real charge is made
        </p>
      </div>

      {/* Payment Modal */}
      {modal.open && (
        <PaymentModal
          listingId={listingId}
          listingTitle={listingTitle}
          amount={modal.amount}
          paymentType={modal.type}
          onClose={() => setModal(prev => ({ ...prev, open: false }))}
        />
      )}
    </>
  );
}
