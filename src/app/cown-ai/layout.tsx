import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cown AI - CoinWeton",
  description: "Your intelligent crypto companion powered by Cown AI.",
};

export default function CownAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
