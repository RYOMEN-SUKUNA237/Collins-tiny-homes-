import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllListings } from '@/lib/db';
import { Plus, Edit2, Eye } from 'lucide-react';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata: Metadata = { title: 'Manage Listings | Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminListingsPage() {
  const listings = await getAllListings() as any[];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">Listings</h1>
          <p className="text-charcoal-light text-xs mt-0.5">{listings.length} total listing{listings.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </Link>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-sage/10 bg-offwhite/50">
                  <th className="px-7 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Title / Location</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Type & Price</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Specs</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Featured</th>
                  <th className="px-7 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/5">
                {listings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-12 text-center">
                      <p className="text-charcoal-light text-sm mb-3">No listings yet.</p>
                      <Link href="/admin/listings/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage text-white text-sm font-semibold">
                        <Plus className="w-4 h-4" /> Create first listing
                      </Link>
                    </td>
                  </tr>
                ) : listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-sage/3 transition-colors">
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {listing.cover_image && (
                            <img src={listing.cover_image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal text-sm">{listing.title}</p>
                          <p className="text-xs text-charcoal-light mt-0.5">{listing.location} · {listing.home_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${
                        listing.price_type === 'rent' ? 'bg-clay/15 text-clay-dark' :
                        listing.price_type === 'both' ? 'bg-gradient-to-r from-sage/20 to-clay/20 text-charcoal' :
                        'bg-sage/15 text-sage-dark'
                      }`}>
                        {listing.price_type === 'both' ? 'sale & rent' : listing.price_type}
                      </span>
                      <p className="font-semibold text-charcoal text-sm">
                        ${listing.price.toLocaleString()}
                        {listing.price_type === 'both' && listing.monthly_rent && (
                          <span className="text-xs text-charcoal-light font-normal block">
                            ${listing.monthly_rent}/mo
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-charcoal-light">
                      {listing.sqft} sqft<br />
                      {listing.bedrooms} bed · {listing.bathrooms} bath
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        listing.status === 'active' ? 'bg-green-100 text-green-700' :
                        listing.status === 'sold' ? 'bg-red-100 text-red-700' :
                        listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {listing.is_featured ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-clay/15 text-clay-dark">Featured</span>
                      ) : (
                        <span className="text-xs text-charcoal-light">—</span>
                      )}
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/listings/${listing.id}`} target="_blank" className="p-2 rounded-lg text-charcoal-light hover:text-sage hover:bg-sage/10 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/admin/listings/${listing.id}/edit`} className="p-2 rounded-lg text-charcoal-light hover:text-clay hover:bg-clay/10 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={listing.id} entityType="listings" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
