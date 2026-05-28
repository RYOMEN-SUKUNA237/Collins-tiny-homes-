"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Users,
  Eye,
  Settings,
  MapPin,
  Database,
  CreditCard,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const links = [
    { label: "Dashboard", href: "/admin", icon: TrendingUp, exact: true },
    {
      label: "Pipeline CRM",
      href: "/admin/pipeline",
      icon: Briefcase,
      exact: false,
    },
    { label: "Listings", href: "/admin/listings", icon: Home, exact: false },
    { label: "Lands", href: "/admin/lands", icon: MapPin, exact: false },
    { label: "Inquiries", href: "/admin/inquiries", icon: Users, exact: false },
    {
      label: "Support Inbox",
      href: "/admin/support",
      icon: MessageCircle,
      exact: false,
    },
    {
      label: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
      exact: false,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
      exact: false,
    },
  ];

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setSeedMsg(
        data.status === "already_seeded" ? "Already seeded!" : "Seeded! ✓",
      );
    } catch {
      setSeedMsg("Seed failed");
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(""), 3000);
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-charcoal text-white flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-sage flex items-center justify-center shadow-lg shadow-sage/30">
            <Home className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="font-serif text-sm text-white font-semibold">
              Collins
            </p>
            <p className="text-[10px] text-sage-light uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sage/20 text-white border border-sage/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Seed DB button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 text-sm transition-colors disabled:opacity-50"
        >
          <Database className="w-4 h-4 shrink-0" />
          {seeding ? "Seeding…" : seedMsg || "Seed Sample Data"}
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/40 hover:text-white text-sm transition-colors"
        >
          <Eye className="w-4 h-4" />
          View Site
        </Link>
      </div>
    </aside>
  );
}
