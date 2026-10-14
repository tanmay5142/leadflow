export default function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold text-blue-600">LeadFlow</h1>
        <button
          onClick={onAdd}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          + Add New Lead
        </button>
      </div>
    </header>
  );
}