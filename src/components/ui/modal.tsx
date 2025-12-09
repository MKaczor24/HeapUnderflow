"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4 backdrop-blur-xl">
      <div
        ref={modalRef}
        className={cn(
          "animate-in fade-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl duration-200",
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
        >
          <IconX size={20} />
          <span className="sr-only">Close</span>
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
