"use client";

import { createContext, useContext, useState } from "react";
import { ClothingBulkRange, DonationInput } from "@/lib/types";

export type DonationVoiceState = {
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

export type DonationVoiceActions = {
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

type DonationVoiceContextValue = {
  state: DonationVoiceState | null;
  actions: DonationVoiceActions | null;
  setDonationVoiceState: (state: DonationVoiceState | null) => void;
  setDonationVoiceActions: (actions: DonationVoiceActions | null) => void;
};

const DonationVoiceContext = createContext<DonationVoiceContextValue | null>(null);

export function DonationVoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setDonationVoiceState] = useState<DonationVoiceState | null>(null);
  const [actions, setDonationVoiceActions] = useState<DonationVoiceActions | null>(null);

  return (
    <DonationVoiceContext.Provider
      value={{
        state,
        actions,
        setDonationVoiceState,
        setDonationVoiceActions
      }}
    >
      {children}
    </DonationVoiceContext.Provider>
  );
}

export function useDonationVoiceContext() {
  const context = useContext(DonationVoiceContext);

  if (!context) {
    throw new Error("useDonationVoiceContext must be used within DonationVoiceProvider.");
  }

  return context;
}
