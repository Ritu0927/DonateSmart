"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const ElevenLabsAssistantRuntime = dynamic(
  () => import("@/components/voice/elevenlabs-assistant-runtime").then((module) => module.ElevenLabsAssistantRuntime),
  { ssr: false, loading: () => null }
);

export function ElevenLabsAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const shouldLoadRuntime = useMemo(() => isOpen, [isOpen]);

  if (pathname === "/donate") {
    return null;
  }

  return (
    <>
      {shouldLoadRuntime ? (
        <ElevenLabsAssistantRuntime isOpen={isOpen} onToggle={() => setIsOpen((current) => !current)} />
      ) : null}

      {!isOpen ? (
        <div className="fixed bottom-5 right-5 z-30 flex max-w-sm flex-col items-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">AI</span>
            Talk to DonateSmart
          </button>
        </div>
      ) : null}
    </>
  );
}
