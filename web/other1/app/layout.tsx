import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "VECTOR-ONE — DAW Engine Dependency Blueprint",
  description:
    "The definitive production-grade dependency blueprint for a cross-platform professional DAW: low-latency DSP cores, on-device AI audio-to-JSON tracking, NLP command engines and native tooling — 88 packages, zero user tracking.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="noise bg-[#060708] font-sans text-zinc-200 antialiased">
        {children}
      </body>
    </html>
  );
}
