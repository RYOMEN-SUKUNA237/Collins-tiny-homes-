'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Target, MapPin, Landmark, ArrowRight, ArrowLeft,
  DollarSign, Check, Phone, Mail, User, ShieldAlert
} from 'lucide-react';
import Image from 'next/image';

interface DiscoveryWizardProps {
  listingId: string;
  listingTitle: string;
  price: number;
  onClose: () => void;
  onProceedToPayment: (paymentType: 'full_purchase' | 'down_payment' | 'monthly_rent', amount: number, meta: {
    goal: string;
    landOwnership: string;
    timeline: string;
    paymentMethod: string;
    termMonths: number;
    shippingFee: number;
    shippingAddress: string;
  }) => void;
}

export default function DiscoveryWizard({
  listingId,
  listingTitle,
  price,
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

  // Step 3 State: Financials
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'financing' | 'deposit'>('financing');
  const [termMonths, setTermMonths] = useState(36); // Default 3-year term

  // Simulated Google Autocomplete matching regional agents
  const MOCK_ADDRESSES = [
    { name: '123 Pine St, Seattle, WA', lat: 47.6062, lng: -122.3321, distance: 10, serviced: true },
    { name: '456 Oak Ave, Denver, CO', lat: 39.7392, lng: -104.9903, distance: 45, serviced: true },
    { name: '789 Maple Rd, Austin, TX', lat: 30.2672, lng: -97.7431, distance: 120, serviced: true },
    { name: '321 Elm Blvd, Atlanta, GA', lat: 33.7490, lng: -84.3880, distance: 280, serviced: true },
    { name: '555 Cedar Ln, Boston, MA', lat: 42.3601, lng: -71.0589, distance: 15, serviced: true },
    { name: '999 Forbidden Sands Rd, Anchorage, AK', lat: 61.2181, lng: -149.9003, distance: 2000, serviced: false }
  ];

  const handleAddressSelect = (addr: string) => {
    setAddress(addr);
    const matched = MOCK_ADDRESSES.find(a => a.name === addr) || {
      name: addr, lat: 41.8781, lng: -87.6298, distance: 400, serviced: true
    };
    
    if (!matched.serviced) {
      setServiced(false);
      setShippingFee(0);
    } else {
      setServiced(true);
      // Delivery fee is calculated as $1500 base + $3.50 per mile
      const fee = 1500 + matched.distance * 3.50;
      setShippingFee(fee);
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
  const downPayment = price * 0.20; // 20% down
  const loanAmount = price - downPayment;
  const financingMonthly = loanAmount / termMonths;
  const cashTotal = price + shippingFee;

  const handleFinishWizard = () => {
    let finalType: 'full_purchase' | 'down_payment' | 'monthly_rent' = 'down_payment';
    let finalAmount = downPayment;

    if (paymentMethod === 'cash') {
      finalType = 'full_purchase';
      finalAmount = price + shippingFee;
    } else if (paymentMethod === 'deposit') {
      finalType = 'down_payment';
      finalAmount = 2500; // Flat reservation deposit
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
      shippingAddress: address
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
                      onClick={() => {
                        setLandOwnership(l.id as any);
                        if (l.id === 'none') {
                          setAgentModal(true);
                        }
                      }}
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
              </div>

              {/* SHIPPING ESTIMATION / GOOGLE MAPS AUTOCOMPLETE */}
              <div className="space-y-3 p-5 bg-sage/5 border border-sage/10 rounded-2xl">
                <h4 className="font-serif font-bold text-charcoal text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sage" /> Delivery Address & Shipping Quote
                </h4>
                <p className="text-xs text-charcoal-light">
                  Input your delivery region to calculate professional shipping fees.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter shipping address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-sage/20 bg-white text-sm outline-none text-charcoal focus:border-sage"
                  />
                  {address && !MOCK_ADDRESSES.map(a => a.name).includes(address) && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-sage/15 rounded-xl shadow-xl mt-1.5 overflow-hidden z-20">
                      {MOCK_ADDRESSES.map((m) => (
                        <button
                          key={m.name}
                          onClick={() => handleAddressSelect(m.name)}
                          className="w-full text-left px-4 py-2.5 hover:bg-sage/5 text-xs text-charcoal border-b border-sage/5 last:border-b-0"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {address && (
                  <div className="mt-4 pt-3 border-t border-sage/10">
                    {serviced ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-charcoal-light">Estimated Delivery Fee:</span>
                        <span className="font-serif font-bold text-sage-dark">${shippingFee.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-red-800">Unserviced Delivery Zone</p>
                          <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                            We do not currently offer automated self-delivery to this location. You must connect with a regional agent to secure private logistics.
                          </p>
                          <button
                            onClick={() => setAgentModal(true)}
                            className="mt-2 text-xs font-bold text-red-800 underline hover:text-red-950"
                          >
                            Assign Regional Agent &rarr;
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { id: 'cash', title: '100% Full Pay', desc: 'Secure direct purchase. Best pricing, no finance fees.' },
                  { id: 'financing', title: 'Term Financing', desc: 'Spread balance over customizable low monthly fees.' },
                  { id: 'deposit', title: 'Reserve Slot', desc: 'Hold this unit today with a small security deposit.' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id as any)}
                    className={`p-4 rounded-xl border-2 text-left transition-colors flex flex-col justify-between ${
                      paymentMethod === item.id 
                        ? 'border-sage bg-sage/5' 
                        : 'border-sage/15 bg-white hover:border-sage/35'
                    }`}
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
                        <span>Down Payment Required (20%)</span>
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
                      <span>${shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-charcoal pt-3 border-t border-sage/10">
                      <span>Total Purchase Obligation:</span>
                      <span className="font-serif text-lg text-sage-dark">${cashTotal.toLocaleString()}</span>
                    </div>
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
