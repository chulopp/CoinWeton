"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type TabKey = "About" | "Tokenomics" | "Financials" | "Dominance";

interface TokenomicsData {
  totalSupply: number | null;
  circulatingSupply: number | null;
  maxSupply: number | null;
  symbol?: string | null;
}

interface OptionalTabContent {
  title?: string;
  content?: string | null;
}

interface CoinInfoTabsProps {
  coinName?: string;
  coinSymbol?: string;
  description?: string | null;
  tokenomics?: TokenomicsData | null;
  financials?: OptionalTabContent | null;
  dominance?: OptionalTabContent | null;
}

function formatTokenAmount(
  value: number | null | undefined,
  symbol?: string | null
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  const formatted = value.toLocaleString("en-US", {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });

  return symbol ? `${formatted} ${symbol}` : formatted;
}

function hasContent(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeDescriptionHtml(description: string): string {
  const trimmedDescription = description.trim();

  if (
    /<(p|br|ul|ol|li|div|h[1-6]|blockquote|table)\b/i.test(trimmedDescription)
  ) {
    return trimmedDescription;
  }

  return trimmedDescription
    .split(/\r?\n\s*\r?\n+/)
    .map((paragraph) => paragraph.trim().replace(/\r?\n/g, "<br />"))
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
}

function AboutTab({
  coinName,
  coinSymbol,
  description,
}: {
  coinName: string;
  coinSymbol: string;
  description: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <h3 className="text-base font-bold text-white mb-3">
        About {coinName} ({coinSymbol})
      </h3>
      <div className="relative">
        <div
          className={`prose prose-invert prose-sm max-w-none text-slate-300 prose-p:leading-7 prose-p:text-slate-300 prose-p:whitespace-pre-line prose-headings:text-white prose-strong:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-li:text-slate-300 prose-ul:mb-4 prose-ol:mb-4 transition-all duration-300 ${
            !expanded ? "line-clamp-[14]" : ""
          }`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {!expanded ? (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#121825] to-transparent pointer-events-none" />
        ) : null}
      </div>
      <button
        onClick={() => setExpanded((current) => !current)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
      >
        {expanded ? (
          <>
            Read Less <ChevronUp className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            Read More <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  );
}

function TokenomicsTab({
  coinName,
  coinSymbol,
  tokenomics,
}: {
  coinName: string;
  coinSymbol: string;
  tokenomics: TokenomicsData;
}) {
  const referenceSupply =
    tokenomics.maxSupply ?? tokenomics.totalSupply ?? tokenomics.circulatingSupply;
  const circulatingRatio =
    referenceSupply && tokenomics.circulatingSupply !== null
      ? Math.min((tokenomics.circulatingSupply / referenceSupply) * 100, 100)
      : null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-white mb-2">
          {coinName} ({coinSymbol}) Tokenomics
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Supply metrics and distribution details for this asset.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Circulating Supply
          </p>
          <p className="text-lg font-bold text-white tabular-nums">
            {formatTokenAmount(tokenomics.circulatingSupply, tokenomics.symbol)}
          </p>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Total Supply
          </p>
          <p className="text-lg font-bold text-white tabular-nums">
            {formatTokenAmount(tokenomics.totalSupply, tokenomics.symbol)}
          </p>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Max Supply
          </p>
          <p className="text-lg font-bold text-white tabular-nums">
            {formatTokenAmount(tokenomics.maxSupply, tokenomics.symbol)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117] p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">
            Circulating Ratio
          </span>
          <span className="text-sm font-bold text-cyan-400 tabular-nums">
            {circulatingRatio === null ? "-" : `${circulatingRatio.toFixed(2)}%`}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400"
            style={{ width: `${circulatingRatio ?? 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function TextTab({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-white mb-3">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}

export default function CoinInfoTabs({
  coinName = "Unknown Coin",
  coinSymbol = "-",
  description,
  tokenomics = null,
  financials = null,
  dominance = null,
}: CoinInfoTabsProps) {
  const aboutDescription = hasContent(description)
    ? normalizeDescriptionHtml(description!)
    : "<p>No description available for this coin.</p>";

  const availableTabs: TabKey[] = ["About"];

  if (tokenomics) {
    availableTabs.push("Tokenomics");
  }

  if (hasContent(financials?.content)) {
    availableTabs.push("Financials");
  }

  if (hasContent(dominance?.content)) {
    availableTabs.push("Dominance");
  }

  const [selectedTab, setSelectedTab] = useState<TabKey>(availableTabs[0]);
  const activeTab = availableTabs.includes(selectedTab) ? selectedTab : availableTabs[0];

  return (
    <section id="about" className="scroll-mt-20">
      <div className="flex items-center gap-2 px-2 mb-6 flex-wrap">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "About" ? (
          <AboutTab
            coinName={coinName}
            coinSymbol={coinSymbol}
            description={aboutDescription}
          />
        ) : null}

        {activeTab === "Tokenomics" && tokenomics ? (
          <TokenomicsTab
            coinName={coinName}
            coinSymbol={coinSymbol}
            tokenomics={tokenomics}
          />
        ) : null}

        {activeTab === "Financials" && hasContent(financials?.content) ? (
          <TextTab
            title={financials?.title ?? `${coinName} Financials`}
            content={financials!.content!.trim()}
          />
        ) : null}

        {activeTab === "Dominance" && hasContent(dominance?.content) ? (
          <TextTab
            title={dominance?.title ?? `${coinName} Dominance`}
            content={dominance!.content!.trim()}
          />
        ) : null}
      </div>
    </section>
  );
}
