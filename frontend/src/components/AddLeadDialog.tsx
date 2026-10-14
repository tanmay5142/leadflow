"use client";

import { useState, type FormEvent } from "react";
import { addLead } from "@/lib/api";
import type { Lead } from "@/lib/types";
import Modal from "./Modal";

interface Props {
  onClose: () => void;
  onAdded: (lead: Lead) => void;
}

export default function AddLeadDialog({ onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    // Only allow digits, spaces and + - ( ) in the phone number
    if (phone.trim() && !/^[0-9+\-()\s]{3,30}$/.test(phone.trim())) {
      setError("Phone can only have numbers, spaces and + - ( ).");
      return;
    }

    setSaving(true);
    try {
      const lead = await addLead({
        name: name.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
      });
      onAdded(lead);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  const inputStyle =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  return (
    <Modal label="Add new lead" onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">Add New Lead</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label htmlFor="lead-name" className="mb-1 block text-sm font-medium">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              id="lead-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="e.g., John Doe"
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="lead-company" className="mb-1 block text-sm font-medium">
              Company <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="lead-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              maxLength={120}
              placeholder="e.g., Stark Industries"
              className={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium">
              Phone <span className="font-normal text-slate-400">(Optional)</span>
            </label>
            <input
              id="lead-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={30}
              placeholder="e.g., 555-0123"
              className={inputStyle}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Lead"}
          </button>
        </div>
      </form>
    </Modal>
  );
}