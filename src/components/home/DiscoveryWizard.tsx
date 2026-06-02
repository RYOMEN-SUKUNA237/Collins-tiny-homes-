'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Target, MapPin, Landmark, ArrowRight, ArrowLeft,
  DollarSign, Check, Phone, Mail, User,
  MessageCircle, Edit3, Send, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapboxSelector = dynamic(() => import('./MapboxSelector'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 min-h-[320px] bg-offwhite border border-sage/15 rounded-2xl flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-sage animate-spin" />
      <span className="text-xs text-charcoal-light font-medium">Loading premium HD map...</span>
    </div>
  )
});

interface DiscoveryWizardProps {
  listingId: string;
  listingTitle: string;
  price: number;
  homeType: string;
  onClose: () => void;
  onProceedToPayment: (paymentType: 'full_purchase' | 'down_payment' | 'monthly_rent', amount: number, meta: {
    goal: string;
    landOwnership: string;
    timeline: string;
    paymentMethod: string;
    termMonths: number;
    shippingFee: number;
    shippingAddress: string;
    isRentToOwn: boolean;
    isRent?: boolean;
  }) => void;
}

function generateSupportMessage(name: string, listingTitle: string, landStatus: 'looking' | 'none') {
  const intro = landStatus === 'looking'
    ? `Hi, my name is ${name || '[Your Name]'}. I am interested in the "${listingTitle}" and I am currently searching for a suitable land parcel to place it on.`
    : `Hi, my name is ${name || '[Your Name]'}. I am interested in the "${listingTitle}" but I have not yet found a land parcel to place it on.`;
  return `${intro} I would love to discuss my options with your team â€” including available land parcels, placement logistics, zoning support, and any land-lease arrangements you may offer. Please reach out at your earliest convenience. Thank you!`;
}

export default function DiscoveryWizard({
  listingId,
  listingTitle,
  price,
  homeType,
  onClose,
  onProceedToPayment,
}: DiscoveryWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 State: Goal
  const [goal, setGoal] = useState<'living' | 'investment' | 'land-placement'>('living');
  
  // Step 2 State: Readiness & Logistics
  const [landOwnership, setLandOwnership] = useState<'owns' | 'looking' | 'none'>('owns');
  const [timeline, setTimeline] = useState<'immediate' | '3-6_months' | '6-12_months'>('immediate');
  const [address, setAddress] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [serviced, setServiced] = useState(true);
  const [agentModal, setAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ name: '', email: '', phone: '' });
  const [agentSubmitted, setAgentSubmitted] = useState(false);

  // Land Support Flow State
  const [supportModal, setSupportModal] = useState(false);
  const [supportStep, setSupportStep] = useState<'prompt' | 'form' | 'sent'>('prompt');
  const [supportForm, setSupportForm] = useState({ name: '', email: '' });
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [pendingLandStatus, setPendingLandStatus] = useState<'looking' | 'none'>('looking');

  // Step 3 State: Financials
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'financing' | 'rent_to_own' | 'deposit' | 'rent'>('financing');
  const [termMonths, setTermMonths] = useState(36); // Default 3-year term

  const handleLandStatusChange = (status: 'owns' | 'looking' | 'none') => {
    setLandOwnership(status);
    if (status === 'looking' || status === 'none') {
      setPendingLandStatus(status);
      setSupportStep('prompt');
      setSupportModal(true);
    }
  };

  const handleSupportPromptYes = () => {
    // Pre-fill message based on what we know
    setSupportMessage(generateSupportMessage(supportForm.name, listingTitle, pendingLandStatus));
    setSupportStep('form');
  };

  const handleSupportPromptNo = () => {
    setSupportModal(false);
  };

  const handleSupportFormChange = (field: 'name' | 'email', value: string) => {
    const updated = { ...supportForm, [field]: value };
    setSupportForm(updated);
    // Regenerate message when name changes
    if (field === 'name') {
      setSupportMessage(generateSupportMessage(value, listingTitle, pendingLandStatus));
    }
  };

  const handleSupportSend = async () => {
    if (!supportForm.name || !supportForm.email) return;
    setSupportSending(true);
    try {
      // Create a support conversation directly
      const res = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: supportForm.name,
          visitorEmail: supportForm.email,
          subject: `Land Search Inquiry â€” ${listingTitle}`,
          sessionId: `wizard-${Date.now()}`,
          initialMessage: supportMessage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Store in localStorage so the SupportWidget picks it up
        if (data?.id) {
          window.localStorage.setItem('collins_support_conversation_id', data.id);
          window.localStorage.setItem('collins_support_visitor_name', supportForm.name);
          window.localStorage.setItem('collins_support_visitor_email', supportForm.email);
          // Dispatch custom event to open the support widget
          window.dispatchEvent(new CustomEvent('open-support-chat', { detail: { conversationId: data.id } }));
        }
      }
      setSupportStep('sent');
    } catch (err) {
      console.error('Support conversation error:', err);
      setSupportStep('sent'); // Still show success to user
    } finally {
      setSupportSending(false);
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentForm.name || !agentForm.email) return;

    try {
      // Connect to regional agent endpoint
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

  // Calculations for Financial roadmap
  const cashTotal = price + shippingFee;

  // Financing: total price includes base + shipping fee
  const totalFinancePrice = price + shippingFee;
  const downPayment = totalFinancePrice * 0.10; // 10% down
  const loanAmount = totalFinancePrice - downPayment;
  const financingMonthly = loanAmount / termMonths;

  // Rent-to-Own math
  const totalRtoPrice = price + shippingFee;
  const rtoDownPayment = totalRtoPrice * 0.10;
  const rtoMonthlyRent = totalRtoPrice * 0.012;
  const rtoMonthlyEquity = (totalRtoPrice * 0.90) / termMonths;
  const rtoTotalMonthly = rtoMonthlyRent + rtoMonthlyEquity;

  // Rent upfront
  const rentMonthly = price * 0.012;
  const rentUpfront = (rentMonthly * 3) + shippingFee;

  const handleFinishWizard = () => {
    let finalType: 'full_purchase' | 'down_payment' | 'monthly_rent' = 'down_payment';
    let finalAmount = downPayment;
    const isRentToOwn = paymentMethod === 'rent_to_own';
    const isRent = paymentMethod === 'rent';

    if (paymentMethod === 'cash') {
      finalType = 'full_purchase';
      finalAmount = cashTotal;
    } else if (paymentMethod === 'deposit') {
      finalType = 'down_payment';
      finalAmount = 2500; // Flat reservation deposit
    } else if (paymentMethod === 'rent_to_own') {
      finalType = 'monthly_rent';
      finalAmount = rtoDownPayment; // Option deposit
    } else if (paymentMethod === 'rent') {
      finalType = 'monthly_rent';
      finalAmount = rentUpfront; // 3 months rent + shippingFee
    } else {
      finalType = 'down_payment';
      finalAmount = downPayment;
    }

    onProceedToPayment(finalType, finalAmount, {
      goal,
      landOwnership,
      timeline,
      paymentMethod,
      termMonths,
      shippingFee,
      shippingAddress: address,
      isRentToOwn,
      isRent,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-md" onClick={onClose} />

      {/* Main Wizard Dialog */}
      <div className="relative z-10 flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/70 glass-modal shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl">
        {/* Rainbow progress bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sage via-clay to-sage-light shrink-0" />

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-sage/10 px-4 py-4 sm:px-6"
          style={{ background: 'rgba(125,142,126,0.06)' }}>
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono uppercase bg-gradient-to-r from-sage to-sage-dark text-white px-3 py-1 rounded-lg font-bold shadow-sm shadow-sage/20">
              Step {step} of 3
            </span>
            <h2 className="font-serif text-base font-semibold text-charcoal sm:text-lg">Discovery Wizard</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl glass border border-white/40 text-charcoal-light hover:text-charcoal flex items-center justify-center transition-all hover:shadow-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Bar */}
        <div className="flex shrink-0 gap-2 border-b border-sage/10 px-4 py-3 sm:px-8" style={{ background: 'rgba(250,250,249,0.7)' }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                s <= step
                  ? 'bg-gradient-to-r from-sage to-sage-dark shadow-sm shadow-sage/30'
                  : 'bg-sage/10'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-8">
          
          {/* STEP 1: GOAL */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center max-w-md mx-auto mb-6">
                <Target className="w-12 h-12 text-sage mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">What is the vision for your tiny home?</h3>
                <p className="text-charcoal-light text-sm mt-1">
                  We customize the construction, specs, and logistics depending on your primary goals.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { id: 'living', title: 'Primary Residence', desc: 'Full-time, sustainable year-round living equipped for maximum efficiency.' },
                  { id: 'investment', title: 'High-Yield Asset', desc: 'Optimized as an Airbnb, short-term rental, or backyard guest studio.' },
                  { id: 'land-placement', title: 'Vacation Retreat', desc: 'Secondary retreat, off-grid sanctuary, or seasonal holiday cabin.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id as any)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                      goal === item.id
                        ? 'border-sage/40 glass-card ring-4 ring-sage/10 shadow-lg shadow-sage/10'
                        : 'border-sage/10 bg-white/60 hover:border-sage/30 hover:shadow-md hover:shadow-sage/5'
                    }`}
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
                        goal === item.id
                          ? 'bg-gradient-to-br from-sage to-sage-dark text-white shadow-md shadow-sage/30'
                          : 'bg-sage/10 text-sage'
                      }`}>
                        <Check className={`w-4 h-4 transition-opacity duration-200 ${goal === item.id ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <h4 className="font-serif font-bold text-charcoal text-base mb-1">{item.title}</h4>
                      <p className="text-xs text-charcoal-light leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: TIMELINE & LOGISTICS */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto mb-4">
                <MapPin className="w-12 h-12 text-sage mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">Readiness & Site Details</h3>
                <p className="text-charcoal-light text-sm mt-1">
                  Let us outline zoning, permitting, and shipping calculations.
                </p>
              </div>

              {/* TIMELINE */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-charcoal-light font-bold">Project Timeline</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: 'immediate', label: 'Immediate (<3 mo)' },
                    { id: '3-6_months', label: 'Planning (3-6 mo)' },
                    { id: '6-12_months', label: 'Future (6-12+ mo)' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeline(t.id as any)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                        timeline === t.id
                          ? 'border-sage/40 bg-gradient-to-br from-sage/10 to-sage/5 text-sage-dark shadow-sm shadow-sage/10'
                          : 'border-sage/15 bg-white/60 hover:border-sage/35 hover:bg-sage/5 text-charcoal-light'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LAND OWNERSHIP */}
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wider text-charcoal-light font-bold">Land Status</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: 'owns', label: 'I own land' },
                    { id: 'looking', label: 'Looking for land' },
                    { id: 'none', label: 'No land found' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleLandStatusChange(l.id as any)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                        landOwnership === l.id
                          ? 'border-sage/40 bg-gradient-to-br from-sage/10 to-sage/5 text-sage-dark shadow-sm shadow-sage/10'
                          : 'border-sage/15 bg-white/60 hover:border-sage/35 hover:bg-sage/5 text-charcoal-light'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Info banner when land status is not "owns" */}
                {(landOwnership === 'looking' || landOwnership === 'none') && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start">
                    <MessageCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Our team can help with land placement</p>
                      <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                        We have access to a network of vetted land parcels and lease options in most regions.
                      </p>
                      <button
                        onClick={() => { setPendingLandStatus(landOwnership as 'looking' | 'none'); setSupportStep('prompt'); setSupportModal(true); }}
                        className="mt-1.5 text-xs font-bold text-amber-900 underline"
                      >
                        Talk to our support team →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* I OWN LAND — show Mapbox Map for location */}
              {landOwnership === 'owns' && (
                <div className="space-y-3 p-5 glass-inset rounded-2xl">
                  <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-sage" /> Land Location & Delivery Quote
                  </h4>
                  <p className="text-xs text-charcoal-light mb-4">
                    Pin your land on the map or search for your location to get a dynamic shipping quote instantly.
                  </p>

                  <MapboxSelector
                    initialAddress={address}
                    onLocationSelect={(data) => {
                      setAddress(data.address);
                      setShippingFee(data.shippingFee);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FINANCIAL ROADMAP */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto mb-4">
                <Landmark className="w-12 h-12 text-sage mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">Your Financial Roadmap</h3>
                <p className="text-charcoal-light text-sm mt-1">
                  Choose a tailored path that matches your current budget capabilities.
                </p>
              </div>

              {/* PAYMENT METHOD CARDS */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { id: 'cash', title: '100% Full Pay', desc: 'Secure direct purchase. Best pricing, no finance fees.' },
                  { id: 'financing', title: 'Term Financing', desc: 'Spread balance over customizable monthly payments.' },
                  { id: 'rent_to_own', title: 'Rent-to-Own', desc: 'Rent and build equity until you fully own the home.' },
                  { id: 'rent', title: 'Strict Rent', desc: 'Pay 3 months rent + $1,500 delivery upfront, then rent monthly.' },
                  { id: 'deposit', title: 'Reserve Slot', desc: 'Hold this unit today with a $2,500 security deposit.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id as any)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col justify-between hover:-translate-y-0.5 ${
                      paymentMethod === item.id
                        ? 'border-sage/40 glass-card shadow-md shadow-sage/10'
                        : 'border-sage/15 bg-white/70 hover:border-sage/30 hover:shadow-sm'
                    } ${item.id === 'deposit' ? 'sm:col-span-2' : ''}`}
                  >
                    <div>
                      <h4 className={`font-bold text-sm mb-1 transition-colors ${
                        paymentMethod === item.id ? 'text-sage-dark' : 'text-charcoal'
                      }`}>{item.title}</h4>
                      <p className="text-[11px] text-charcoal-light leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* SLIDERS & LIVE AMORTIZATION DETAILS */}
              <div className="p-5 glass-inset rounded-2xl space-y-4">
                {paymentMethod === 'financing' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase text-charcoal-light">
                      <span>Term Duration</span>
                      <span className="text-sage-dark">{termMonths} Months ({Math.round(termMonths / 12)} Years)</span>
                    </div>

                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={12}
                      value={termMonths}
                      onChange={(e) => setTermMonths(parseInt(e.target.value))}
                      className="w-full accent-sage"
                    />

                    <div className="pt-3 border-t border-sage/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-charcoal-light">
                        <span>Unit Base Price</span>
                        <span>${price.toLocaleString()}</span>
                      </div>
                      {shippingFee > 0 && (
                        <>
                          <div className="flex items-center justify-between text-xs text-charcoal-light">
                            <span>Logistics Shipping Quote</span>
                            <span>${shippingFee.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                            <span>Total Combined Cost</span>
                            <span>${totalFinancePrice.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between text-xs text-charcoal-light">
                        <span>Down Payment Required (10%)</span>
                        <span>${downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold text-charcoal pt-2.5 border-t border-sage/10">
                        <span>Amortized Monthly Payment</span>
                        <span className="font-serif text-lg text-sage-dark">${financingMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="space-y-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Tiny Home Base Cost:</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Shipping/Logistics Quote:</span>
                      <span>${shippingFee > 0 ? shippingFee.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'TBD'}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 border-t border-sage/10 pt-3 font-bold text-charcoal">
                      <span>Total Purchase Obligation:</span>
                      <span className="font-serif text-lg text-sage-dark">${cashTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'rent_to_own' && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Total Home Value</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Option Deposit (10%)</span>
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
                      <span className="font-serif text-lg text-sage-dark">${rtoTotalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                    </div>
                    <p className="text-[10px] text-charcoal-light mt-1 leading-relaxed">
                      Equity accumulates each month. Own the home outright after {termMonths} months.
                    </p>
                  </div>
                )}

                {paymentMethod === 'rent' && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Tiny Home Base Cost:</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>Monthly Rent (1.2%):</span>
                      <span>${Math.round(price * 0.012).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                      <span>3 Months Upfront Rent:</span>
                      <span>${Math.round(price * 0.012 * 3).toLocaleString()}</span>
                    </div>
                    {shippingFee > 0 && (
                      <div className="flex flex-wrap justify-between gap-2 text-charcoal-light">
                        <span>Logistics Shipping/Delivery Fee:</span>
                        <span>${shippingFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="h-px bg-sage/10 my-1" />
                    <div className="flex flex-wrap justify-between gap-2 font-bold text-charcoal">
                      <span>Total Upfront Due Now:</span>
                      <span className="font-serif text-lg text-sage-dark">${rentUpfront.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-charcoal-light mt-1 leading-relaxed">
                      You are choosing strict monthly rental. Pay 3 months upfront + delivery fee today, then standard monthly rent of ${Math.round(price * 0.012).toLocaleString()}/mo.
                    </p>
                  </div>
                )}

                {paymentMethod === 'deposit' && (
                  <div className="space-y-3 text-sm text-center py-2">
                    <p className="text-xs text-charcoal-light leading-relaxed">
                      We will hold this specific unit for <strong>14 days</strong> under a fully refundable security deposit while we verify permits, site access, and finish structural configurations.
                    </p>
                    <div className="flex items-center justify-center gap-1 font-serif text-2xl font-bold text-sage-dark">
                      <DollarSign className="w-5 h-5 shrink-0" />
                      <span>2,500.00</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer controls */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/50 p-4 sm:p-6"
          style={{ background: 'rgba(125,142,126,0.05)' }}>
          <button
            onClick={() => step > 1 ? setStep((s) => (s - 1) as any) : onClose()}
            className="flex items-center gap-2 rounded-2xl glass border border-white/50 px-4 py-3 text-sm font-semibold text-charcoal transition-all hover:border-sage/30 hover:shadow-md sm:px-5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sage to-sage-dark px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sage/30 transition-all hover:shadow-sage/40 hover:-translate-y-0.5 active:translate-y-0 sm:px-6"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishWizard}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sage to-sage-dark px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sage/30 transition-all hover:shadow-sage/40 hover:-translate-y-0.5 active:translate-y-0 glow-sage sm:px-6"
            >
              <span>Review & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          LAND SUPPORT MODAL â€” Talk to Support flow
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AnimatePresence>
        {supportModal && (
          <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-charcoal/75 backdrop-blur-md" onClick={() => setSupportModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 max-h-[100dvh] w-full overflow-hidden rounded-t-3xl border border-white/60 glass-modal shadow-2xl sm:max-w-md sm:rounded-3xl"
            >
              <div className="h-1 w-full bg-gradient-to-r from-sage via-clay to-sage-light" />
              <div className="max-h-[calc(100dvh-0.25rem)] space-y-5 overflow-y-auto p-4 sm:p-8">

                {/* PROMPT STEP */}
                {supportStep === 'prompt' && (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-6 h-6 text-sage" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-charcoal font-semibold">
                          {pendingLandStatus === 'looking' ? "Still searching for land?" : "Haven't found land yet?"}
                        </h3>
                        <p className="text-xs text-charcoal-light mt-1 leading-relaxed">
                          {pendingLandStatus === 'looking'
                            ? "No worries â€” our support team has access to vetted land parcels and lease options across all regions. Would you like us to help you find the right spot?"
                            : "Our specialists can connect you with available land parcels, zoning support, and lease-to-own land arrangements. Want to start a conversation?"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={handleSupportPromptYes}
                        className="flex-1 py-3.5 rounded-2xl bg-sage hover:bg-sage-dark text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-sage/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Yes, let's talk!
                      </button>
                      <button
                        onClick={handleSupportPromptNo}
                        className="flex-1 py-3.5 rounded-2xl border border-sage/20 bg-white text-charcoal font-semibold text-sm hover:border-sage/40 transition-colors"
                      >
                        No, continue
                      </button>
                    </div>
                  </>
                )}

                {/* FORM STEP */}
                {supportStep === 'form' && (
                  <>
                    <div>
                      <h3 className="font-serif text-lg text-charcoal font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-sage" />
                        Draft Your Message
                      </h3>
                      <p className="text-xs text-charcoal-light mt-1">
                        We've written a message for you â€” feel free to edit it before sending.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          required
                          value={supportForm.name}
                          onChange={(e) => handleSupportFormChange('name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage pl-10"
                        />
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light/40" />
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="Your Email Address *"
                          required
                          value={supportForm.email}
                          onChange={(e) => handleSupportFormChange('email', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage pl-10"
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-light/40" />
                      </div>

                      {/* Editable message */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-charcoal-light font-bold flex items-center gap-1.5">
                          <Edit3 className="w-3 h-3" /> Your Message (editable)
                        </label>
                        <textarea
                          rows={5}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none focus:border-sage resize-none leading-relaxed text-charcoal"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSupportStep('prompt')}
                        className="px-5 py-3 rounded-xl border border-sage/20 text-charcoal text-xs font-semibold hover:border-sage/40 transition-colors flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                      <button
                        onClick={handleSupportSend}
                        disabled={!supportForm.name || !supportForm.email || supportSending}
                        className="flex-1 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-sage/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {supportSending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sendingâ€¦</>
                        ) : (
                          <><Send className="w-4 h-4" /> Send to Support</>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* SENT STEP */}
                {supportStep === 'sent' && (
                  <div className="text-center space-y-5 py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-16 h-16 rounded-full bg-sage/15 border-4 border-sage/25 flex items-center justify-center mx-auto"
                    >
                      <Check className="w-8 h-8 text-sage" />
                    </motion.div>
                    <div>
                      <h4 className="font-serif font-bold text-charcoal text-base">Message Sent!</h4>
                      <p className="text-xs text-charcoal-light mt-1.5 leading-relaxed max-w-xs mx-auto">
                        Your inquiry has been received. A support specialist will respond shortly. Check the live chat bubble at the bottom of your screen.
                      </p>
                    </div>
                    <button
                      onClick={() => { setSupportModal(false); onClose(); }}
                      className="px-6 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white text-xs font-bold transition-all shadow-md shadow-sage/20"
                    >
                      Open Support Chat
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Regional Agent Modal Overlay */}
      <AnimatePresence>
        {agentModal && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="absolute inset-0 bg-charcoal/80" onClick={() => setAgentModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 max-h-[100dvh] w-full space-y-5 overflow-y-auto rounded-t-3xl border border-sage/15 bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-8"
            >
              <h3 className="font-serif text-lg text-charcoal font-semibold flex items-center gap-2">
                <Landmark className="w-5 h-5 text-sage" /> Connect with Regional Agent
              </h3>
              <p className="text-xs text-charcoal-light leading-relaxed">
                As this requires customized regional coordination, a certified specialist in your territory will be assigned to secure zoning permits, logistics, and site compatibility.
              </p>

              {agentSubmitted ? (
                <div className="bg-sage/10 border border-sage/20 rounded-2xl p-6 text-center space-y-2">
                  <Check className="w-8 h-8 text-sage mx-auto" />
                  <h4 className="font-serif font-bold text-charcoal text-sm">Territorial Assignment Pending</h4>
                  <p className="text-[11px] text-charcoal-light">
                    Your request has been filed in the CRM. The nearest territorial agent is reviewing the routing feasibility. They will call you shortly.
                  </p>
                  <button
                    onClick={() => { setAgentModal(false); setLandOwnership('looking'); }}
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
                    Assign Specialist
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

