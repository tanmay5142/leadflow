import type { Status } from "@/lib/types";

const COLORS: Record<Status, string> = {
  New: "bg-green-100 text-green-800",
  Contacted: "bg-yellow-100 text-yellow-800",
  Qualified: "bg-blue-100 text-blue-800",
  "Proposal Sent": "bg-purple-100 text-purple-800",
  Won: "bg-gray-100 text-gray-600",
  Lost: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${COLORS[status]}`}
    >
      {status}
    </span>
  );
}