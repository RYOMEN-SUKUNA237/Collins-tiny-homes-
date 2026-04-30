import ListingForm from '@/components/admin/ListingForm';

export const metadata = { title: 'New Listing | Admin' };

export default function NewListingPage() {
  return (
    <div className="p-8 pb-24">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-charcoal font-semibold">New Listing</h1>
        <p className="text-charcoal-light mt-1">Create a new tiny home listing.</p>
      </div>
      <ListingForm mode="create" />
    </div>
  );
}
