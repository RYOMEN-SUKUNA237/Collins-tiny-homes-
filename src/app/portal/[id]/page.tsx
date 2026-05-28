'use client';

import { useState, useEffect, use } from 'react';
import { supabaseClient as supabase } from '@/lib/supabase-client';
import {
  ShieldAlert, Send, FileText, Download, CheckCircle,
  Clock, ShieldCheck, HelpCircle, Hammer, Info, DollarSign
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function ClientPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  
  const [project, setProject] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [supportCase, setSupportCase] = useState<any>(null);
  const [financePlan, setFinancePlan] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [sliderMonths, setSliderMonths] = useState(36);

  // Poll for updates in real-time
  useEffect(() => {
    async function loadData() {
      try {
        const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single();
        if (proj) {
          setProject(proj);
          const { data: list } = await supabase.from('listings').select('*').eq('id', proj.listing_id).single();
          setListing(list);
          const { data: c } = await supabase.from('cases').select('*').eq('project_id', projectId).single();
          setSupportCase(c);
          const { data: f } = await supabase.from('finance_plans').select('*').eq('project_id', projectId).single();
          setFinancePlan(f);
          if (f) {
            setSliderMonths(f.term_months);
          }
        }
        const { data: msgs } = await supabase.from('messages').select('*').eq('project_id', projectId).order('timestamp', { ascending: true });
        setMessages(msgs || []);
      } catch (err) {
        console.error('Error loading portal data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !project) return;

    const userMsg = chatInput;
    setChatInput('');

    try {
      // 1. Insert client message
      await supabase.from('messages').insert([{
        project_id: projectId,
        sender_id: 'client',
        receiver_id: 'agent',
        content: userMsg
      }]);

      // 2. Trigger auto response based on status/onboarding wizard
      setTimeout(async () => {
        let reply = '';
        if (project.status === 'AwaitingProcessing') {
          reply = `Operations Concierge here! Under Case ID ${supportCase?.case_number || 'CTH-CASE-GEN'}, our land routing managers are reviewing delivery options to "${project.shipping_address}". We have uploaded your initial Site Prep Blueprints. Please review them!`;
        } else {
          reply = "Sales Concierge here! We've received your query. A design consultant will reach out shortly to finalize architectural schematics.";
        }

        await supabase.from('messages').insert([{
          project_id: projectId,
          sender_id: 'agent',
          receiver_id: 'client',
          content: reply
        }]);
      }, 1500);

    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-sage border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-charcoal font-semibold">Initializing Client Support Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-sage/10 shadow-xl space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-charcoal">Project Portal Restricted</h2>
          <p className="text-xs text-charcoal-light leading-relaxed">
            We couldn't verify an active building pipeline for this identifier. If you just placed a deposit, processing might take up to 2 minutes.
          </p>
        </div>
      </div>
    );
  }

  // Determine stage active indexes
  const stages = ['Lead', 'Qualified', 'Deposit', 'Build', 'AwaitingProcessing'];
  const currentStageIdx = stages.indexOf(project.status || 'Lead');

  // Math calculations for Rent-to-Own simulations
  const houseValuation = listing?.price || 0;
  const shippingCharge = project.shipping_fee || 0;
  const accumulatedEquity = (houseValuation * 0.10) + (houseValuation / sliderMonths) * 3; // Seed 3 months paid
  const equityPct = Math.min((accumulatedEquity / houseValuation) * 100, 100);

  // Amortized financing summary values for slider
  const liveDownPayment = houseValuation * 0.10;
  const liveLoanAmount = houseValuation - liveDownPayment;
  const liveMonthly = liveLoanAmount / sliderMonths;

  // Security Check: Lock documents unless status is AwaitingProcessing
  const documentsLocked = project.status !== 'AwaitingProcessing';

  // Chat concierge avatar details
  const chatConciergeTitle = project.status === 'AwaitingProcessing' ? 'Support Operations' : 'Sales Concierge';

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-offwhite">
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Header Portal Info */}
          <div className="flex flex-wrap items-center justify-between gap-5 bg-white border border-sage/10 rounded-3xl p-6 shadow-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-charcoal-light font-bold">Client Project Portal</p>
              <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold mt-1">
                Your Project: <span className="text-sage-dark">{listing?.title || 'Tiny Home'}</span>
              </h1>
              {supportCase && (
                <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-light">
                  <span className="font-semibold bg-sage/10 text-sage-dark px-2.5 py-0.5 rounded font-mono">
                    {supportCase.case_number}
                  </span>
                  <span>·</span>
                  <span>Ops Team Assigned</span>
                </div>
              )}
            </div>
            
            <div className="bg-sage/5 border border-sage/10 rounded-2xl px-5 py-3 text-right">
              <p className="text-[10px] uppercase text-charcoal-light font-bold">Pipeline Stage</p>
              <p className="font-serif text-base font-bold text-sage-dark mt-0.5">{project.status}</p>
            </div>
          </div>

          {/* PIPELINE / BUILD TIMELINE STAGES */}
          <div className="bg-white border border-sage/10 rounded-3xl p-8 shadow-sm">
            <h3 className="font-serif text-lg text-charcoal font-semibold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sage" /> Onboarding & Construction Milestones
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative">
              {[
                { label: 'Discovery Lead', stage: 'Lead', desc: 'Consultation & design' },
                { label: 'Zoning Qualified', stage: 'Qualified', desc: 'Zoning & land verified' },
                { label: 'Deposit Verified', stage: 'Deposit', desc: 'Reservation hold complete' },
                { label: 'Building Floorplan', stage: 'Build', desc: 'Structural framing active' },
                { label: 'Operations Handoff', stage: 'AwaitingProcessing', desc: 'Delivery routing active' }
              ].map((item, i) => {
                const isPassed = i <= currentStageIdx;
                const isActive = i === currentStageIdx;
                return (
                  <div key={item.stage} className="space-y-3 text-center md:text-left relative z-10">
                    <div className="flex md:flex-row flex-col items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        isPassed 
                          ? 'bg-sage border-sage text-white shadow-md shadow-sage/20' 
                          : 'bg-white border-sage/15 text-charcoal-light'
                      }`}>
                        {isPassed ? <CheckCircle className="w-5 h-5" /> : i + 1}
                      </div>
                      <div className="text-xs font-bold text-charcoal uppercase tracking-wider">{item.label}</div>
                    </div>
                    <p className="text-[10px] text-charcoal-light leading-relaxed pl-1 md:pl-12">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN GRID: PORTAL CONTENT & REAL-TIME CONCIERGE CHAT */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* PORTAL TOOLS: FINANCIALS & CLIENT SUPPORT DOCS */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* RENT TO OWN GAUGE OR ACTIVE FINANCE AMORTIZATION VIEW */}
              <div className="bg-white border border-sage/10 rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="font-serif text-lg text-charcoal font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-sage" /> Customized Payment Engine & Financial roadmap
                </h3>

                {/* Slider and Financing Amortization table */}
                {project.payment_method !== 'rent' && (
                  <div className="space-y-4 p-5 bg-offwhite border border-sage/10 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-bold uppercase text-charcoal-light">
                      <span>Simulated Term Duration</span>
                      <span className="text-sage-dark">{sliderMonths} Months</span>
                    </div>
                    
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={12}
                      value={sliderMonths}
                      onChange={(e) => setSliderMonths(parseInt(e.target.value))}
                      className="w-full accent-sage"
                    />

                    {/* Dynamic Financial Roadmap Summary Table */}
                    <div className="pt-4 space-y-2 border-t border-sage/10 text-xs">
                      <div className="flex justify-between text-charcoal-light">
                        <span>House Valuation</span>
                        <span>${houseValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light">
                        <span>Secured Down Payment (10%)</span>
                        <span>${liveDownPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light">
                        <span>Shipping/Logistics Base</span>
                        <span>${shippingCharge.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-sage/10 my-2" />
                      <div className="flex justify-between font-bold text-sm text-charcoal">
                        <span>Recalculated Monthly Payment</span>
                        <span className="font-serif text-sage-dark">${liveMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</span>
                      </div>
                    </div>
                  </div>
                )}

                {project.payment_method === 'rent' && (
                  <div className="space-y-4 p-5 bg-offwhite border border-sage/10 rounded-2xl">
                    <div className="flex justify-between items-center text-xs font-bold uppercase text-charcoal-light">
                      <span>Lease Agreement</span>
                      <span className="text-sage-dark">{project.lease_duration_months || 12} Months Standard Rent</span>
                    </div>

                    {/* Strict Rent Roadmap Summary Table */}
                    <div className="pt-4 space-y-2 border-t border-sage/10 text-xs">
                      <div className="flex justify-between text-charcoal-light">
                        <span>House Valuation</span>
                        <span>${houseValuation.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light">
                        <span>Monthly Rent (1.2%)</span>
                        <span>${Math.round(houseValuation * 0.012).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light">
                        <span>Upfront Rent Paid (3 months)</span>
                        <span>${Math.round(houseValuation * 0.012 * 3).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-charcoal-light">
                        <span>Shipping/Logistics Base</span>
                        <span>$1,500</span>
                      </div>
                      <div className="h-px bg-sage/10 my-2" />
                      <div className="flex justify-between font-bold text-sm text-charcoal">
                        <span>Regular Monthly Rent</span>
                        <span className="font-serif text-sage-dark">${Math.round(houseValuation * 0.012).toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rent to own visual tracker */}
                {(project.payment_method === 'financing' || project.payment_method === 'rent_to_own') && (
                  <div className="space-y-3.5 pt-2">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-bold text-charcoal uppercase tracking-wider">Rent-to-Own Equity Builder</span>
                      <span className="font-serif text-sage-dark font-bold">{equityPct.toFixed(1)}% Completed</span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-4 bg-sage/10 rounded-full overflow-hidden shadow-inner border border-sage/5">
                      <div 
                        className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full transition-all duration-500 shadow"
                        style={{ width: `${equityPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-charcoal-light">
                      <span>Equity Paid: ${accumulatedEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span>Total House Cost: ${houseValuation.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CLIENT SUPPORT CENTER (RESTRICTED PERMIT AND SITE DOCS) */}
              <div className="bg-white border border-sage/10 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                
                {/* Visual restrictions lock screen overlay */}
                {documentsLocked && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-30 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md bg-white border border-sage/15 shadow-xl rounded-3xl p-7 space-y-4">
                      <ShieldCheck className="w-12 h-12 text-sage mx-auto" />
                      <h4 className="font-serif text-lg font-bold text-charcoal">Support Documents Restricted</h4>
                      <p className="text-xs text-charcoal-light leading-relaxed">
                        These structural zoning permits, electrical specs, and site-prepping guides require a status of **AwaitingProcessing** to download. Please process your down payment.
                      </p>
                    </div>
                  </div>
                )}

                <div className={`space-y-6 ${documentsLocked ? 'select-none pointer-events-none' : ''}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg text-charcoal font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sage" /> Operations & Technical Guidelines
                    </h3>
                    <span className="text-[10px] uppercase bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">
                      Unsecured Documents
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { title: 'Site Prep Manual', type: 'PDF blueprint', size: '4.8 MB' },
                      { title: 'Zoning & Permits Guideline', type: 'Municipal form', size: '2.1 MB' },
                      { title: 'Foundation Engineering', type: 'Zoning structural', size: '8.4 MB' }
                    ].map((doc) => (
                      <div key={doc.title} className="p-5 border border-sage/10 bg-offwhite rounded-2xl flex flex-col justify-between h-44 shadow-sm hover:border-sage/35 transition-colors">
                        <div>
                          <FileText className="w-8 h-8 text-sage mb-3" />
                          <h4 className="font-bold text-charcoal text-xs leading-normal">{doc.title}</h4>
                          <p className="text-[10px] text-charcoal-light mt-0.5">{doc.type} · {doc.size}</p>
                        </div>
                        <button
                          onClick={() => alert(`Initiating download for ${doc.title}...`)}
                          className="mt-3 w-full py-2 bg-white border border-sage/20 text-charcoal hover:border-sage hover:text-sage text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* REAL-TIME messaging box */}
            <div className="lg:col-span-1 h-[600px] flex flex-col bg-white border border-sage/10 rounded-3xl overflow-hidden shadow-sm">
              
              {/* Chat header */}
              <div className="p-5 bg-charcoal text-white shrink-0">
                <p className="text-[9px] uppercase tracking-widest text-sage-light font-bold">Onboarding Concierge</p>
                <h4 className="font-serif font-bold text-base mt-0.5">{chatConciergeTitle}</h4>
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-white/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Agent Elena Rostova Assigned</span>
                </div>
              </div>

              {/* Chat bubbles list */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-offwhite/50">
                {messages.map((m) => {
                  const isUser = m.sender_id === 'client';
                  return (
                    <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-2xl max-w-[85%] text-xs shadow-sm ${
                        isUser 
                          ? 'bg-sage text-white rounded-br-none' 
                          : 'bg-white border border-sage/10 text-charcoal rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed">{m.content}</p>
                        <span className="block text-[8px] text-right mt-1.5 opacity-50 font-mono">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-sage/10 flex gap-2 shrink-0 bg-white">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-sage/15 text-xs outline-none text-charcoal focus:border-sage placeholder:text-charcoal-light/40"
                />
                <button
                  type="submit"
                  className="w-11 h-11 rounded-xl bg-sage hover:bg-sage-dark text-white flex items-center justify-center transition-all shrink-0 shadow shadow-sage/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
