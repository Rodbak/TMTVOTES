import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/toast";
import { TopicsProvider } from "@/components/topics-store";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TMT Votes | Your voice. Your vote.",
  description:
    "Public voting demo — pick a topic, enter your email or phone, and vote. No registration.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans bg-bg text-ink min-h-screen flex flex-col">
        <TopicsProvider>
          <ToastProvider>
            <Nav />
            <div className="flex-1">{children}</div>
            <Footer />
          </ToastProvider>
        </TopicsProvider>
      </body>
    </html>
  );
}
