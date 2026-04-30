import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite">
      <AdminSidebar />
      <div className="ml-64 relative">
        {children}
      </div>
    </div>
  );
}
