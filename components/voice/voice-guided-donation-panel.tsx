"use client";

import { useState } from "react";
import {
  ConversationProvider,
  useConversation,
  useConversationClientTool,
  useConversationStatus
} from "@elevenlabs/react";
import { ClothingBulkRange, DonationInput } from "@/lib/types";
import { cn, toTitleCase } from "@/lib/utils";

type VoiceFormState = {
  isAnonymous: boolean;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  itemName: string;
  category: DonationInput["category"] | "";
  isBulkClothing: boolean;
  bulkClothingRange: ClothingBulkRange | "";
  condition: DonationInput["condition"] | "";
  brand: string;
  size: string;
  description: string;
  hasImage: boolean;
  step: "donor" | "item";
};

type VoiceFormActions = {
  setAnonymous: (value: boolean) => string;
  setDonorName: (value: string) => string;
  setDonorEmail: (value: string) => string;
  setDonorPhone: (value: string) => string;
  continueToItemStep: () => string;
  goToDonorStep: () => string;
  setItemName: (value: string) => string;
  setCategory: (value: string) => string;
  setBulkClothing: (value: boolean) => string;
  setBulkClothingRange: (value: string) => string;
  setCondition: (value: string) => string;
  setBrand: (value: string) => string;
  setSize: (value: string) => string;
  setDescription: (value: string) => string;
  promptImageUpload: (mode?: "camera" | "files") => Promise<string>;
  submitDonation: () => Promise<string>;
};

export function VoiceGuidedDonationPanel({
  state,
  actions
}: {
  state: VoiceFormState;
  actions: VoiceFormActions;
}) {
  return (
    <ConversationProvider
      onError={(error) => {
        console.error("ElevenLabs donation assistant error:", error);
      }}
    >
      <VoiceDonationRuntime state={state} actions={actions} />
    </ConversationProvider>
  );
}

function VoiceDonationRuntime({
  state,
  actions
}: {
  state: VoiceFormState;
  actions: VoiceFormActions;
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const { status, message } = useConversationStatus();
  const conversation = useConversation({
    micMuted: isMuted
  });

  useDonationTools(state, actions);

  async function handleStart() {
    setIsBusy(true);
    setLocalError("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const response = await fetch("/api/elevenlabs/signed-url", { cache: "no-store" });
      const payload = (await response.json().catch(() => ({}))) as { signedUrl?: string; error?: unknown };

      if (!response.ok || !payload.signedUrl) {
        throw new Error(formatAssistantMessage(payload.error || "Unable to start the voice guide."));
      }

      conversation.startSession({
        signedUrl: payload.signedUrl
      });
    } catch (error) {
      const nextError = formatAssistantMessage(error);
      console.error("Unable to start voice-guided donation:", error);
      setLocalError(nextError);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage-700">Voice-Guided Donation</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Donate by voice, submit on the same form</h3>
        </div>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
          {toTitleCase(state.step)}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        The assistant can ask the same onboarding questions as this page, fill the fields for you, and submit through
        the same donation flow. When it reaches the image step, you still use the upload or camera buttons on the page.
      </p>

      <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
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
            formatAssistantMessage(message) ||
            "Ask the assistant to begin the donation, fill your donor details, choose a category, set the condition, and guide you to upload the photo."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={isBusy || status === "connecting" || status === "connected"}
          className="rounded-full bg-sage-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:bg-sage-300"
        >
          {isBusy || status === "connecting" ? "Starting..." : "Start voice guide"}
        </button>
        <button
          type="button"
          onClick={() => conversation.endSession()}
          disabled={status !== "connected"}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          End voice guide
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setIsMuted((current) => !current)}
          className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {isMuted ? "Unmute microphone" : "Mute microphone"}
        </button>
        <div className="rounded-full bg-slate-50 px-5 py-3 text-center text-sm font-semibold text-slate-500">
          {conversation.mode === "speaking" ? "Assistant is speaking" : "Assistant is listening"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Snapshot label="Donor mode" value={state.isAnonymous ? "Anonymous" : "Named donor"} />
        <Snapshot label="Item photo" value={state.hasImage ? "Image added" : "Waiting for image"} />
        <Snapshot label="Category" value={state.category ? toTitleCase(state.category) : "Not selected"} />
        <Snapshot label="Condition" value={state.condition ? toTitleCase(state.condition) : "Not selected"} />
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-sage-100 bg-sage-50 p-4 text-sm text-sage-900">
        Suggested prompt for your agent:
        <span className="block mt-2 text-sage-800">
          Guide the donor through the same website questions in order. Use your client tools to set anonymous mode,
          donor fields, item details, category, clothing bulk options, condition, and optional fields. When the image
          is needed, tell the donor to use the upload or camera buttons. Only call submit after an image is present.
        </span>
      </div>
    </div>
  );
}

function useDonationTools(state: VoiceFormState, actions: VoiceFormActions) {
  useConversationClientTool("get_donation_state", () =>
    JSON.stringify({
      step: state.step,
      isAnonymous: state.isAnonymous,
      donorName: state.donorName,
      donorEmail: state.donorEmail,
      donorPhone: state.donorPhone,
      itemName: state.itemName,
      category: state.category,
      isBulkClothing: state.isBulkClothing,
      bulkClothingRange: state.bulkClothingRange,
      condition: state.condition,
      brand: state.brand,
      size: state.size,
      description: state.description,
      hasImage: state.hasImage
    })
  );

  useConversationClientTool("set_anonymous", (params) =>
    actions.setAnonymous(Boolean(params.anonymous))
  );
  useConversationClientTool("set_donor_name", (params) => actions.setDonorName(asString(params.name)));
  useConversationClientTool("set_donor_email", (params) => actions.setDonorEmail(asString(params.email)));
  useConversationClientTool("set_donor_phone", (params) => actions.setDonorPhone(asString(params.phone)));
  useConversationClientTool("continue_to_item_step", () => actions.continueToItemStep());
  useConversationClientTool("go_to_donor_step", () => actions.goToDonorStep());
  useConversationClientTool("set_item_name", (params) => actions.setItemName(asString(params.itemName)));
  useConversationClientTool("set_category", (params) => actions.setCategory(asString(params.category)));
  useConversationClientTool("set_bulk_clothing", (params) =>
    actions.setBulkClothing(Boolean(params.isBulk))
  );
  useConversationClientTool("set_bulk_clothing_range", (params) =>
    actions.setBulkClothingRange(asString(params.range))
  );
  useConversationClientTool("set_condition", (params) =>
    actions.setCondition(asString(params.condition))
  );
  useConversationClientTool("set_brand", (params) => actions.setBrand(asString(params.brand)));
  useConversationClientTool("set_size", (params) => actions.setSize(asString(params.size)));
  useConversationClientTool("set_description", (params) =>
    actions.setDescription(asString(params.description))
  );
  useConversationClientTool("prompt_image_upload", (params) =>
    actions.promptImageUpload(asUploadMode(params.mode))
  );
  useConversationClientTool("submit_donation", () => actions.submitDonation());
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function toStatusLabel(status: ReturnType<typeof useConversationStatus>["status"]) {
  if (status === "connected") return "Connected";
  if (status === "connecting") return "Connecting";
  if (status === "error") return "Error";
  return "Disconnected";
}

function formatAssistantMessage(value: unknown) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Error) {
    return value.message;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asUploadMode(value: unknown): "camera" | "files" | undefined {
  return value === "camera" || value === "files" ? value : undefined;
}
