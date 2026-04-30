import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, TrendingUp, Users, DollarSign, Edit2, Trash2, Eye, MapPin } from 'lucide-react';
import { getDashboardStats } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Collins Tiny Homes admin control center.',
};

// Force dynamic so stats are fresh
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const statsData = await getDashboardStats();

  const stats = [
    { label: 'Total Listings', value: statsData.totalListings, icon: Home, color: 'bg-sage/10 text-sage-dark', detail: `${statsData.activeListings} active` },
    { label: 'Land Parcels', value: statsData.totalLands, icon: MapPin, color: 'bg-clay/10 text-clay-dark', detail: 'Total available' },
    { label: 'New Inquiries', value: statsData.newInquiries, icon: Users, color: 'bg-sage/10 text-sage-dark', detail: `Out of ${statsData.totalInquiries} total` },
    { label: 'Finance Apps', value: statsData.financeApps, icon: DollarSign, color: 'bg-clay/10 text-clay-dark', detail: 'To be reviewed' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">Overview</h1>
          <p className="text-charcoal-light text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/lands/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-sage/20 text-charcoal text-sm font-semibold hover:border-sage hover:text-sage transition-all duration-200"
          >
            New Land
          </Link>
          <Link
            href="/admin/listings/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200 hover:-translate-y-0.5"
          >
            New Listing
          </Link>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-sage/10 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-serif font-bold text-charcoal mb-1">{stat.value}</p>
                <p className="text-charcoal-light text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-xs text-sage font-medium">{stat.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-sage/10 shadow-sm p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-charcoal font-semibold">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sage text-sm font-semibold hover:text-sage-dark transition-colors">
              View all →
            </Link>
          </div>
          
          {statsData.recentInquiries.length === 0 ? (
            <div className="text-center py-8 text-charcoal-light text-sm">No recent inquiries found.</div>
          ) : (
            <div className="space-y-3">
              {statsData.recentInquiries.map((inq: any) => (
                <div key={inq.id} className="flex items-center justify-between px-5 py-4 rounded-xl bg-offwhite/60 border border-sage/5 hover:border-sage/15 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-sage/15 flex items-center justify-center text-sage font-bold text-sm">
                      {inq.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{inq.name}</p>
                      <p className="text-xs text-charcoal-light">{inq.listing_title || inq.land_title || 'General Subject'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                      inq.inquiry_type === 'finance' ? 'bg-clay/15 text-clay-dark' : 'bg-sage/15 text-sage-dark'
                    }`}>{inq.inquiry_type}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      inq.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      inq.status === 'replied' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{inq.status}</span>
                    <span className="text-xs text-charcoal-light">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
