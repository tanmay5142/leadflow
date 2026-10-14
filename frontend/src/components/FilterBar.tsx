import { STATUSES, type Status } from "@/lib/types";

interface Props {
  value: Status | null;
  onChange: (status: Status | null) => void;
}

export default function FilterBar({ value, onChange }: Props) {
  const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? "border-slate-900 bg-slate-900 text-white"
        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-bold uppercase tracking-widest text-slate-500">
        Filters:
      </span>
      <button className={pill(value === null)} onClick={() => onChange(null)}>
        All
      </button>
      {STATUSES.map((s) => (
        <button key={s} className={pill(value === s)} onClick={() => onChange(s)}>
          {s}
        </button>
      ))}
    </div>
  );
}