"use client";

import { useEffect, useRef, useState } from "react";

import { LineChart, CandlestickChart } from "lucide-react";
import CustomPriceChart from "./CustomPriceChart";

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

function getTradingViewSymbol(coinSymbol?: string | null): string {
  return coinSymbol?.trim() || "BINANCE:BTCUSDT";
}

export default function CoinChartSection({
  tradingViewSymbol,
  coinId,
}: {
  tradingViewSymbol?: string | null;
  coinId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);
  
  const [activeChart, setActiveChart] = useState<"custom" | "tradingview">("custom");
  const [customTimeframe, setCustomTimeframe] = useState("1M");
  
  const [interval, setIntervalState] = useState("D");
  const [tvTimeframe, setTvTimeframe] = useState("1M");
  
  const resolvedTradingViewSymbol = getTradingViewSymbol(tradingViewSymbol);

  const handleTvTimeframeClick = (tf: string) => {
    setTvTimeframe(tf);
    switch (tf) {
      case "1D": setIntervalState("15"); break;
      case "7D": setIntervalState("60"); break;
      case "1M": setIntervalState("D"); break;
      case "1Y": setIntervalState("W"); break;
      case "ALL": setIntervalState("M"); break;
      default: setIntervalState("D");
    }
  };

  useEffect(() => {
    if (activeChart !== "tradingview") return;

    const containerId = "tradingview_chart_container";

    function createWidget() {
      if (!containerRef.current || !window.TradingView) return;

      // Clear any existing content to prevent duplicates/scrollbars
      containerRef.current.innerHTML = "";

      // Create the inner div for the widget exactly to container size
      const widgetDiv = document.createElement("div");
      widgetDiv.id = containerId;
      widgetDiv.style.height = "100%";
      widgetDiv.style.width = "100%";
      containerRef.current.appendChild(widgetDiv);

      new window.TradingView.widget({
        container_id: containerId,
        autosize: true, // Takes 100% of the parent width and height
        symbol: resolvedTradingViewSymbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark", // Using standard native Dark Theme
        style: "1", // Candlestick standard
        locale: "en",
        enable_publishing: false,
        backgroundColor: "rgba(18, 24, 37, 1)", // Standard deep navy matching the site loosely
        gridColor: "rgba(42, 46, 57, 0.3)", // Visible but subtle standard grid
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        hide_side_toolbar: false,
        hide_volume: false,
        details: false,
      });
    }

    // Load the TradingView library script if not already loaded
    if (!scriptLoadedRef.current) {
      const existingScript = document.querySelector(
        'script[src="https://s3.tradingview.com/tv.js"]'
      );

      if (existingScript) {
        scriptLoadedRef.current = true;
        createWidget();
      } else {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          createWidget();
        };
        document.head.appendChild(script);
      }
    } else {
      createWidget();
    }
  }, [interval, resolvedTradingViewSymbol, activeChart]);

  return (
    <section id="chart" className="scroll-mt-16 border-b border-slate-800 pb-8 flex flex-col gap-4">
      {/* Top Header matching CMC style loosely */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 px-2">
        
        {/* Left Side: Timeframe Selectors */}
        <div className="flex items-center gap-2">
          {activeChart === "custom" ? (
            <div className="flex flex-wrap items-center gap-1 bg-[#1A2235]/50 p-1 rounded-lg border border-slate-800">
              {["24H", "7D", "1M", "3M", "YTD", "1Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setCustomTimeframe(tf)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                    customTimeframe === tf
                      ? "bg-slate-700 text-[#00E5FF] shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1 bg-[#1A2235]/50 p-1 rounded-lg border border-slate-800">
              {["1D", "7D", "1M", "1Y", "ALL"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTvTimeframeClick(tf)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                    tvTimeframe === tf
                      ? "bg-slate-700 text-[#00E5FF] shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Chart Type Toggle */}
        <div className="flex items-center gap-1 bg-[#1A2235]/50 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveChart("custom")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              activeChart === "custom"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span className="hidden sm:inline">Price</span>
          </button>
          
          <button
            onClick={() => setActiveChart("tradingview")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
              activeChart === "tradingview"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <CandlestickChart className="w-4 h-4" />
            <span className="hidden sm:inline">TradingView</span>
          </button>
        </div>
      </div>

      <div className="w-full bg-[#121825] rounded-xl overflow-hidden border border-slate-800/80 shadow-md">
        <div className="relative w-full h-[450px] md:h-[480px] shrink-0">
          {activeChart === "custom" ? (
            <CustomPriceChart coinId={coinId} timeframe={customTimeframe} />
          ) : (
            <div ref={containerRef} className="w-full h-full" />
          )}
        </div>
      </div>
    </section>
  );
}
