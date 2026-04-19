import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { DonationVoiceProvider } from "@/components/voice/donation-voice-context";

const ElevenLabsAssistant = dynamic(
  () => import("@/components/voice/elevenlabs-assistant").then((module) => module.ElevenLabsAssistant),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "DonateSmart",
  description: "A polished donation intake and QR tracking app for hackathon demos."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-ink antialiased">
        <DonationVoiceProvider>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
              <SiteHeader />
              <main className="flex-1">{children}</main>
            </div>
            <ElevenLabsAssistant />
          </div>
        </DonationVoiceProvider>
      </body>
    </html>
  );
}
