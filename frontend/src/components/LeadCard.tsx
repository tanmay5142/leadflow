import type { Lead } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import StatusBadge from "./StatusBadge";

export default function LeadCard({ lead }: { lead: Lead }) {
  // Closed leads (Won / Lost) are shown faded
  const closed = lead.status === "Won" || lead.status === "Lost";

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm ${
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
    </div>
  );
}