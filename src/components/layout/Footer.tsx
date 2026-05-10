"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/cown-ai") return null;

  const handleMarketOverviewClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="mt-auto border-t border-slate-800 bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 pt-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 pb-12">
          
          {/* 1. Left Column (Brand) */}
          <div className="flex flex-col gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-1 w-auto"
            >
              <img
                src="/icon.svg"
                alt="CoinWeton Icon"
                className="h-8 w-auto relative z-10"
              />
              <img
                src="/text5.svg"
                alt="CoinWeton Text"
                className="h-7 w-auto block translate-y-[4px]"
              />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Real-time cryptocurrency tracker providing market data, charts, and the latest news.
            </p>
          </div>

          {/* 2. Middle Column (Quick Links) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[15px] font-semibold text-slate-200">Quick Links</h4>
            <nav className="flex flex-col gap-2.5">
              <Link 
                href="/" 
                onClick={handleMarketOverviewClick}
                className="text-sm text-slate-400 transition-colors hover:text-[#00E5FF]"
              >
                Market Overview
              </Link>
              <Link 
                href="/news" 
                className="text-sm text-slate-400 transition-colors hover:text-[#00E5FF]"
              >
                Latest News
              </Link>
              <Link 
                href="/cown-ai" 
                className="text-sm text-slate-400 transition-colors hover:text-[#00E5FF]"
              >
                Cown AI
              </Link>
            </nav>
          </div>

          {/* 3. Right Column (Data Provider) */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[15px] font-semibold text-slate-200">Data Provided By</h4>
            <a
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/coingecko-logo.svg"
                alt="CoinGecko Logo"
                className="h-8 w-auto"
              />
            </a>
            <a
              href="https://gopluslabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/goplus1.svg"
                alt="GoPlus Logo"
                className="h-6 w-auto"
              />
            </a>
          </div>
        </div>

        {/* Bottom Bar (Copyright) */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-800/50">
          <p className="text-xs text-slate-500">
            © 2026 CoinWeton. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
