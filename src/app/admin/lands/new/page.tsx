import LandForm from '@/components/admin/LandForm';

export default function NewLandPage() {
  return (
    <div className="p-8 pb-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal font-semibold">New Land Parcel</h1>
        <p className="text-charcoal-light mt-1">Add a new land parcel to the marketplace.</p>
      </div>
      <LandForm mode="create" />
    </div>
  );
}
