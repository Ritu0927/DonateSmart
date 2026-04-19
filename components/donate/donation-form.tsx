"use client";

import dynamic from "next/dynamic";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categoryOptions, conditionOptions } from "@/lib/constants";
import { ClothingBulkRange, DonationInput, DonorInput, DonorProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type DonateStep = "donor" | "item";

type FormState = {
  donor: DonorInput;
  isAnonymous: boolean;
  itemName: DonationInput["itemName"];
  category: DonationInput["category"] | "";
  isBulkClothing: boolean;
  bulkClothingRange: ClothingBulkRange | "";
  condition: DonationInput["condition"] | "";
  brand: string;
  size: string;
  description: string;
  imageDataUrl: string;
};

const initialDonor: DonorInput = {
  name: "",
  email: "",
  phone: ""
};

const initialItemState = {
  itemName: "",
  category: "" as DonationInput["category"] | "",
  isBulkClothing: false,
  bulkClothingRange: "" as ClothingBulkRange | "",
  condition: "" as DonationInput["condition"] | "",
  brand: "",
  size: "",
  description: "",
  imageDataUrl: ""
};

const VoiceGuidedDonationPanel = dynamic(
  () => import("@/components/voice/voice-guided-donation-panel").then((module) => module.VoiceGuidedDonationPanel),
  { ssr: false, loading: () => null }
);

export function DonationForm({
  donor,
  startAnonymous = false
}: {
  donor?: DonorProfile | null;
  startAnonymous?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<DonateStep>(donor ? "item" : "donor");
  const [form, setForm] = useState<FormState>({
    donor: donor
      ? {
          name: donor.name,
          email: donor.email,
          phone: donor.phone
        }
      : initialDonor,
    isAnonymous: donor ? false : startAnonymous,
    ...initialItemState
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [voiceUploadHint, setVoiceUploadHint] = useState("");
  const [highlightImageSection, setHighlightImageSection] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const imageSectionRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageSelected = useMemo(() => Boolean(form.imageDataUrl), [form.imageDataUrl]);
  const isBulkClothingDonation = form.category === "clothing" && form.isBulkClothing;

  useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [isCameraOpen]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!highlightImageSection) return;

    const timeout = window.setTimeout(() => {
      setHighlightImageSection(false);
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [highlightImageSection]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function updateDonorField<K extends keyof DonorInput>(key: K, value: DonorInput[K]) {
    setForm((current) => ({
      ...current,
      donor: {
        ...current.donor,
        [key]: value
      }
    }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function setCategoryValue(value: FormState["category"]) {
    updateField("category", value);
    if (value !== "clothing") {
      updateField("isBulkClothing", false);
      updateField("bulkClothingRange", "");
    }
  }

  function setBulkClothingValue(value: boolean) {
    updateField("isBulkClothing", value);
    if (!value) {
      updateField("bulkClothingRange", "");
    }
  }

  function validateDonorStep() {
    const nextErrors: Record<string, string> = {};

    if (form.isAnonymous) {
      setErrors(nextErrors);
      return true;
    }

    if (!form.donor.name.trim()) {
      nextErrors.name = "Name is required.";
    }

    if (!form.donor.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donor.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.donor.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (form.donor.phone.replace(/\D/g, "").length < 10) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateItemStep() {
    const nextErrors: Record<string, string> = {};

    if (!form.itemName.trim()) {
      nextErrors.itemName = "Item name is required.";
    }

    if (!form.imageDataUrl) {
      nextErrors.imageDataUrl = "Upload an image to continue.";
    }

    if (isBulkClothingDonation && !form.bulkClothingRange) {
      nextErrors.bulkClothingRange = "Choose the clothing quantity range.";
    }

    if (form.description.length > 500) {
      nextErrors.description = "Description should stay under 500 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, imageDataUrl: "Please choose an image file." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField("imageDataUrl", reader.result as string);
      setCameraError("");
      setVoiceUploadHint("Image added. You can ask the voice guide to submit now.");
    };
    reader.readAsDataURL(file);
  }

  async function openCamera() {
    if (step !== "item") return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support direct camera capture here. Please upload from files instead.");
      return;
    }

    setIsStartingCamera(true);
    setCameraError("");
    setVoiceUploadHint("Camera opened. Capture the item photo, then ask the voice guide to continue.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });

      stopCamera();
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setCameraError("Camera access was not granted. Please allow camera access or upload from files instead.");
    } finally {
      setIsStartingCamera(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError("The camera is still starting. Please wait a moment and try again.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture a photo on this device.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    updateField("imageDataUrl", canvas.toDataURL("image/jpeg", 0.92));
    setCameraError("");
    setVoiceUploadHint("Photo captured. You can ask the voice guide to submit the donation now.");
    stopCamera();
  }

  function continueToItemStep() {
    setSubmitError("");
    if (validateDonorStep()) {
      setStep("item");
      return "Donor details are complete. Continue with the item details.";
    }
    return "Some donor details are still missing or invalid.";
  }

  async function submitDonation() {
    setSubmitError("");

    if (step === "donor") {
      return continueToItemStep();
    }

    if (!validateItemStep()) {
      return "The donation form still needs required item details or an image before submission.";
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          donor: form.isAnonymous ? undefined : form.donor,
          donorId: form.isAnonymous ? undefined : donor?.id,
          isAnonymous: form.isAnonymous,
          itemName: form.itemName,
          category: form.category,
          isBulkClothing: form.isBulkClothing,
          bulkClothingRange: form.bulkClothingRange,
          condition: form.condition,
          brand: form.brand,
          size: form.size,
          description: form.description,
          imageDataUrl: form.imageDataUrl
        })
      });

      const payload = (await response.json()) as {
        id?: string;
        donorId?: string | null;
        errors?: Record<string, string>;
        error?: string;
      };

      if (!response.ok) {
        if (payload.errors) {
          setErrors(payload.errors);
        }
        throw new Error(payload.error || "Unable to submit donation.");
      }

      const successUrl = payload.donorId
        ? `/success/${payload.id}?donor=${payload.donorId}`
        : `/success/${payload.id}?anonymous=1`;
      router.push(successUrl);
      return "Donation submitted successfully. The QR code is now being shown on the success page.";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setSubmitError(message);
      return message;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === "donor") {
      continueToItemStep();
      return;
    }

    await submitDonation();
  }

  async function promptImageUpload(mode?: "camera" | "files") {
    imageSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setHighlightImageSection(true);

    if (mode === "camera") {
      await openCamera();
      return "The camera has been opened on the page. Ask the donor to capture the item photo.";
    }

    if (mode === "files") {
      // Browsers may block file picker opening unless they treat this as a user gesture.
      // We still attempt it and always fall back to a clear on-page instruction.
      fileInputRef.current?.click();
      setVoiceUploadHint("The image upload area is highlighted. Use Upload from files now, then ask the voice guide to continue.");
      return "The upload area is highlighted. Ask the donor to choose an image file on the page now.";
    }

    setVoiceUploadHint(
      mode === "files"
        ? "Use the Upload from files panel now, then ask the voice guide to continue."
        : "Use Upload from files or Take photo with camera on this page, then ask the voice guide to continue."
    );
    return mode === "files"
      ? "Ask the donor to use the upload button on the page now."
      : "Ask the donor to use the upload or camera buttons on the page now.";
  }

  const voiceState = {
    isAnonymous: form.isAnonymous,
    donorName: form.donor.name,
    donorEmail: form.donor.email,
    donorPhone: form.donor.phone,
    itemName: form.itemName,
    category: form.category,
    isBulkClothing: form.isBulkClothing,
    bulkClothingRange: form.bulkClothingRange,
    condition: form.condition,
    brand: form.brand,
    size: form.size,
    description: form.description,
    hasImage: imageSelected,
    step
  } as const;

  const voiceActions = {
    setAnonymous(value: boolean) {
      updateField("isAnonymous", value);
      return value
        ? "Anonymous donation is enabled. Loyalty points will not be counted."
        : "Anonymous donation is disabled. The donor profile fields can now be filled.";
    },
    setDonorName(value: string) {
      updateDonorField("name", value);
      return `Donor name set to ${value || "blank"}.`;
    },
    setDonorEmail(value: string) {
      updateDonorField("email", value);
      return `Donor email set to ${value || "blank"}.`;
    },
    setDonorPhone(value: string) {
      updateDonorField("phone", value);
      return `Donor phone set to ${value || "blank"}.`;
    },
    continueToItemStep,
    goToDonorStep() {
      setStep("donor");
      return "Returned to the donor details step.";
    },
    setItemName(value: string) {
      updateField("itemName", value);
      return `Item name set to ${value || "blank"}.`;
    },
    setCategory(value: string) {
      const normalized = value.toLowerCase().trim() as FormState["category"];
      const validCategories = new Set(categoryOptions.map((option) => option.value));

      if (!validCategories.has(normalized as DonationInput["category"])) {
        return `That category is not valid. Use one of: ${categoryOptions.map((option) => option.label).join(", ")}.`;
      }

      setCategoryValue(normalized);
      return `Category set to ${normalized}.`;
    },
    setBulkClothing(value: boolean) {
      setBulkClothingValue(value);
      return value
        ? "Bulk clothing donation is enabled. Ask for the clothing quantity range next."
        : "Single clothing item mode is enabled.";
    },
    setBulkClothingRange(value: string) {
      const validRanges = new Set(["0-10", "10-20", "20-30", "30-40", "40+"]);
      if (!validRanges.has(value)) {
        return "That clothing range is not valid. Use 0-10, 10-20, 20-30, 30-40, or 40+.";
      }
      updateField("bulkClothingRange", value as ClothingBulkRange);
      return `Bulk clothing range set to ${value}.`;
    },
    setCondition(value: string) {
      const normalized = value.toLowerCase().trim() as FormState["condition"];
      const validConditions = new Set(conditionOptions.map((option) => option.value));

      if (!validConditions.has(normalized as DonationInput["condition"])) {
        return `That condition is not valid. Use one of: ${conditionOptions.map((option) => option.label).join(", ")}.`;
      }

      updateField("condition", normalized);
      return `Condition set to ${normalized}.`;
    },
    setBrand(value: string) {
      updateField("brand", value);
      return value ? `Brand set to ${value}.` : "Brand cleared.";
    },
    setSize(value: string) {
      updateField("size", value);
      return value ? `Size set to ${value}.` : "Size cleared.";
    },
    setDescription(value: string) {
      updateField("description", value);
      return value ? "Description updated." : "Description cleared.";
    },
    promptImageUpload,
    submitDonation
  } satisfies Record<string, (...args: never[]) => unknown>;

  return (
    <div className="space-y-8">
      <VoiceGuidedDonationPanel state={voiceState} actions={voiceActions} />
      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
        aria-describedby={submitError ? "form-error" : undefined}
      >
        <div className="space-y-6 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-card backdrop-blur sm:p-8">
        <div className="flex items-center gap-3">
          <StepBadge active={step === "donor"} number="1" label="Donor details" />
          <StepBadge active={step === "item"} number="2" label="Item details" />
        </div>

        {step === "donor" ? (
          <>
            {!donor ? (
              <label className="flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(event) => updateField("isAnonymous", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sage-600 focus:ring-sage-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">Donate anonymously</span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Anonymous donations skip donor profile creation and do not earn loyalty points.
                  </span>
                </span>
              </label>
            ) : null}

            {form.isAnonymous ? (
              <div className="rounded-[1.5rem] border border-sage-100 bg-sage-50 px-4 py-4 text-sm text-sage-900">
                This donation will be submitted anonymously. You can continue to the item details without entering
                your name, email, or phone number.
              </div>
            ) : (
              <>
                <FormField label="Full name" error={errors.name} required>
                  <input
                    value={form.donor.name}
                    onChange={(event) => updateDonorField("name", event.target.value)}
                    className={inputClass(errors.name)}
                    placeholder="Your name"
                  />
                </FormField>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Email" error={errors.email} required>
                    <input
                      type="email"
                      value={form.donor.email}
                      onChange={(event) => updateDonorField("email", event.target.value)}
                      className={inputClass(errors.email)}
                      placeholder="name@example.com"
                    />
                  </FormField>

                  <FormField label="Phone number" error={errors.phone} required>
                    <input
                      type="tel"
                      value={form.donor.phone}
                      onChange={(event) => updateDonorField("phone", event.target.value)}
                      className={inputClass(errors.phone)}
                      placeholder="(555) 123-4567"
                    />
                  </FormField>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="rounded-[1.5rem] border border-sage-100 bg-sage-50 px-4 py-4">
              <p className="text-sm font-semibold text-sage-800">
                {form.isAnonymous ? "Anonymous donation" : form.donor.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {form.isAnonymous ? "No donor profile or loyalty points will be attached to this item." : `${form.donor.email} · ${form.donor.phone}`}
              </p>
              {!donor ? (
                <button
                  type="button"
                  onClick={() => setStep("donor")}
                  className="mt-3 text-sm font-semibold text-sage-700 hover:text-sage-900"
                >
                  Edit donor details
                </button>
              ) : null}
            </div>

            <FormField label="Item name" error={errors.itemName} required>
              <input
                value={form.itemName}
                onChange={(event) => updateField("itemName", event.target.value)}
                className={inputClass(errors.itemName)}
                placeholder={
                  isBulkClothingDonation
                    ? "Bag of mixed women’s tops, bundle of kids clothing..."
                    : "Vintage lamp, denim jacket, running shoes..."
                }
              />
            </FormField>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Category" error={errors.category} required>
                <select
                  value={form.category}
                  onChange={(event) => {
                    const nextCategory = event.target.value as FormState["category"];
                    setCategoryValue(nextCategory);
                  }}
                  className={inputClass(errors.category)}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {form.category === "clothing" ? (
                <FormField label="Bulk clothing donation?" error={errors.isBulkClothing}>
                  <select
                    value={form.isBulkClothing ? "yes" : "no"}
                    onChange={(event) => {
                      const nextValue = event.target.value === "yes";
                      setBulkClothingValue(nextValue);
                    }}
                    className={inputClass(errors.isBulkClothing)}
                  >
                    <option value="no">No, this is a single item</option>
                    <option value="yes">Yes, this is a bulk bag / bundle</option>
                  </select>
                </FormField>
              ) : (
                <FormField label="Condition" error={errors.condition} required>
                  <select
                    value={form.condition}
                    onChange={(event) => updateField("condition", event.target.value as FormState["condition"])}
                    className={inputClass(errors.condition)}
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}
            </div>

            {form.category === "clothing" && !form.isBulkClothing ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField label="Condition" error={errors.condition} required>
                  <select
                    value={form.condition}
                    onChange={(event) => updateField("condition", event.target.value as FormState["condition"])}
                    className={inputClass(errors.condition)}
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            ) : null}

            {form.category === "clothing" && form.isBulkClothing ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField label="How many clothing items are in the bag?" error={errors.bulkClothingRange} required>
                  <select
                    value={form.bulkClothingRange}
                    onChange={(event) =>
                      updateField("bulkClothingRange", event.target.value as FormState["bulkClothingRange"])
                    }
                    className={inputClass(errors.bulkClothingRange)}
                  >
                    <option value="">Select a range</option>
                    <option value="0-10">0-10 items</option>
                    <option value="10-20">10-20 items</option>
                    <option value="20-30">20-30 items</option>
                    <option value="30-40">30-40 items</option>
                    <option value="40+">More than 40 items</option>
                  </select>
                </FormField>

                <FormField label="Condition" error={errors.condition} required>
                  <select
                    value={form.condition}
                    onChange={(event) => updateField("condition", event.target.value as FormState["condition"])}
                    className={inputClass(errors.condition)}
                  >
                    <option value="">Select condition</option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField label="Brand" error={errors.brand}>
                <input
                  value={form.brand}
                  onChange={(event) => updateField("brand", event.target.value)}
                  className={inputClass(errors.brand)}
                  placeholder="Optional"
                />
              </FormField>

              <FormField label="Size" error={errors.size}>
                <input
                  value={form.size}
                  onChange={(event) => updateField("size", event.target.value)}
                  className={inputClass(errors.size)}
                  placeholder="Optional"
                />
              </FormField>
            </div>

            <FormField label="Description" error={errors.description}>
              <textarea
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                className={cn(inputClass(errors.description), "min-h-32 resize-none")}
                placeholder="Optional details to help staff understand the item."
                maxLength={500}
              />
              <div className="mt-2 text-right text-xs text-slate-400">{form.description.length}/500</div>
            </FormField>
          </>
        )}

        {submitError ? (
          <div
            id="form-error"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {step === "item" && !donor ? (
            <button
              type="button"
              onClick={() => setStep("donor")}
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              Back
            </button>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-sage-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-sage-700 disabled:cursor-not-allowed disabled:bg-sage-300"
          >
            {step === "donor"
              ? "Continue to item details"
              : isSubmitting
                ? "Submitting and analyzing with Gemini..."
                : "Submit donation"}
          </button>
        </div>
      </div>

      <aside className="space-y-6">
        <div
          ref={imageSectionRef}
          className={cn(
            "rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-card backdrop-blur transition sm:p-8",
            highlightImageSection ? "ring-4 ring-sage-200 border-sage-300" : ""
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Item photo</p>
              <p className="mt-1 text-sm text-slate-500">
                {isBulkClothingDonation
                  ? "Photograph the trash bag, wrapped bag, or clothing bundle clearly so staff can review the bulk donation."
                  : "Add one image for preview and staff review, either from your device or directly from the camera."}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-5 py-8 text-center transition",
                step === "item"
                  ? "border-sage-200 bg-sage-50/70 hover:border-sage-300 hover:bg-sage-50"
                  : "cursor-not-allowed border-slate-200 bg-slate-50"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={step !== "item"}
              />
              <span className="text-sm font-semibold text-sage-800">
                {imageSelected ? "Replace from files" : "Upload from files"}
              </span>
              <span className="mt-2 text-sm text-slate-500">Choose from gallery or device</span>
            </label>

            <button
              type="button"
              onClick={openCamera}
              disabled={step !== "item" || isStartingCamera}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-5 py-8 text-center transition",
                step === "item"
                  ? "border-peach-200 bg-peach-50 hover:border-peach-300"
                  : "cursor-not-allowed border-slate-200 bg-slate-50"
              )}
            >
              <span className="text-sm font-semibold text-peach-500">
                {isStartingCamera ? "Opening camera..." : "Take photo with camera"}
              </span>
              <span className="mt-2 text-sm text-slate-500">Open a live camera preview inside the app</span>
            </button>
          </div>
          {errors.imageDataUrl ? (
            <p className="mt-3 text-sm text-rose-600">{errors.imageDataUrl}</p>
          ) : null}
          {cameraError ? (
            <p className="mt-3 text-sm text-rose-600">{cameraError}</p>
          ) : null}
          {voiceUploadHint ? (
            <div className="mt-3 rounded-2xl border border-sage-100 bg-sage-50 px-4 py-3 text-sm text-sage-900">
              {voiceUploadHint}
            </div>
          ) : null}

          {isCameraOpen ? (
            <div className="mt-5 rounded-[1.5rem] border border-peach-200 bg-peach-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">Live camera</p>
              <p className="mt-1 text-sm text-slate-500">Frame the item clearly, then capture the photo.</p>
              <div className="mt-4 overflow-hidden rounded-[1.25rem] bg-slate-900">
                <video ref={videoRef} autoPlay playsInline muted className="h-72 w-full object-cover" />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="inline-flex items-center justify-center rounded-full bg-peach-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-peach-400"
                >
                  Capture photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel camera
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
            {imageSelected ? (
              <img src={form.imageDataUrl} alt="Donation preview" className="h-72 w-full object-cover" />
            ) : (
              <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-slate-400">
                {step === "item"
                  ? "Your uploaded image preview will appear here."
                  : "Complete donor onboarding first, then upload the item image."}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="rounded-[2rem] border border-sage-100 bg-sage-900 p-6 text-white shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage-100">What happens next</p>
          <ul className="mt-4 space-y-3 text-sm text-sage-50">
            <li>
              {form.isAnonymous
                ? "Anonymous donations skip donor profile creation and can still be submitted one after another."
                : "We save the donor profile so multiple items can be submitted in one session."}
            </li>
            <li>Gemini checks whether the image is clear and matches the selected category.</li>
            <li>Bulk clothing bags are accepted when the clothing range is selected and the bag photo is clear.</li>
            <li>
              {form.isAnonymous
                ? "Anonymous donations do not earn loyalty points."
                : "Accepted items earn loyalty points worth 10% of the low end of the suggested resale range."}
            </li>
          </ul>
        </div>
      </aside>
      </form>
    </div>
  );
}

function StepBadge({ active, number, label }: { active: boolean; number: string; label: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold",
        active ? "bg-sage-100 text-sage-800" : "bg-slate-100 text-slate-500"
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs",
          active ? "bg-sage-600 text-white" : "bg-white text-slate-500"
        )}
      >
        {number}
      </span>
      {label}
    </div>
  );
}

function FormField({
  label,
  error,
  required,
  children
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {required ? <span className="text-xs text-rose-500">*</span> : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

function inputClass(hasError?: string) {
  return cn(
    "w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4",
    hasError
      ? "border-rose-200 focus:border-rose-300 focus:ring-rose-100"
      : "border-slate-200 focus:border-sage-300 focus:ring-sage-100"
  );
}
