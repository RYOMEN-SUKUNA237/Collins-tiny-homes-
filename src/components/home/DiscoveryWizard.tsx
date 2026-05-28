'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Target, MapPin, Landmark, ArrowRight, ArrowLeft,
  DollarSign, Check, Phone, Mail, User,
  MessageCircle, Edit3, Send, Loader2
} from 'lucide-react';
import { getDeterministicShippingFee } from '@/lib/shipping';

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
  return `${intro} I would love to discuss my options with your team — including available land parcels, placement logistics, zoning support, and any land-lease arrangements you may offer. Please reach out at your earliest convenience. Thank you!`;
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

  const handleAddressChange = (addr: string) => {
    setAddress(addr);
    if (!addr.trim()) {
      setShippingFee(0);
    } else {
      const fee = getDeterministicShippingFee(addr, homeType);
      setShippingFee(fee);
    }
  };

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
          subject: `Land Search Inquiry — ${listingTitle}`,
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
  const downPayment = price * 0.10; // 10% down
  const loanAmount = price - downPayment;
  const financingMonthly = loanAmount / termMonths;
  const cashTotal = price + shippingFee;

  // Rent-to-Own math
  const rtoDownPayment = price * 0.10;
  const rtoMonthlyRent = price * 0.012;
  const rtoMonthlyEquity = (price * 0.90) / termMonths;
  const rtoTotalMonthly = rtoMonthlyRent + rtoMonthlyEquity;

  const handleFinishWizard = () => {
    let finalType: 'full_purchase' | 'down_payment' | 'monthly_rent' = 'down_payment';
    let finalAmount = downPayment;
    const isRentToOwn = paymentMethod === 'rent_to_own';
    const isRent = paymentMethod === 'rent';

    if (paymentMethod === 'cash') {
      finalType = 'full_purchase';
      finalAmount = price + shippingFee;
    } else if (paymentMethod === 'deposit') {
      finalType = 'down_payment';
      finalAmount = 2500; // Flat reservation deposit
    } else if (paymentMethod === 'rent_to_own') {
      finalType = 'monthly_rent';
      finalAmount = rtoDownPayment; // Option deposit
    } else if (paymentMethod === 'rent') {
      finalType = 'monthly_rent';
      finalAmount = (price * 0.012 * 3) + 1500;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={onClose} />

      {/* Main Wizard Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 border border-sage/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-sage via-sage-light to-clay shrink-0" />

        {/* Header */}
        <div className="p-6 border-b border-sage/10 flex items-center justify-between shrink-0 bg-sage/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase bg-sage/20 text-sage-dark px-3 py-1 rounded-lg font-bold">
              Step {step} of 3
            </span>
            <h2 className="font-serif text-lg text-charcoal font-semibold">Discovery Wizard</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-sage/10 text-charcoal-light hover:text-charcoal hover:bg-sage/25 flex items-center justify-center transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps Bar */}
        <div className="px-8 py-3 bg-offwhite border-b border-sage/10 flex gap-2 shrink-0">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-sage' : 'bg-sage/10'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          
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

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'living', title: 'Primary Residence', desc: 'Full-time, sustainable year-round living equipped for maximum efficiency.' },
                  { id: 'investment', title: 'High-Yield Asset', desc: 'Optimized as an Airbnb, short-term rental, or backyard guest studio.' },
                  { id: 'land-placement', title: 'Vacation Retreat', desc: 'Secondary retreat, off-grid sanctuary, or seasonal holiday cabin.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id as any)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-sm flex flex-col justify-between ${
                      goal === item.id 
                        ? 'border-sage bg-sage/5 ring-4 ring-sage/10' 
                        : 'border-sage/10 bg-white hover:border-sage/35'
                    }`}
                  >
                    <div>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${
                        goal === item.id ? 'bg-sage text-white' : 'bg-sage/10 text-sage'
                      }`}>
                        <Check className={`w-4 h-4 ${goal === item.id ? 'opacity-100' : 'opacity-0'}`} />
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
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'immediate', label: 'Immediate (<3 mo)' },
                    { id: '3-6_months', label: 'Planning (3-6 mo)' },
                    { id: '6-12_months', label: 'Future (6-12+ mo)' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeline(t.id as any)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                        timeline === t.id 
                          ? 'border-sage bg-sage/5 text-sage-dark' 
                          : 'border-sage/15 hover:border-sage/40 text-charcoal-light'
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
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'owns', label: 'I own land' },
                    { id: 'looking', label: 'Looking for land' },
                    { id: 'none', label: 'No land found' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleLandStatusChange(l.id as any)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                        landOwnership === l.id 
                          ? 'border-sage bg-sage/5 text-sage-dark' 
                          : 'border-sage/15 hover:border-sage/40 text-charcoal-light'
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

              {/* I OWN LAND — show address input for location */}
              {landOwnership === 'owns' && (
                <div className="space-y-3 p-5 bg-sage/5 border border-sage/10 rounded-2xl">
                  <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sage" /> Land Location & Delivery Quote
                  </h4>
                  <p className="text-xs text-charcoal-light">
                    Enter your land's address or delivery region to get an instant shipping fee estimate ($1,500 flat).
                  </p>

                  <input
                    type="text"
                    placeholder="Enter your delivery address..."
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-white text-sm outline-none text-charcoal focus:border-sage"
                  />

                  {address && shippingFee > 0 && (
                    <div className="mt-1 pt-3 border-t border-sage/10 flex items-center justify-between text-sm">
                      <span className="text-charcoal-light">Estimated Delivery Fee:</span>
                      <span className="font-serif font-bold text-sage-dark">${shippingFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
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
              <div className="grid grid-cols-2 gap-3">
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
                    className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col justify-between ${
                      paymentMethod === item.id 
                        ? 'border-sage bg-sage/5' 
                        : 'border-sage/15 bg-white hover:border-sage/35'
                    } ${item.id === 'deposit' ? 'col-span-2' : ''}`}
                  >
                    <div>
                      <h4 className="font-bold text-charcoal text-sm mb-1">{item.title}</h4>
                      <p className="text-[11px] text-charcoal-light leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* SLIDERS & LIVE AMORTIZATION DETAILS */}
              <div className="p-5 bg-offwhite border border-sage/10 rounded-2xl space-y-4">
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
                      <div className="flex items-center justify-between text-xs text-charcoal-light">
                        <span>Down Payment Required (10%)</span>
                        <span>${downPayment.toLocaleString()}</span>
                      </div>
                      {shippingFee > 0 && (
                        <div className="flex items-center justify-between text-xs text-charcoal-light">
                          <span>Logistics Shipping Quote</span>
                          <span>${shippingFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm font-bold text-charcoal pt-2.5 border-t border-sage/10">
                        <span>Amortized Monthly Payment</span>
                        <span className="font-serif text-lg text-sage-dark">${financingMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-charcoal-light">
                      <span>Tiny Home Base Cost:</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Shipping/Logistics Quote:</span>
                      <span>${shippingFee > 0 ? shippingFee.toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'TBD'}</span>
                    </div>
                    <div className="flex justify-between font-bold text-charcoal pt-3 border-t border-sage/10">
                      <span>Total Purchase Obligation:</span>
                      <span className="font-serif text-lg text-sage-dark">${cashTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'rent_to_own' && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-charcoal-light">
                      <span>Total Home Value</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Option Deposit (10%)</span>
                      <span>${rtoDownPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Base Monthly Rent</span>
                      <span>${rtoMonthlyRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Monthly Equity Builder</span>
                      <span>${rtoMonthlyEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                    </div>
                    <div className="h-px bg-sage/10 my-1" />
                    <div className="flex justify-between font-bold text-charcoal">
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
                    <div className="flex justify-between text-charcoal-light">
                      <span>Tiny Home Base Cost:</span>
                      <span>${price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Monthly Rent (1.2%):</span>
                      <span>${Math.round(price * 0.012).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>3 Months Upfront Rent:</span>
                      <span>${Math.round(price * 0.012 * 3).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-light">
                      <span>Logistics Shipping/Delivery Fee:</span>
                      <span>$1,500</span>
                    </div>
                    <div className="h-px bg-sage/10 my-1" />
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>Total Upfront Due Now:</span>
                      <span className="font-serif text-lg text-sage-dark">${Math.round(price * 0.012 * 3 + 1500).toLocaleString()}</span>
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
        <div className="p-6 border-t border-sage/10 flex items-center justify-between shrink-0 bg-sage/5">
          <button
            onClick={() => step > 1 ? setStep((s) => (s - 1) as any) : onClose()}
            className="px-5 py-3 rounded-2xl bg-white border border-sage/20 text-charcoal hover:border-sage text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Back'}</span>
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-6 py-3 rounded-2xl bg-sage hover:bg-sage-dark text-white text-sm font-bold shadow-lg shadow-sage/25 transition-all flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishWizard}
              className="px-6 py-3 rounded-2xl bg-sage hover:bg-sage-dark text-white text-sm font-bold shadow-lg shadow-sage/25 transition-all flex items-center gap-2"
            >
              <span>Review & Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          LAND SUPPORT MODAL — Talk to Support flow
      ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {supportModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/80" onClick={() => setSupportModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sage/15 z-10 overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-sage to-clay" />
              <div className="p-8 space-y-5">

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
                            ? "No worries — our support team has access to vetted land parcels and lease options across all regions. Would you like us to help you find the right spot?"
                            : "Our specialists can connect you with available land parcels, zoning support, and lease-to-own land arrangements. Want to start a conversation?"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
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
                        We've written a message for you — feel free to edit it before sending.
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
                          <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
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
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-charcoal/80" onClick={() => setAgentModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-sage/15 z-10 space-y-5"
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
