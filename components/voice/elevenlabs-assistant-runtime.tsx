"use client";

import { useState } from "react";
import { ConversationProvider, useConversation, useConversationStatus } from "@elevenlabs/react";
import { cn } from "@/lib/utils";

export function ElevenLabsAssistantRuntime({
  isOpen,
  onToggle
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <ConversationProvider
      onError={(error) => {
        console.error("ElevenLabs conversation error:", error);
      }}
    >
      <AssistantPanel isOpen={isOpen} onToggle={onToggle} />
    </ConversationProvider>
  );
}

function AssistantPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const { status, message } = useConversationStatus();
  const conversation = useConversation({
    micMuted: isMuted
  });

  async function handleStart() {
    setIsBusy(true);
    setLocalError("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const response = await fetch("/api/elevenlabs/signed-url", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { signedUrl?: string; error?: string };

      if (!response.ok || !payload.signedUrl) {
        throw new Error(payload.error || "Unable to start the voice assistant.");
      }

      conversation.startSession({
        signedUrl: payload.signedUrl
      });
    } catch (error) {
      console.error("Unable to start ElevenLabs session:", error);
      setLocalError(error instanceof Error ? error.message : "Unable to start the voice assistant.");
    } finally {
      setIsBusy(false);
    }
  }

  function handleStop() {
    conversation.endSession();
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex max-w-sm flex-col items-end gap-3">
      {isOpen ? (
        <div className="w-[min(92vw,24rem)] rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-card backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sage-700">Voice Assistant</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Talk to DonateSmart</h2>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="mt-4 rounded-[1.25rem] bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  status === "connected"
                    ? "bg-emerald-500"
                    : status === "connecting"
                      ? "bg-amber-400"
                      : status === "error"
                        ? "bg-rose-500"
                        : "bg-slate-300"
                )}
              />
              <p className="text-sm font-semibold text-slate-900">Status: {toStatusLabel(status)}</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {localError ||
                message ||
                "Use voice to ask about donation categories, bulk clothing submissions, QR codes, approvals, or inventory steps."}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleStart}
              disabled={isBusy || status === "connecting" || status === "connected"}
              className="rounded-full bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:bg-sage-300"
            >
              {isBusy || status === "connecting" ? "Starting..." : "Start voice chat"}
            </button>
            <button
              type="button"
              onClick={handleStop}
              disabled={status !== "connected"}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              End conversation
            </button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsMuted((current) => !current)}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {isMuted ? "Unmute microphone" : "Mute microphone"}
            </button>
            <p className="rounded-full bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-500">
              {conversation.mode === "speaking" ? "Assistant is speaking" : "Assistant is listening"}
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-400">
            Your browser will ask for microphone access before the conversation starts. This app now uses a server-side
            ElevenLabs signed URL for the connection.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function toStatusLabel(status: ReturnType<typeof useConversationStatus>["status"]) {
  if (status === "connected") return "Connected";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Error";
  return "Disconnected";
}
