import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "prompt-lab — A/B test your Claude prompts, side by side",
  description:
    "Run one input through two prompts or two models at once. Stream both, then compare output, cost, and latency. Bring your own key, no backend.",
  openGraph: {
    title: "prompt-lab",
    description: "A/B test your Claude prompts side by side — output, cost, and latency.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
