import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE = "https://prompt-lab-promptly.vercel.app";
const TITLE = "prompt-lab — A/B test your Claude prompts, side by side";
const DESCRIPTION =
  "Run one input through two prompts or two models at once, watch both stream in parallel, then compare output, cost and latency on a scored verdict. Bring your own key, no backend.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s · prompt-lab",
  },
  description: DESCRIPTION,
  applicationName: "prompt-lab",
  keywords: [
    "prompt engineering",
    "A/B testing prompts",
    "Claude API",
    "Anthropic API",
    "LLM cost",
    "model comparison",
    "Sonnet vs Haiku",
    "prompt evaluation",
    "side-by-side prompts",
    "developer tool",
    "BYOK",
    "Ferhat Atagun",
  ],
  authors: [{ name: "Ferhat Atagün", url: "https://ferhatatagun.com" }],
  creator: "Ferhat Atagün",
  publisher: "Ferhat Atagün",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "prompt-lab",
    title: TITLE,
    description:
      "Two prompts, one input, side by side. Compare output, cost and latency in seconds.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ferhatatagun",
    creator: "@ferhatatagun",
    title: TITLE,
    description: "A/B test Claude prompts side by side — output, cost, latency. BYOK.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "developer tools",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://ferhatatagun.com/#person",
      name: "Ferhat Atagün",
      url: "https://ferhatatagun.com",
      jobTitle: "Frontend Team Lead",
      worksFor: { "@type": "Organization", name: "HangiKredi", url: "https://www.hangikredi.com" },
      sameAs: [
        "https://github.com/ferhatatagun",
        "https://www.linkedin.com/in/ferhatatagun/",
        "https://twitter.com/ferhatatagun",
        "https://medium.com/@ferhatatagun",
        "https://stackoverflow.com/users/20566734/",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "prompt-lab",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any (web browser)",
      description: DESCRIPTION,
      url: SITE,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: { "@id": "https://ferhatatagun.com/#person" },
      creator: { "@id": "https://ferhatatagun.com/#person" },
      isPartOf: {
        "@type": "CollectionPage",
        "@id": "https://ferhatatagun.com/tools#suite",
        name: "Open-source Claude dev-tools",
        url: "https://ferhatatagun.com/tools",
      },
      softwareHelp: { "@type": "WebPage", url: "https://ferhatatagun.com/blog/stop-choosing-prompts-by-vibes" },
      keywords: "prompt engineering, A/B testing, Claude API, model comparison",
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="author" href="https://ferhatatagun.com" />
        <link rel="me" href="https://ferhatatagun.com" />
        <link rel="me" href="https://github.com/ferhatatagun" />
      </head>
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
