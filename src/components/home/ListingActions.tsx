'use client';

import { useState } from 'react';
import {
  CreditCard, Home, CalendarDays, ArrowRight, MapPin,
  Landmark, ShieldAlert, Check, User, Mail, Phone
} from 'lucide-react';
import PaymentModal from './PaymentModal';
import DiscoveryWizard from './DiscoveryWizard';
import { getDeterministicShippingFee } from '@/lib/shipping';

interface ListingActionsProps {
  listingId: string;
  listingTitle: string;
  price: number;
  monthlyRent?: number;
  downPaymentPct?: number;
  financeTermMonths?: number;
  priceType: string; // 'sale' | 'rent' | 'both'
  homeType: string; // 'on-wheels' | 'foundation'
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
  homeType,
}: ListingActionsProps) {
  const [modal, setModal] = useState<{ open: boolean; type: PaymentType; amount: number }>({
    open: false, type: 'full_purchase', amount: 0,
  });
  
  // State for Discovery Wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardMeta, setWizardMeta] = useState<any>(null);

  // States for Sidebar Logistics (Placement & Delivery)
  const [address, setAddress] = useState('');
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [serviced, setServiced] = useState(true);
  const [agentModal, setAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', email: '', phone: '' });
  const [agentSubmitted, setAgentSubmitted] = useState(false);

  // States for Interactive Amortization Calculator
  const [calcTerm, setCalcTerm] = useState(financeTermMonths || 36);
  const [calculatorMode, setCalculatorMode] = useState<'financing' | 'rent_to_own'>('financing');

  const isRent = priceType === 'rent';
  const isBoth = priceType === 'both';
  const isSale = priceType === 'sale';

  // Proximity address suggestions for UI autocompletion
  const MOCK_ADDRESSES = [
    { name: '123 Pine St, Seattle, WA' },
    { name: '456 Oak Ave, Denver, CO' },
    { name: '789 Maple Rd, Austin, TX' },
    { name: '321 Elm Blvd, Atlanta, GA' },
    { name: '555 Cedar Ln, Boston, MA' }
  ];

  const handleAddressChange = (addr: string) => {
    setAddress(addr);
    setServiced(true);
    if (!addr.trim()) {
      setShippingFee(null);
    } else {
      const fee = getDeterministicShippingFee(addr, homeType);
      setShippingFee(fee);
    }
  };

  const handleAddressSelect = (addr: string) => {
    setAddress(addr);
    setServiced(true);
    const fee = getDeterministicShippingFee(addr, homeType);
    setShippingFee(fee);
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.name || !agentForm.email) return;

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          customerName: agentForm.name,
          customerEmail: agentForm.email,
          customerPhone: agentForm.phone,
          unservicedLocation: address || 'Requested Unserviced Region',
          lat: 41.8781,
          lng: -87.6298
        })
      });
      setAgentSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Financing math
  const calculatedDownPayment = price * 0.10;
  const loanBalance = price - calculatedDownPayment;
  const monthlyFinance = loanBalance / calcTerm;

  // Rent-to-Own math
  const rtoDownPayment = price * 0.10; // 10% down option deposit
  const rtoMonthlyRent = price * 0.012; // 1.2% base monthly rent
  const rtoMonthlyEquity = (price * 0.90) / calcTerm; // Amortize remaining 90%
  const rtoTotalMonthly = rtoMonthlyRent + rtoMonthlyEquity;

  const openPayment = (type: PaymentType, amount: number) => {
    setModal({ open: true, type, amount });
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* SALE & PURCHASE TRIGGERS */}
        {(isSale || isBoth) && (
          <div className="space-y-3">
            <button
              onClick={() => setWizardOpen(true)}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-sage to-sage-dark px-4 py-4 text-left text-sm font-bold text-white shadow-lg shadow-sage/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sage/35 sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Home className="h-4 w-4 shrink-0" />
                Inquire / Buy - ${price.toLocaleString()}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setWizardOpen(true)}
              className="group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-sage/20 px-4 py-3.5 text-left text-sm font-semibold text-charcoal transition-all duration-200 hover:border-sage/40 hover:bg-sage/5 sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0 text-sage" />
                Configure Term Financing
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-sage transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* RENT AND LEASING TRIGGERS */}
        {(isRent || isBoth) && (
          <button
            onClick={() => setWizardOpen(true)}
            className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-clay px-4 py-4 text-left text-sm font-bold text-white shadow-lg shadow-clay/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-clay/35 sm:px-5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0" />
              Configure Rent / Rent-to-Own
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        {/* INTERACTIVE FINANCE CALCULATOR (FINANCING & RENT-TO-OWN SUMMARY) */}
        {(isSale || isBoth) && (
          <div className="p-5 rounded-2xl glass-inset space-y-4">
            {/* Mode Selector Toggle */}
            <div className="relative grid grid-cols-2 gap-0.5 p-1 rounded-xl glass border border-white/50 shadow-md shadow-sage/5">
              <button
                type="button"
                onClick={() => setCalculatorMode('financing')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all duration-350 ${
                  calculatorMode === 'financing'
                    ? 'bg-gradient-to-br from-sage to-sage-dark text-white shadow-md shadow-sage/25 border border-white/15'
                    : 'text-charcoal-light hover:text-charcoal hover:bg-white/50'
                }`}
              >
                Financing
              </button>
              <button
                type="button"
                onClick={() => setCalculatorMode('rent_to_own')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all duration-350 ${
                  calculatorMode === 'rent_to_own'
                    ? 'bg-gradient-to-br from-sage to-sage-dark text-white shadow-md shadow-sage/25 border border-white/15'
                    : 'text-charcoal-light hover:text-charcoal hover:bg-white/50'
                }`}
              >
                Rent-to-Own
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold uppercase text-charcoal-light">
              <span>Term Duration</span>
              <span className="text-sage-dark">{calcTerm} Months</span>
            </div>

            <input
              type="range"
              min={12}
              max={60}
              step={12}
              value={calcTerm}
              onChange={(e) => setCalcTerm(parseInt(e.target.value))}
              className="w-full accent-sage"
            />

            {/* Real-time Calculator Summary Table */}
            {calculatorMode === 'financing' ? (
              <div className="pt-3 border-t border-sage/10 space-y-2 text-xs">
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Total Price</span>
                  <span>${price.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Down Payment (10%)</span>
                  <span>${calculatedDownPayment.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Amortized Balance</span>
                  <span>${loanBalance.toLocaleString()}</span>
                </div>
                <div className="h-px bg-sage/10 my-1" />
                <div className="flex flex-wrap justify-between gap-2 font-bold text-charcoal">
                  <span>Monthly Term Rate</span>
                  <span className="font-serif text-sage-dark font-bold">${monthlyFinance.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-sage/10 space-y-2 text-xs">
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Total House Value</span>
                  <span>${price.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Initial Option Deposit (10%)</span>
                  <span>${rtoDownPayment.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Base Monthly Rent</span>
                  <span>${rtoMonthlyRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                  <span>Monthly Equity Builder</span>
                  <span>${rtoMonthlyEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
                <div className="h-px bg-sage/10 my-1" />
                <div className="flex flex-wrap justify-between gap-2 font-bold text-charcoal">
                  <span>Total Monthly Payment</span>
                  <span className="font-serif text-sage-dark font-bold">${rtoTotalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGISTICS & SHIPPING (PLACEMENT & DELIVERY SECTION) */}
        <div className="p-5 rounded-2xl glass-card border border-white/60 space-y-4">
          <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sage" /> Placement & Delivery
          </h4>
          <p className="text-[11px] text-charcoal-light leading-relaxed">
            Check shipping availability and get a distance-based shipping quote instantly.
          </p>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter shipping address..."
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-white text-xs outline-none text-charcoal focus:border-sage placeholder:text-charcoal-light/35"
            />
            
            {address && !MOCK_ADDRESSES.map(a => a.name).includes(address) && (
              <div className="absolute top-full left-0 right-0 bg-white border border-sage/15 rounded-xl shadow-xl mt-1.5 overflow-hidden z-20">
                {MOCK_ADDRESSES.map((m) => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => handleAddressSelect(m.name)}
                    className="w-full text-left px-4 py-2 hover:bg-sage/5 text-xs text-charcoal border-b border-sage/5 last:border-b-0"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {address && (
            <div className="pt-2">
              {serviced && shippingFee !== null ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sage/10 bg-white p-3 text-xs">
                  <span className="text-charcoal-light">Shipping Fee Quote:</span>
                  <span className="font-bold text-sage-dark font-mono">${shippingFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-charcoal-light flex items-center justify-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-sage/20 border border-sage/30" />
          🔒 Secure Checkout · 256-Bit SSL Encrypted
        </p>
      </div>

      {/* Discovery Wizard Modal */}
      {wizardOpen && (
        <DiscoveryWizard
          listingId={listingId}
          listingTitle={listingTitle}
          price={price}
          homeType={homeType}
          onClose={() => setWizardOpen(false)}
          onProceedToPayment={(type, amount, meta) => {
            setWizardMeta(meta);
            setWizardOpen(false);
            openPayment(type, amount);
          }}
        />
      )}

      {/* Payment Modal */}
      {modal.open && (
        <PaymentModal
          listingId={listingId}
          listingTitle={listingTitle}
          amount={modal.amount}
          paymentType={modal.type}
          wizardData={wizardMeta}
          onClose={() => setModal(prev => ({ ...prev, open: false }))}
        />
      )}

      {/* Regional Agent Modal Overlay */}
      {agentModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-charcoal/80" onClick={() => setAgentModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-sage/15 z-10 space-y-5">
            <h3 className="font-serif text-lg text-charcoal font-semibold flex items-center gap-2">
              <Landmark className="w-5 h-5 text-sage" /> Connect with Regional Agent
            </h3>
            <p className="text-xs text-charcoal-light leading-relaxed">
              We need to assign a regional permit specialist in your territory to verify delivery clearances, routing safety, and local zoning.
            </p>

            {agentSubmitted ? (
              <div className="bg-sage/10 border border-sage/20 rounded-2xl p-6 text-center space-y-2">
                <Check className="w-8 h-8 text-sage mx-auto" />
                <h4 className="font-serif font-bold text-charcoal text-sm">Agent Assigned</h4>
                <p className="text-[11px] text-charcoal-light">
                  A territorial manager has been successfully assigned. We are matching unserviced routing options and will contact you directly.
                </p>
                <button
                  type="button"
                  onClick={() => setAgentModal(false)}
                  className="mt-4 px-5 py-2.5 bg-sage hover:bg-sage-dark text-white text-xs font-bold rounded-xl transition-all"
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <form onSubmit={handleAgentSubmit} className="space-y-4">
                <div className="space-y-3.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={agentForm.name}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage pl-10"
                    />
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light/40" />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={agentForm.email}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage pl-10"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light/40" />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={agentForm.phone}
                      onChange={(e) => setAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage pl-10"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light/40" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-sage hover:bg-sage-dark text-white text-xs font-bold transition-all shadow-md shadow-sage/20"
                >
                  Connect Agent
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

