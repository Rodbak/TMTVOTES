import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

function metadataBaseUrl(): URL {
  try {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (fromEnv) {
      const withScheme = fromEnv.includes("://") ? fromEnv : `https://${fromEnv}`;
      return new URL(withScheme);
    }
    if (process.env.VERCEL_URL) {
      return new URL(`https://${process.env.VERCEL_URL}`);
    }
  } catch {
    /* ignore bad env */
  }
  return new URL("http://localhost:3000");
}

/** Plain ASCII titles so every browser tab shows a label (no template merge quirks). */
export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  applicationName: "TMT Votes",
  title: "TMT Votes | Your voice. Your vote.",
  description:
    "Public voting on live topics. Vote with email or phone. No accounts required.",
  openGraph: {
    siteName: "TMT Votes",
    title: "TMT Votes | Your voice. Your vote.",
    description: "Public voting on live topics. No registration.",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "TMT Votes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TMT Votes",
    description: "Public voting on live topics.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable}`}>
      <body
        className="font-sans bg-tmt-bg text-tmt-text"
        style={{
          backgroundColor: "#E8F4FC",
          color: "#0B1220",
          minHeight: "100vh",
        }}
      >
        <noscript>
          <div
            style={{
              padding: "2rem",
              fontFamily: "system-ui, sans-serif",
              maxWidth: "36rem",
              margin: "0 auto",
            }}
          >
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>TMT Votes</h1>
            <p style={{ color: "#9ca3af", lineHeight: 1.6 }}>
              This app needs JavaScript enabled. Turn JavaScript on, or open the site in another browser.
            </p>
          </div>
        </noscript>
        {children}
        <Toaster richColors theme="light" position="top-right" />
      </body>
    </html>
  );
}
