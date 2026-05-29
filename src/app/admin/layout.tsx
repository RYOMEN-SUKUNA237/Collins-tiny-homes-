"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-offwhite flex flex-col overflow-x-hidden">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between bg-charcoal text-white px-4 py-3 shrink-0 sticky top-0 z-40 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sage flex items-center justify-center">
            <span className="text-white font-serif text-sm font-bold">C</span>
          </div>
          <span className="font-serif text-sm font-semibold">Collins Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5 text-white/80" />
        </button>
      </div>

      <div className="flex-1 flex relative">
        {/* Sidebar wrapper with state */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content area with responsive margin */}
        <div className="flex-1 lg:ml-64 relative min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

