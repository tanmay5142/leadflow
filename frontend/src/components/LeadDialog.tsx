"use client";

import { useEffect, useState } from "react";
import { fetchLead, updateLeadStatus } from "@/lib/api";
import { STATUSES, type LeadDetail, type Status } from "@/lib/types";
import Modal from "./Modal";
import NoteForm from "./NoteForm";
import Timeline from "./Timeline";

interface Props {
  leadId: number;
  onClose: () => void;
  onChanged: (lead: LeadDetail) => void; // tells the list something changed
}

export default function LeadDialog({ leadId, onClose, onChanged }: Props) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Load the lead and its discussions when the dialog opens
  useEffect(() => {
    let cancelled = false;
    fetchLead(leadId)
      .then((data) => {
        if (!cancelled) setLead(data);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Something went wrong");
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  function handleSaved(updated: LeadDetail) {
    setLead(updated); // update the dialog
    onChanged(updated); // update the list behind it
  }

  async function handleStatusChange(next: Status) {
    if (!lead) return;
    setSavingStatus(true);
    setStatusError(null);
    try {
      handleSaved(await updateLeadStatus(lead.id, next));
    } catch (e) {
      setStatusError(e instanceof Error ? e.message : "Could not update status");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <Modal label={lead ? `${lead.name} discussions` : "Lead details"} onClose={onClose}>
      <div className="flex max-h-[85vh] flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">
              {lead ? lead.name : "Loading..."}
              {lead?.company && (
                <span className="ml-2 text-base font-normal text-slate-500">
                  ({lead.company})
                </span>
              )}
            </h2>
            {lead?.phone && (
              <p className="mt-1 text-sm text-slate-500">📞 {lead.phone}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {lead && (
              <select
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value as Status)}
                disabled={savingStatus}
                aria-label="Lead status"
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              ×
            </button>
          </div>
        </div>
        {statusError && (
          <p role="alert" className="px-6 pt-2 text-sm text-red-600">
            {statusError}
          </p>
        )}

        {/* Timeline (scrolls if it is long) */}
        <div className="flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
          {error ? (
            <p className="py-6 text-center text-red-600">{error}</p>
          ) : !lead ? (
            <p className="py-6 text-center text-slate-500">Loading history...</p>
          ) : (
            <Timeline discussions={lead.discussions} />
          )}
        </div>

        {/* Add a note */}
        {lead && (
          <div className="border-t border-slate-200 px-6 py-4">
            <NoteForm leadId={lead.id} onSaved={handleSaved} />
          </div>
        )}
      </div>
    </Modal>
  );
}