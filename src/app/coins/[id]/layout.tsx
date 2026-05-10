export default async function CoinDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-cyan-500/30">
      {children}
    </div>
  );
}
