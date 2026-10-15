"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import NavbarTopTier from "./NavbarTopTier";
import NavbarBottomTier from "./NavbarBottomTier";
import type { GlobalMarketData } from "@/lib/market-data";

function AuthStatusHandler() {
  const searchParams = useSearchParams();
  const authStatus = searchParams.get('auth');
  const protectedParam = searchParams.get('protected');

  useEffect(() => {
    if (authStatus === 'success') {
      toast.success('Login successful! 🎉');

      // Clean the URL from parameters so that the toast no longer appears on manual refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (protectedParam === 'cown-ai') {
      toast.warning('Please log in to access Cown AI. 🔒');
      
      // Clean the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [authStatus, protectedParam]);

  return null;
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50">
      <Suspense fallback={null}>
        <AuthStatusHandler />
      </Suspense>
      <NavbarTopTier />
      <NavbarBottomTier />
    </header>
  );
}
