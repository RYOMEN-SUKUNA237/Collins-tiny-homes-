"use client";

import { useState, useEffect } from "react";
import { supabaseClient as supabase } from "@/lib/supabase-client";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

type PipelineProject = {
  id: string;
  listing_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: string | null;
  payment_method?: string | null;
  status?: string | null;
  created_at: string;
};

type ListingTitleRow = {
  id: string;
  title: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected Supabase error";
}

export default function AdminPipelinePage() {
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [listings, setListings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const COLUMNS = [
    "Lead",
    "Qualified",
    "Deposit",
    "Build",
    "AwaitingProcessing",
  ];

  async function loadData() {
    try {
      const { data: projs, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(projs || []);

      // Load listing titles map
      const { data: lists } = await supabase
        .from("listings")
        .select("id, title");
      const map: Record<string, string> = {};
      lists?.forEach((l: ListingTitleRow) => {
        map[l.id] = l.title;
      });
      setListings(map);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const moveProject = async (
    id: string,
    currentStatus: string,
    direction: "next" | "prev",
  ) => {
    const currentIdx = COLUMNS.indexOf(currentStatus);
    let nextIdx = currentIdx;

    if (direction === "next" && currentIdx < COLUMNS.length - 1) {
      nextIdx = currentIdx + 1;
    } else if (direction === "prev" && currentIdx > 0) {
      nextIdx = currentIdx - 1;
    }

    if (nextIdx === currentIdx) return;

    const nextStatus = COLUMNS[nextIdx];

    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
    );

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) throw error;
    } catch (err: unknown) {
      console.error("Failed to move pipeline card:", err);
      setErrorMsg("Failed to update status in Supabase.");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-4 border-sage border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-charcoal font-semibold">
            Loading CRM Pipeline...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-offwhite">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
            Project Kanban CRM
          </h1>
          <p className="text-charcoal-light text-xs mt-1">
            Track and manage client tiny home purchases, land status, down
            payments, and build progress.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-sage/20 text-charcoal hover:border-sage text-xs font-semibold rounded-xl transition-all"
        >
          Refresh Data
        </button>
      </header>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Columns Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start overflow-x-auto pb-4">
        {COLUMNS.map((colName) => {
          const colProjects = projects.filter(
            (p) => (p.status || "Lead") === colName,
          );
          return (
            <div
              key={colName}
              className="bg-sage/5 border border-sage/10 rounded-2xl p-4 min-w-[240px] flex flex-col space-y-4 shrink-0 shadow-sm min-h-[60vh]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-sage/10">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  {colName}
                </span>
                <span className="text-[10px] font-bold bg-sage/20 text-sage-dark px-2 py-0.5 rounded-full font-mono">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {colProjects.length === 0 ? (
                  <div className="text-center py-10 text-[10px] text-charcoal-light italic">
                    No active cards
                  </div>
                ) : (
                  colProjects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-sage/10 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow space-y-3 relative group"
                    >
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-sage font-bold">
                          {(p.listing_id && listings[p.listing_id]) || "Tiny Home Unit"}
                        </p>
                        <h4 className="font-serif font-bold text-xs text-charcoal mt-0.5 leading-snug">
                          {p.customer_name}
                        </h4>
                      </div>

                      <div className="space-y-1.5 text-[10px] text-charcoal-light border-t border-sage/5 pt-2.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sage" />
                          <span className="truncate max-w-[150px]">
                            {p.customer_email}
                          </span>
                        </div>
                        {p.customer_phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-sage" />
                            <span>{p.customer_phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sage" />
                          <span className="truncate max-w-[150px]">
                            {p.shipping_address || "Nationwide Shipping"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-sage" />
                          <span className="capitalize">
                            {p.payment_method || "financing"}
                          </span>
                        </div>
                      </div>

                      {/* Direction Swapping Buttons */}
                      <div className="flex items-center justify-between border-t border-sage/5 pt-2 mt-1">
                        <button
                          disabled={colName === "Lead"}
                          onClick={() => moveProject(p.id, p.status || "Lead", "prev")}
                          className="p-1 rounded bg-sage/5 hover:bg-sage/15 text-sage-dark disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move Left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <span className="text-[8px] text-charcoal-light font-mono">
                          {new Date(p.created_at).toLocaleDateString([], {
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </span>

                        <button
                          disabled={colName === "AwaitingProcessing"}
                          onClick={() => moveProject(p.id, p.status || "Lead", "next")}
                          className="p-1 rounded bg-sage/5 hover:bg-sage/15 text-sage-dark disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move Right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
