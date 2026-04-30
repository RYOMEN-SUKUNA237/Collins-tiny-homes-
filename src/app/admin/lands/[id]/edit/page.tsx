import { notFound } from 'next/navigation';
import { getLandById } from '@/lib/db';
import LandForm from '@/components/admin/LandForm';

export const dynamic = 'force-dynamic';

export default async function EditLandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const land = await getLandById(id) as any;
  if (!land) notFound();

  return (
    <div className="p-8 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-charcoal font-semibold">Edit Land Parcel</h1>
        <p className="text-charcoal-light mt-1 text-sm">ID: {id}</p>
      </div>
      <LandForm mode="edit" land={land} />
    </div>
  );
}
