import type { KeyboardEvent } from "react";
import type { Lead } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import { formatFollowUp, isClosed, isOverdue } from "@/lib/followup";
import StatusBadge from "./StatusBadge";

export default function LeadCard({
  lead,
  onOpen,
  pinned = false,
}: {
  lead: Lead;
  onOpen: () => void;
  pinned?: boolean;
}) {
  const closed = isClosed(lead);
  const overdue = isOverdue(lead);

  let style = "border-slate-200 bg-white";
  if (overdue) style = "border-red-300 bg-red-50";
  else if (pinned) style = "border-blue-200 bg-blue-50";

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKey}
      className={`cursor-pointer rounded-lg border px-5 py-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${style} ${
        closed ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">
          {lead.name}
          {lead.company && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({lead.company})
            </span>
          )}
        </h3>
        <StatusBadge status={lead.status} />
      </div>

      {lead.last_note && (
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">Last Note:</span> {lead.last_note}
          <span className="ml-2 text-xs text-slate-400">
            {timeAgo(lead.last_note_at)}
          </span>
        </p>
      )}

      {lead.follow_up_at && !closed && (
        <span
          className={`mt-3 inline-block rounded px-2 py-1 text-xs font-semibold ${
            overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {overdue ? "⚠️" : "🔔"} {formatFollowUp(lead.follow_up_at, overdue)}
        </span>
      )}
    </div>
  );
}