'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CreditCard, Lock, Loader2, ShieldCheck, AlertCircle,
  Phone, MapPin, Building2, Globe, Mail, CheckCircle2
} from 'lucide-react';

interface PaymentModalProps {
  listingId: string;
  listingTitle: string;
  amount: number;
  paymentType: 'full_purchase' | 'down_payment' | 'monthly_rent';
  wizardData?: any;
  onClose: () => void;
}

type Step = 'form' | 'processing' | 'success' | 'declined' | 'final_declined';

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length >= 7) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length >= 4) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return digits;
}

function getCardType(number: string) {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6/.test(n)) return 'Discover';
  return '';
}

export default function PaymentModal({
  listingId,
  listingTitle,
  amount,
  paymentType,
  wizardData,
  onClose,
}: PaymentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('form');
  const [attemptCount, setAttemptCount] = useState(0);
  const [createdProjId, setCreatedProjId] = useState('');
  const [createdCaseNum, setCreatedCaseNum] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingCountry: '',
    shippingZip: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'Full name is required';
    if (!form.customerEmail.trim() || !/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Valid email is required';
    if (form.customerPhone.replace(/\D/g, '').length < 7) e.customerPhone = 'Valid phone number is required';
    if (!form.shippingAddress.trim()) e.shippingAddress = 'Shipping address is required';
    if (!form.shippingCity.trim()) e.shippingCity = 'City is required';
    if (!form.shippingState.trim()) e.shippingState = 'State/Province is required';
    if (!form.shippingCountry.trim()) e.shippingCountry = 'Country is required';
    if (!form.shippingZip.trim()) e.shippingZip = 'ZIP/Postal code is required';
    const rawCard = form.cardNumber.replace(/\s/g, '');
    if (rawCard.length < 13) e.cardNumber = 'Enter a valid card number';
    const [mm, yy] = form.cardExpiry.split('/');
    if (!mm || !yy || parseInt(mm) > 12 || parseInt(mm) < 1) e.cardExpiry = 'Enter valid expiry (MM/YY)';
    if (form.cardCvc.length < 3) e.cardCvc = 'Enter valid CVC';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setStep('processing');
    const currentAttempt = attemptCount + 1;
    setAttemptCount(currentAttempt);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 2500));

    const isDeclined = form.cardNumber.replace(/\s/g, '').startsWith('4111');
    const payStatus = isDeclined ? 'declined' : 'success';

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          amount,
          paymentType,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          shippingAddress: form.shippingAddress,
          shippingCity: form.shippingCity,
          shippingState: form.shippingState,
          shippingCountry: form.shippingCountry,
          shippingZip: form.shippingZip,
          cardNumber: form.cardNumber.replace(/\s/g, ''),
          cardExpiry: form.cardExpiry,
          cardCvc: form.cardCvc,
          status: payStatus,
          wizardData: wizardData || {}
        }),
      });

      const res = await response.json();

      if (payStatus === 'success' && res.projectId) {
        setCreatedProjId(res.projectId);
        setCreatedCaseNum(res.caseNumber);
        setStep('success');
        
        setTimeout(() => {
          router.push(`/portal/${res.projectId}`);
        }, 3500);
        return;
      }
    } catch (err) {
      console.error('API Error during checkout:', err);
    }

    if (currentAttempt === 1) {
      setStep('declined');
    } else {
      setStep('final_declined');
    }
  };

  const handleTryAnotherCard = () => {
    // Clear only card details so they enter a new card
    setForm(prev => ({
      ...prev,
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    }));
    setErrors({});
    setStep('form');
  };

  const paymentLabel: Record<string, string> = {
    full_purchase: 'Full Purchase',
    down_payment: 'Down Payment',
    monthly_rent: 'Monthly Rent',
  };

  const cardType = getCardType(form.cardNumber);

  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-charcoal text-sm placeholder:text-charcoal-light/50 outline-none transition-colors ${errors[field] ? 'border-red-400 bg-red-50' : 'border-sage/20 focus:border-sage/60'}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          onClick={step === 'declined' || step === 'final_declined' ? onClose : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header gradient strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-sage via-sage-light to-clay shrink-0" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center text-charcoal-light hover:text-charcoal hover:bg-sage/20 transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 overflow-y-auto flex-1">
            {/* === FORM STEP === */}
            {step === 'form' && (
              <div>
                {/* Title */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-sage/10 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-sage" />
                    </div>
                    <h2 className="font-serif text-xl text-charcoal font-semibold">Secure Payment</h2>
                  </div>
                  <p className="text-sm text-charcoal-light ml-10">
                    {paymentLabel[paymentType]} for <span className="font-medium text-charcoal">{listingTitle}</span>
                  </p>
                </div>

                {/* Amount summary */}
                <div className="bg-sage/5 border border-sage/15 rounded-2xl p-4 mb-5 flex items-center justify-between">
                  <span className="text-sm text-charcoal-light">Total due today</span>
                  <span className="font-serif text-2xl font-bold text-charcoal">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Card visual */}
                <div className="relative h-36 rounded-2xl bg-gradient-to-br from-charcoal to-charcoal-light p-5 mb-5 overflow-hidden">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #7a9e7e 0%, transparent 50%), radial-gradient(circle at 20% 80%, #c4a882 0%, transparent 50%)' }}
                  />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90" />
                      <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
                        {cardType || 'Card'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-mono text-lg tracking-widest mb-2">
                        {form.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Card Holder</p>
                          <p className="text-white text-sm font-medium truncate max-w-[180px]">
                            {form.customerName || 'Your Name'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Expires</p>
                          <p className="text-white text-sm font-medium">{form.cardExpiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* ── PERSONAL INFO SECTION ── */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold mb-2 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Personal Information
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Full name"
                          value={form.customerName}
                          onChange={e => set('customerName', e.target.value)}
                          className={inputCls('customerName')}
                        />
                        {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email address"
                          value={form.customerEmail}
                          onChange={e => set('customerEmail', e.target.value)}
                          className={inputCls('customerEmail')}
                        />
                        {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="relative">
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={form.customerPhone}
                          onChange={e => set('customerPhone', formatPhone(e.target.value))}
                          className={inputCls('customerPhone')}
                        />
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-light/40" />
                      </div>
                      {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>}
                    </div>
                  </div>

                  {/* ── SHIPPING ADDRESS SECTION ── */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Shipping Address
                    </p>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Street address (e.g. 123 Main St, Apt 4B)"
                          value={form.shippingAddress}
                          onChange={e => set('shippingAddress', e.target.value)}
                          className={inputCls('shippingAddress')}
                        />
                        {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="City / Town"
                              value={form.shippingCity}
                              onChange={e => set('shippingCity', e.target.value)}
                              className={inputCls('shippingCity')}
                            />
                            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-light/40" />
                          </div>
                          {errors.shippingCity && <p className="text-red-500 text-xs mt-1">{errors.shippingCity}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="State / Province"
                            value={form.shippingState}
                            onChange={e => set('shippingState', e.target.value)}
                            className={inputCls('shippingState')}
                          />
                          {errors.shippingState && <p className="text-red-500 text-xs mt-1">{errors.shippingState}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Country / Region"
                              value={form.shippingCountry}
                              onChange={e => set('shippingCountry', e.target.value)}
                              className={inputCls('shippingCountry')}
                            />
                            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-light/40" />
                          </div>
                          {errors.shippingCountry && <p className="text-red-500 text-xs mt-1">{errors.shippingCountry}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="ZIP / Postal code"
                            value={form.shippingZip}
                            onChange={e => set('shippingZip', e.target.value)}
                            className={inputCls('shippingZip')}
                          />
                          {errors.shippingZip && <p className="text-red-500 text-xs mt-1">{errors.shippingZip}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── CARD DETAILS SECTION ── */}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> Card Details
                    </p>
                    {/* Card number */}
                    <div>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Card number"
                          value={form.cardNumber}
                          onChange={e => set('cardNumber', formatCardNumber(e.target.value))}
                          className={`${inputCls('cardNumber')} font-mono pr-16`}
                        />
                        {cardType && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-charcoal-light bg-sage/10 px-2 py-0.5 rounded">
                            {cardType}
                          </span>
                        )}
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>

                    {/* Expiry + CVC */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/YY"
                          value={form.cardExpiry}
                          onChange={e => set('cardExpiry', formatExpiry(e.target.value))}
                          className={`${inputCls('cardExpiry')} font-mono`}
                        />
                        {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="CVC"
                          maxLength={4}
                          value={form.cardCvc}
                          onChange={e => set('cardCvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className={`${inputCls('cardCvc')} font-mono`}
                        />
                        {errors.cardCvc && <p className="text-red-500 text-xs mt-1">{errors.cardCvc}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-center gap-2 mt-4 mb-5">
                  <Lock className="w-3.5 h-3.5 text-sage shrink-0" />
                  <p className="text-xs text-charcoal-light">
                    Secure 256-bit SSL encrypted connection. Your billing and personal details are processed with absolute privacy.
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-sage to-sage-dark text-white font-bold text-sm shadow-lg shadow-sage/30 hover:shadow-sage/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Pay ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Securely
                </button>
              </div>
            )}

            {/* === PROCESSING STEP === */}
            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-sage animate-spin" />
                </div>
                <h2 className="font-serif text-2xl text-charcoal font-semibold mb-2">Processing Payment</h2>
                <p className="text-charcoal-light text-sm">Please wait while we securely process your payment…</p>
                <div className="mt-6 flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-sage animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* === SUCCESS STEP === */}
            {step === 'success' && (
              <div className="py-12 flex flex-col items-center text-center space-y-6">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-24 h-24 rounded-full bg-sage/15 border-4 border-sage/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-sage" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="font-serif text-2xl text-charcoal font-semibold">Payment Successful!</h2>
                  <p className="text-sm text-charcoal-light max-w-xs">
                    Your down payment has been processed securely. A record of this transaction has been filed.
                  </p>
                </div>

                <div className="p-5 bg-sage/5 border border-sage/10 rounded-2xl w-full max-w-sm text-left space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-charcoal-light">Operations Status:</span>
                    <span className="font-bold text-sage-dark">AwaitingProcessing</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-charcoal-light">Onboarding Case ID:</span>
                    <span className="font-mono font-bold text-charcoal">{createdCaseNum || 'CTH-CASE-GEN'}</span>
                  </div>
                  <div className="h-px bg-sage/10" />
                  <p className="text-[10px] text-charcoal-light leading-relaxed">
                    Redirecting you to your secure **Client Support Center**... Our Operations and Logistics team are preparing site-access guidelines.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-sage animate-spin" />
                  <span className="text-xs text-sage font-semibold">Initializing Client Support Dashboard...</span>
                </div>
              </div>
            )}

            {/* === FIRST DECLINED STEP — prompt to try another card === */}
            {step === 'declined' && (
              <div className="py-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mb-6"
                >
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </motion.div>
                <h2 className="font-serif text-2xl text-charcoal font-semibold mb-2">Card Declined</h2>
                <p className="text-charcoal-light text-sm mb-2 max-w-xs">
                  Your card ending in <strong className="font-mono">{form.cardNumber.replace(/\s/g, '').slice(-4)}</strong> was declined by the issuing bank.
                </p>
                <p className="text-charcoal-light text-xs mb-6 max-w-xs">
                  Please check your card details or try a different payment method.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-xs text-red-700 mb-6 max-w-xs">
                  <p className="font-semibold mb-1">Possible reasons:</p>
                  <ul className="text-left list-disc list-inside space-y-0.5">
                    <li>Insufficient funds</li>
                    <li>Incorrect card number or CVV</li>
                    <li>Card expired or frozen</li>
                    <li>Transaction blocked by your bank</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleTryAnotherCard}
                    className="px-6 py-3 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Try Another Card
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-sage/10 text-charcoal font-semibold text-sm hover:bg-sage/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* === FINAL DECLINED STEP — contact support === */}
            {step === 'final_declined' && (
              <div className="py-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center mb-6"
                >
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </motion.div>
                <h2 className="font-serif text-2xl text-charcoal font-semibold mb-2">Payment Unsuccessful</h2>
                <p className="text-charcoal-light text-sm mb-4 max-w-xs">
                  We were unable to process your payment after multiple attempts. This card has also been declined.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 max-w-xs text-left">
                  <p className="font-semibold text-amber-900 text-sm mb-2">What to do next:</p>
                  <div className="space-y-3 text-xs text-amber-800">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-semibold">Call our support team</p>
                        <p className="text-amber-700">+1 (800) 555-0199</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-semibold">Email the dealer</p>
                        <p className="text-amber-700">support@collinstinyhomes.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="font-semibold">Visit our showroom</p>
                        <p className="text-amber-700">Mon–Sat, 9 AM – 6 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-charcoal-light mb-6 max-w-xs">
                  Our team can assist you with alternative payment methods including wire transfer, bank draft, or in-person payment.
                </p>

                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl bg-charcoal text-white font-semibold text-sm hover:bg-charcoal-light transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
