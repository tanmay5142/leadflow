import type { Discussion } from "@/lib/types";
import { formatDateTime, timeAgo } from "@/lib/time";

export default function Timeline({ discussions }: { discussions: Discussion[] }) {
  if (discussions.length === 0) {
    return <p className="py-6 text-center text-slate-500">No discussions yet.</p>;
  }

  return (
    <ol className="relative ml-2 space-y-5 border-l-2 border-slate-200 pl-6">
      {discussions.map((d, index) => (
        <li key={d.id} className="relative">
          {/* The dot on the line. The newest one is blue. */}
          <span
            className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ${
              index === 0 ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
          <p className="text-xs text-slate-500">
            {formatDateTime(d.created_at)}{" "}
            <span className="text-slate-400">({timeAgo(d.created_at)})</span>
          </p>
          <div className="mt-1 rounded-md border border-slate-200 bg-white px-4 py-3">
            <p
              className={`whitespace-pre-wrap break-words text-sm ${
                d.note.startsWith("Lead created") ? "italic" : ""
              }`}
            >
              {d.note}
            </p>
            {d.follow_up_at && (
              <span className="mt-2 inline-block rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                📅 Follow-up set for: {formatDateTime(d.follow_up_at)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}