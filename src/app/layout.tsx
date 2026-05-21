import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE = "https://prompt-lab-promptly.vercel.app";
const DESCRIPTION =
  "Run one input through two prompts or two models at once, watch both stream in parallel, then compare output, cost and latency on a scored verdict. Bring your own key, no backend.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "prompt-lab — A/B test your Claude prompts, side by side",
    template: "%s · prompt-lab",
  },
  description: DESCRIPTION,
  applicationName: "prompt-lab",
  keywords: [
    "prompt engineering",
    "A/B testing",
    "prompt testing",
    "Claude API",
    "Anthropic API",
    "LLM cost",
    "model comparison",
    "Claude",
    "developer tool",
    "BYOK",
  ],
  authors: [{ name: "Ferhat Atagün", url: "https://ferhatatagun.com" }],
  creator: "Ferhat Atagün",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "prompt-lab",
    title: "prompt-lab — A/B test your Claude prompts, side by side",
    description:
      "One input, two variants, streamed in parallel — compared on output, cost and latency.",
  },
  twitter: {
    card: "summary_large_image",
    title: "prompt-lab — A/B test your Claude prompts, side by side",
    description: "One input, two variants — compared on output, cost and latency. BYOK.",
    creator: "@ferhatatagun",
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "prompt-lab",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (web browser)",
  description: DESCRIPTION,
  url: SITE,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Ferhat Atagün", url: "https://ferhatatagun.com" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
