import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllLands } from '@/lib/db';
import { Plus, Edit2, Eye, MapPin } from 'lucide-react';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata: Metadata = { title: 'Manage Lands | Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminLandsPage() {
  const lands = await getAllLands() as any[];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">Land Parcels</h1>
          <p className="text-charcoal-light text-xs mt-0.5">{lands.length} parcel{lands.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link
          href="/admin/lands/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-lg shadow-sage/25 hover:bg-sage-dark transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Parcel
        </Link>
      </header>

      <div className="p-8">
        <div className="bg-white rounded-2xl border border-sage/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-sage/10 bg-offwhite/50">
                  <th className="px-7 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Parcel / Location</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Type & Price</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Details</th>
                  <th className="px-4 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Status</th>
                  <th className="px-7 py-4 text-xs font-semibold text-charcoal-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/5">
                {lands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-7 py-12 text-center">
                      <p className="text-charcoal-light text-sm mb-3">No land parcels yet.</p>
                      <Link href="/admin/lands/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage text-white text-sm font-semibold">
                        <Plus className="w-4 h-4" /> Add first parcel
                      </Link>
                    </td>
                  </tr>
                ) : lands.map((land) => (
                  <tr key={land.id} className="hover:bg-sage/3 transition-colors">
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          {land.cover_image ? (
                            <img src={land.cover_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-charcoal-light" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal text-sm">{land.title}</p>
                          <p className="text-xs text-charcoal-light mt-0.5">{land.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide mb-1 ${land.price_type === 'rent' ? 'bg-clay/15 text-clay-dark' : 'bg-sage/15 text-sage-dark'}`}>
                        {land.price_type}
                      </span>
                      <p className="font-semibold text-charcoal text-sm">${land.price.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-charcoal-light">
                      {land.acreage} acres<br />
                      <span className="capitalize">{land.terrain_type}</span> · {land.zoning}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        land.status === 'available' ? 'bg-green-100 text-green-700' :
                        land.status === 'sold' ? 'bg-red-100 text-red-700' :
                        land.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {land.status}
                      </span>
                    </td>
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/lands/${land.id}/edit`} className="p-2 rounded-lg text-charcoal-light hover:text-clay hover:bg-clay/10 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <DeleteButton id={land.id} entityType="lands" />
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
