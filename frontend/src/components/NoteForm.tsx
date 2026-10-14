"use client";

import { useState, type FormEvent } from "react";
import { addDiscussion } from "@/lib/api";
import type { LeadDetail } from "@/lib/types";

interface Props {
  leadId: number;
  onSaved: (lead: LeadDetail) => void;
}

// Today's date as yyyy-mm-dd in the user's own time zone
function todayLocal() {
  return new Date().toLocaleDateString("en-CA");
}

export default function NoteForm({ leadId, onSaved }: Props) {
  const [note, setNote] = useState("");
  const [withFollowUp, setWithFollowUp] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!note.trim()) {
      setError("Please write a note first.");
      return;
    }

    let followUpAt: string | null = null;
    if (withFollowUp) {
      if (!date || !time) {
        setError("Pick both a date and a time for the follow-up.");
        return;
      }
      const when = new Date(`${date}T${time}`); // read in the user's time zone
      if (Number.isNaN(when.getTime())) {
        setError("That follow-up date is not valid.");
        return;
      }
      if (when.getTime() < Date.now()) {
        setError("Follow-up must be in the future.");
        return;
      }
      followUpAt = when.toISOString(); // sent as UTC
    }

    setSaving(true);
    try {
      const updated = await addDiscussion(leadId, {
        note: note.trim(),
        follow_up_at: followUpAt,
      });
      onSaved(updated);
      // Clear the form
      setNote("");
      setWithFollowUp(false);
      setDate("");
      setTime("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle =
    "rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Log a new discussion..."
        aria-label="New discussion note"
        className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={withFollowUp}
            onChange={(e) => setWithFollowUp(e.target.checked)}
          />
          Set Follow-up
        </label>
        <input
          type="date"
          value={date}
          min={todayLocal()}
          onChange={(e) => setDate(e.target.value)}
          disabled={!withFollowUp}
          aria-label="Follow-up date"
          className={inputStyle}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          disabled={!withFollowUp}
          aria-label="Follow-up time"
          className={inputStyle}
        />
        <button
          type="submit"
          disabled={saving}
          className="ml-auto rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}