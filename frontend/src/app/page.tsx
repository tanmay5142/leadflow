import LeadList from "@/components/LeadList";

export default function Home() {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">LeadFlow</h1>
          {}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <LeadList />
      </main>
    </>
  );
}