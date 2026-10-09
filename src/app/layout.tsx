import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoinWeton | Smart Crypto Tracker & AI Assistant",
  description:
    "The ultimate smart crypto tracker and AI assistant. Monitor real-time prices, analyze market trends with AI, and track your watchlist with ease.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: [
    "crypto",
    "cryptocurrency",
    "bitcoin",
    "ethereum",
    "market cap",
    "aggregator",
    "coinweton",
  ],
  verification: {
    google: "RDqO8MqGIMaagmt5eb9vQIkZEij4VzXLoowTNeV_2VY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} scroll-smooth antialiased overflow-x-hidden`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
        <SessionProviderWrapper>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1E293B",
                border: "1px solid #334155",
                color: "#E2E8F0",
                fontFamily: "var(--font-sans), system-ui, sans-serif",
                fontSize: "14px",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                width: "auto",
                minWidth: "max-content",
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
              },
            }}
            theme="dark"
            richColors
            closeButton
          />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
