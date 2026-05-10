"use client";

import { useState, useEffect, useCallback } from "react";

const NAV_LINKS = [
  { label: "Chart", id: "chart" },
  { label: "Fundamentals", id: "fundamentals-section", mobileOnly: true },
  { label: "Cown AI", id: "cwt-ai-section" },
  { label: "News", id: "news" },
  { label: "About", id: "about" },
];

export default function CoinDetailStickyNav({
  lastUpdated,
}: {
  lastUpdated?: string | null;
}) {
  const [activeSection, setActiveSection] = useState("chart");

  /* ── Scroll Spy ── */
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    const scrollContainer = isDesktop ? document.getElementById("main-scroll") : null;
    if (isDesktop && !scrollContainer) return;

    const sectionIds = NAV_LINKS.map((l) => l.id);
    const visibilityMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityMap.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        // Find the section with highest visibility
        let maxRatio = 0;
        let maxId = "chart";
        for (const [id, ratio] of visibilityMap.entries()) {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        }

        const scrollTop = isDesktop ? (scrollContainer as HTMLElement).scrollTop : window.scrollY;

        if (scrollTop < 200) {
          setActiveSection("chart");
        } else if (maxRatio > 0) {
          setActiveSection(maxId);
        }
      },
      {
        root: scrollContainer,
        threshold: [0, 0.1, 0.2, 0.3, 0.5],
        rootMargin: "-60px 0px -50% 0px",
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* ── Smooth scroll ──── */
  const handleScrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      const scrollContainer = document.getElementById("main-scroll");
      if (scrollContainer) {
        let topPos = 0;
        let currentEl: HTMLElement | null = el;
        
        while (currentEl && currentEl !== scrollContainer) {
          topPos += currentEl.offsetTop;
          currentEl = currentEl.offsetParent as HTMLElement;
        }
        
        const offset = topPos - 80;
        scrollContainer.scrollTo({ top: offset, behavior: "smooth" });
      }
    } else {
      const rect = el.getBoundingClientRect();
      const offset = window.scrollY + rect.top - 100;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }, []);

  return (
    <nav className="sticky top-0 z-30 bg-background border-b border-border/50">
      <div className="flex items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-0.5 mt-auto mb-[-1px]">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleScrollTo(link.id)}
                className={`relative px-2 sm:px-4 pb-3 pt-3 text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  link.mobileOnly ? "lg:hidden" : ""
                } ${
                  isActive
                    ? "text-[#00E5FF] font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
                {/* Underline indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs font-medium tabular-nums text-slate-500">
          <span>Last updated:</span>
          <span className="text-slate-300">{lastUpdated ?? "-"}</span>
        </div>
      </div>
    </nav>
  );
}
