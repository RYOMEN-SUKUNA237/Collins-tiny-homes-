import { notFound } from "next/navigation";
import { getListingById } from "@/lib/db";
import ListingForm from "@/components/admin/ListingForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  return (
    <div className="p-8 pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-charcoal font-semibold">
          Edit Listing
        </h1>
        <p className="text-charcoal-light mt-1 text-sm">ID: {id}</p>
      </div>
      <ListingForm mode="edit" listing={listing} />
    </div>
  );
}
