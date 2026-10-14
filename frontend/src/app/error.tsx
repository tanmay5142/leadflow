"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-slate-600">
        The page hit an unexpected problem. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </div>
  );
}