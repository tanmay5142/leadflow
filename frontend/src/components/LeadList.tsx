"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchLeads } from "@/lib/api";
import type { Lead } from "@/lib/types";
import LeadCard from "./LeadCard";

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await fetchLeads());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="py-10 text-center text-slate-500">Loading leads...</p>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={load}
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (leads.length === 0) {
    return <p className="py-10 text-center text-slate-500">No leads yet.</p>;
  }

  return (
    <section>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
        All Leads
      </h2>
      <div className="space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </section>
  );
}