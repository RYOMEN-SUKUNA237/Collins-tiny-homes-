'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Mail, Phone, Trash2, MessageSquare, DollarSign, Eye, CheckCircle2 } from 'lucide-react';

const STATUS_OPTIONS = ['new', 'read', 'replied', 'approved', 'rejected'] as const;
type InqStatus = typeof STATUS_OPTIONS[number];

const TYPE_OPTIONS = ['all', 'buy', 'rent', 'info', 'land', 'finance'] as const;

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  inquiry_type: string;
  inquiryType?: string;
  status: InqStatus;
  created_at: string;
  listing_title?: string;
  listingTitle?: string;
  land_title?: string;
  landTitle?: string;
  finance_plan?: string;
  finance_down_payment?: number;
  finance_monthly_total?: number;
  finance_term_months?: number;
}

interface InquiriesTableProps {
  initialInquiries: Inquiry[];
}

function statusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-700';
    case 'read': return 'bg-gray-100 text-gray-600';
    case 'replied': return 'bg-green-100 text-green-700';
    case 'approved': return 'bg-sage/15 text-sage-dark';
    case 'rejected': return 'bg-red-100 text-red-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function typeColor(type: string) {
  switch (type) {
    case 'finance': return 'bg-clay/15 text-clay-dark';
    case 'buy': return 'bg-sage/15 text-sage-dark';
    case 'rent': return 'bg-blue-100 text-blue-700';
    case 'land': return 'bg-amber-100 text-amber-700';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export default function InquiriesTable({ initialInquiries }: InquiriesTableProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = inquiries.filter(inq => {
    const type = inq.inquiry_type ?? inq.inquiryType ?? '';
    const typeOk = filterType === 'all' || type === filterType;
    const statusOk = filterStatus === 'all' || inq.status === filterStatus;
    return typeOk && statusOk;
  });

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: status as InqStatus } : i));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry? This cannot be undone.')) return;
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setInquiries(prev => prev.filter(i => i.id !== id));
    }
  };

  const selectClass = 'text-xs font-semibold rounded-lg px-2 py-1 border border-sage/20 bg-white text-charcoal outline-none focus:border-sage transition-colors';

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Type:</span>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectClass}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Status:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="text-xs text-charcoal-light ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-sage/10 bg-offwhite/50">
                <th className="px-6 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Contact</th>
                <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Subject</th>
                <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Date</th>
                <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-charcoal-light">No inquiries match the current filters.</td></tr>
              ) : filtered.map(inq => {
                const type = inq.inquiry_type ?? inq.inquiryType ?? '';
                const subject = inq.listing_title ?? inq.listingTitle ?? inq.land_title ?? inq.landTitle ?? 'General Inquiry';
                const isExpanded = expandedId === inq.id;

                return (
                  <>
                    <tr key={inq.id} className="hover:bg-sage/3 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sage/15 flex items-center justify-center text-sage font-bold text-sm shrink-0">
                            {inq.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{inq.name}</p>
                            <p className="text-xs text-charcoal-light flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" />{inq.email}
                            </p>
                            {inq.phone && (
                              <p className="text-xs text-charcoal-light flex items-center gap-1">
                                <Phone className="w-3 h-3" />{inq.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-charcoal font-medium truncate max-w-[180px]">{subject}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${typeColor(type)}`}>{type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={inq.status}
                          onChange={e => handleStatusChange(inq.id, e.target.value)}
                          disabled={updatingId === inq.id}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border outline-none cursor-pointer transition-all ${statusColor(inq.status)} border-transparent hover:border-sage/20`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {updatingId === inq.id && <div className="w-3 h-3 border border-sage border-t-transparent rounded-full animate-spin inline-block ml-1" />}
                      </td>
                      <td className="px-4 py-4 text-xs text-charcoal-light whitespace-nowrap">
                        {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                            className="p-2 rounded-lg text-charcoal-light hover:text-sage hover:bg-sage/10 transition-colors"
                            title="View message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inq.id)}
                            className="p-2 rounded-lg text-charcoal-light hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${inq.id}-expanded`} className="bg-offwhite/60">
                        <td colSpan={6} className="px-6 py-5">
                          <div className="space-y-3 max-w-2xl">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                              <p className="text-sm text-charcoal leading-relaxed">{inq.message}</p>
                            </div>
                            {inq.finance_plan && (
                              <div className="bg-clay/5 border border-clay/15 rounded-xl p-4 space-y-1.5">
                                <p className="text-xs font-semibold text-clay-dark uppercase tracking-wider flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5" /> Finance Request
                                </p>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-xs text-charcoal-light">Plan</p>
                                    <p className="font-medium text-charcoal capitalize">{inq.finance_plan?.replace('_', ' ')}</p>
                                  </div>
                                  {inq.finance_down_payment && (
                                    <div>
                                      <p className="text-xs text-charcoal-light">Down Payment</p>
                                      <p className="font-medium text-charcoal">${inq.finance_down_payment.toLocaleString()}</p>
                                    </div>
                                  )}
                                  {inq.finance_monthly_total && (
                                    <div>
                                      <p className="text-xs text-charcoal-light">Monthly Total</p>
                                      <p className="font-medium text-charcoal">${inq.finance_monthly_total.toLocaleString()}/mo</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2 pt-1">
                              <a
                                href={`mailto:${inq.email}?subject=Re: ${subject}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage text-white text-xs font-semibold hover:bg-sage-dark transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5" /> Reply via Email
                              </a>
                              <button
                                onClick={() => { handleStatusChange(inq.id, 'replied'); setExpandedId(null); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sage/20 text-sage text-xs font-semibold hover:bg-sage/5 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Replied
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
