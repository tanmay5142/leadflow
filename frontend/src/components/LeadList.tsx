"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchLeads } from "@/lib/api";
import { isTodayFollowUp } from "@/lib/followup";
import type { Lead, Status } from "@/lib/types";
import FilterBar from "./FilterBar";
import LeadCard from "./LeadCard";
import SearchBox from "./SearchBox";

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [searchText, setSearchText] = useState(""); // what the user typed
  const [search, setSearch] = useState(""); // what we send to the API
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Wait 300ms after the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Load leads whenever the filter, the search, or the retry counter changes
  useEffect(() => {
    let cancelled = false;

    fetchLeads({ status: status ?? undefined, search: search || undefined })
      .then((data) => {
        if (cancelled) return;
        setLeads(data);
        setError(null);
        setLoaded(true);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Something went wrong");
      });

    // If a newer request starts, ignore the result of this older one
    return () => {
      cancelled = true;
    };
  }, [status, search, reloadKey]);

  // Split into "today's follow-ups" and everything else
  const { pinned, others } = useMemo(() => {
    const pinned = leads
      .filter(isTodayFollowUp)
      .sort(
        (a, b) =>
          new Date(a.follow_up_at!).getTime() -
          new Date(b.follow_up_at!).getTime()
      );
    const others = leads.filter((l) => !isTodayFollowUp(l));
    return { pinned, others };
  }, [leads]);

  const retry = () => {
    setError(null);
    setReloadKey((k) => k + 1);
  };

  let content;
  if (error) {
    content = (
      <div className="py-10 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={retry}
          className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  } else if (!loaded) {
    content = (
      <p className="py-10 text-center text-slate-500">Loading leads...</p>
    );
  } else if (leads.length === 0) {
    content = (
      <p className="py-10 text-center text-slate-500">
        {status || search ? "No leads match your filters." : "No leads yet."}
      </p>
    );
  } else {
    content = (
      <>
        {pinned.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              📌 Today&apos;s Follow-ups
            </h2>
            <div className="space-y-3">
              {pinned.map((lead) => (
                <LeadCard key={lead.id} lead={lead} pinned />
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              All Leads
            </h2>
            <div className="space-y-3">
              {others.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <FilterBar value={status} onChange={setStatus} />
        <SearchBox value={searchText} onChange={setSearchText} />
      </div>
      {content}
    </div>
  );
}