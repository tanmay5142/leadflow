"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  label: string;
  onClose: () => void;
  maxWidth?: string;
  children: ReactNode;
}

export default function Modal({
  label,
  onClose,
  maxWidth = "max-w-2xl",
  children,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    // Stop the page behind from scrolling
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose} // runs when the user presses Escape
      onClick={(e) => {
        // A click on the dark area (not inside the white box) closes it
        if (e.target === e.currentTarget) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${maxWidth} overflow-hidden rounded-xl bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/50`}
    >
      {children}
    </dialog>
  );
}