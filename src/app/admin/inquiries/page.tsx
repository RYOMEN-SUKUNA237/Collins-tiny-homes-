import type { Metadata } from "next";
import { getAllInquiries } from "@/lib/db";
import InquiriesTable from "@/components/admin/InquiriesTable";

export const metadata: Metadata = { title: "Inquiries | Admin" };
export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await getAllInquiries();

  const unread = inquiries.filter((i) => i.status === "new").length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-sage/10 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">
            Inquiries
          </h1>
          <p className="text-charcoal-light text-xs mt-0.5">
            {inquiries.length} total
            {unread > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                {unread} new
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="p-8">
        <InquiriesTable initialInquiries={inquiries} />
      </div>
    </>
  );
}
