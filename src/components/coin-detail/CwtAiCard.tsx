"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, ArrowRight, Info, Lock, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { CoinDetailData } from "@/lib/market-data";

// ── Types ─────────────────────────────────────────────────────
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DisplayMessage {
  sender: "user" | "ai";
  text: string;
}

const SUGGESTIONS = [
  "Why is the price down today?",
  "What could affect the future price?",
  "Show me the technical analysis",
];

// ── Helpers ───────────────────────────────────────────────────
const sanitizeOutput = (text: string) => {
  // Replace <br> with spaces to prevent breaking tables
  let cleanText = text.replace(/<br\s*\/?>/gi, " ");

  // Fix block math replacements (requires 4 dollar signs to output 2 in JS)
  cleanText = cleanText.replace(
    /\[\s*\\begin{aligned}/g,
    "$$$$\n\\begin{aligned}"
  );
  cleanText = cleanText.replace(
    /\\end{aligned}\s*\]/g,
    "\\end{aligned}\n$$$$"
  );
  cleanText = cleanText.replace(/\\\[/g, "$$$$").replace(/\\\]/g, "$$$$");

  return cleanText;
};

function buildMicroSystemPrompt(coin: CoinDetailData, securityStatus?: string): string {
  const name = coin.name ?? "this coin";
  const symbol = coin.symbol ?? "?";
  const price =
    coin.marketData.currentPriceUsd != null
      ? `$${coin.marketData.currentPriceUsd.toLocaleString("en-US", { maximumFractionDigits: 6 })}`
      : "currently unavailable";
  const change =
    coin.marketData.priceChangePercentage24h != null
      ? `${coin.marketData.priceChangePercentage24h >= 0 ? "+" : ""}${coin.marketData.priceChangePercentage24h.toFixed(2)}`
      : "currently unavailable";
  const mcap =
    coin.marketData.marketCapUsd != null
      ? `$${coin.marketData.marketCapUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : "currently unavailable";
  const rank = coin.marketCapRank ?? "currently unavailable";
  const volume =
    coin.marketData.totalVolumeUsd != null
      ? `$${coin.marketData.totalVolumeUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : "currently unavailable";

  // Tokenomics
  const circulating = coin.marketData.circulatingSupply 
    ? `${coin.marketData.circulatingSupply.toLocaleString()} ${symbol}` 
    : "currently unavailable";
  const total = coin.marketData.totalSupply 
    ? `${coin.marketData.totalSupply.toLocaleString()} ${symbol}` 
    : "currently unavailable";
  const max = coin.marketData.maxSupply 
    ? `${coin.marketData.maxSupply.toLocaleString()} ${symbol}` 
    : "currently unavailable";

  // History
  const ath = coin.marketData.athUsd ? `$${coin.marketData.athUsd}` : "currently unavailable";
  const atl = coin.marketData.atlUsd ? `$${coin.marketData.atlUsd}` : "currently unavailable";

  // 7-Day Trend
  let trend7d = "currently unavailable";
  if (coin.marketData.sparkline && coin.marketData.sparkline.length > 0) {
    const min = Math.min(...coin.marketData.sparkline);
    const max = Math.max(...coin.marketData.sparkline);
    trend7d = `Range: $${min.toLocaleString()} to $${max.toLocaleString()}`;
  }

  // Sanitized Description
  const about = coin.description 
    ? coin.description.replace(/<[^>]*>?/gm, "").substring(0, 500) + "..." 
    : "currently unavailable";

  return `You are Cown AI, the official data terminal assistant for CoinWeton. You are currently analyzing ${name} (${symbol}).

ASSET OVERVIEW:
- Name: ${name} (${symbol})
- Rank: #${rank}
- Price: ${price} (${change}% 24h)
- Market Cap: ${mcap}
- 24h Volume: ${volume}
- About: ${about}

TOKENOMICS & SUPPLY:
- Circulating Supply: ${circulating}
- Total Supply: ${total}
- Max Supply: ${max}

HISTORICAL DATA:
- All-Time High (ATH): ${ath}
- All-Time Low (ATL): ${atl}
- 7-Day Price Trend: ${trend7d}

SECURITY STATUS:
- GoPlus Audit: ${securityStatus ?? "Audit data currently unavailable"}

IDENTITY & BEHAVIORAL RULES:
1. IDENTITY: CoinWeton is ONLY a data terminal and market tracker. It is NOT an exchange. It has NO native token (No CWI token), NO staking features, and NO native trading capabilities. Never suggest users can buy or stake directly on CoinWeton.
2. MATH FORMATTING: ALWAYS use standard LaTeX for mathematical formulas. Use \`$$\` for block equations and \`$\` for inline equations. NEVER use \`\\[\` or \`\\]\`.
3. NO HALLUCINATION: If any data point is missing (null), explicitly state that the specific metric is "currently unavailable" instead of guessing or providing outdated info.
4. TABLES: Markdown tables MUST NOT contain newlines, \`<br>\`, or bullet points inside cells. Keep cells as single-line plain text.
5. FORMATTING RULE: If you generate a table, you MUST use standard GitHub Flavored Markdown. You MUST include a newline (\\n) after every single row. You MUST include the header separator (e.g., |---|---|). DO NOT collapse the table into a single line of text.
6. LANGUAGE RULE: You MUST reply in the exact same language the user uses. If the user asks in Indonesian, reply in Indonesian.
7. CURRENCY RULE: DO NOT use LaTeX math mode formatting for simple numbers or prices. If you use the $ symbol, you MUST escape it like \$ or avoid it entirely by writing 'USD'. Never wrap prices in $ or $$.`;
}

// ── Typewriter Markdown Component ───────────────────────────────
const TypewriterMarkdown = ({ 
  text, 
  isStopped, 
  intervalRef,
  onStart,
  onFinish 
}: { 
  text: string; 
  isStopped?: boolean; 
  intervalRef?: React.MutableRefObject<NodeJS.Timeout | null>;
  onStart?: () => void;
  onFinish?: () => void;
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const currentIndexRef = useRef(0);
  const lastTextRef = useRef("");

  // Keep callback refs updated without triggering re-renders
  const onStartRef = useRef(onStart);
  const onFinishRef = useRef(onFinish);
  
  useEffect(() => {
    onStartRef.current = onStart;
    onFinishRef.current = onFinish;
  }, [onStart, onFinish]);

  useEffect(() => {
    // Reset if the text changed
    if (text !== lastTextRef.current) {
      lastTextRef.current = text;
      currentIndexRef.current = 0;
      setDisplayedText("");
      setIsFinished(false);
    }

    if (isFinished) return;

    // Notify parent typing started (only once per text change)
    if (currentIndexRef.current === 0) {
      onStartRef.current?.();
    }

    if (isStopped) {
      setDisplayedText(text);
      setIsFinished(true);
      onFinishRef.current?.();
      if (intervalRef?.current) clearInterval(intervalRef.current);
      return;
    }

    const interval = setInterval(() => {
      const nextLength = currentIndexRef.current + 6;
      const newText = text.substring(0, nextLength);
      setDisplayedText(newText);
      currentIndexRef.current = nextLength;
      
      if (currentIndexRef.current >= text.length) {
        clearInterval(interval);
        setIsFinished(true);
        onFinishRef.current?.();
      }
    }, 15);
    
    if (intervalRef) intervalRef.current = interval;

    return () => clearInterval(interval);
  }, [text, isStopped, isFinished, intervalRef]);

  return (
    <div className="prose prose-invert max-w-none text-xs prose-p:leading-relaxed prose-pre:bg-slate-800/50 prose-tables:w-full prose-tables:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-th:bg-slate-800 prose-td:border prose-td:border-slate-700 prose-td:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          table: ({ node, ...props }) => (
            <div className="w-full overflow-x-auto my-4 pb-2">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
        }}
      >
        {sanitizeOutput(displayedText)}
      </ReactMarkdown>
    </div>
  );
};

// ── Component Props ───────────────────────────────────────────
interface CwtAiCardProps {
  coinName?: string;
  isLoggedIn?: boolean;
  coin?: CoinDetailData;
}

export default function CwtAiCard({
  coinName = "Bitcoin",
  isLoggedIn = false,
  coin,
}: CwtAiCardProps) {
  const [displayHistory, setDisplayHistory] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinkingLong, setIsThinkingLong] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const apiMessages = useRef<ChatMessage[]>([]);
  const [securityStatus, setSecurityStatus] = useState<string>("Audit data currently unavailable");

  useEffect(() => {
    if (!coin) return;

    const fetchSecurity = async () => {
      try {
        const platforms = coin.platforms;
        if (!platforms || Object.keys(platforms).length === 0) {
          setSecurityStatus("Safe Contract (Native Layer-1 Asset)");
          return;
        }

        // Try to find a supported contract address (prioritize Ethereum)
        const chainMap: Record<string, string> = {
          ethereum: "1",
          "binance-smart-chain": "56",
          base: "8453",
          "polygon-pos": "137",
        };

        let targetChainId = "";
        let targetAddress = "";

        for (const [chain, id] of Object.entries(chainMap)) {
          if (platforms[chain]) {
            targetChainId = id;
            targetAddress = platforms[chain];
            break;
          }
        }

        if (!targetChainId) {
          setSecurityStatus("Security data currently unavailable for this chain");
          return;
        }

        const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${targetChainId}?contract_addresses=${targetAddress.toLowerCase()}`);
        const json = await res.json();
        const result = json?.result?.[targetAddress.toLowerCase()];

        if (!result) {
          setSecurityStatus("Audit data currently unavailable");
          return;
        }

        const isHoneypot = result.is_honeypot === "1" ? "Honeypot Detected" : "No Honeypot";
        const isOpenSource = result.is_open_source === "1" ? "Verified Source Code" : "Unverified Source Code";
        const isSafe = result.is_honeypot === "0" ? "Safe Contract" : "Risky Contract";

        setSecurityStatus(`${isSafe}, ${isOpenSource}, ${isHoneypot}`);
      } catch (error) {
        console.error("Security fetch error:", error);
      }
    };

    fetchSecurity();
  }, [coin]);

  const handleAsk = async (question: string) => {
    if (isLoading) return;

    if (!isLoggedIn) {
      toast.error("Oops! Log in first to use this feature. 🔒");
      return;
    }

    const userDisplay: DisplayMessage = { sender: "user", text: question };
    setDisplayHistory((prev) => [...prev, userDisplay]);
    setInputValue("");
    setIsLoading(true);
    setIsGenerating(true);
    setIsThinkingLong(false);
    setIsTypingStopped(false);
    
    abortControllerRef.current = new AbortController();

    const thinkingTimeout = setTimeout(() => {
      setIsThinkingLong(true);
    }, 15000);

    // Build system prompt with coin-specific data if available
    const systemContent = coin
      ? buildMicroSystemPrompt(coin, securityStatus)
      : `You are Cown AI, an expert crypto analyst for the CoinWeton platform. The user is asking about ${coinName}. Be concise and professional.`;

    const userMsg: ChatMessage = { role: "user", content: question };

    // Rebuild messages with fresh system prompt each time
    apiMessages.current = [
      { role: "system", content: systemContent },
      ...apiMessages.current.filter((m) => m.role !== "system"),
      userMsg,
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages.current }),
        signal: abortControllerRef.current?.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Unknown error from AI service.");
      }

      const aiText: string = data.text ?? "I couldn't generate a response.";

      apiMessages.current = [
        ...apiMessages.current,
        { role: "assistant", content: aiText },
      ];

      setDisplayHistory((prev) => [...prev, { sender: "ai", text: aiText }]);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setDisplayHistory((prev) => [
          ...prev,
          { sender: "ai", text: `⚠️ [Generation Stopped by User]` },
        ]);
      } else {
        const errorText =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setDisplayHistory((prev) => [
          ...prev,
          { sender: "ai", text: `⚠️ ${errorText}` },
        ]);
      }
    } finally {
      clearTimeout(thinkingTimeout);
      setIsLoading(false);
      setIsGenerating(false);
      setIsThinkingLong(false);
      abortControllerRef.current = null;
    }
  };

  const handleCustomSend = () => {
    if (!inputValue.trim() || isLoading) return;
    handleAsk(inputValue.trim());
  };

  const stopGeneration = () => {
    // Phase 1: Abort API if still fetching
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setIsLoading(false);
    
    // Phase 2: Halt the typewriter and instantly reveal the text
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setIsTyping(false);
    setIsTypingStopped(true);
  };

  return (
    <div className="relative">
      {/* Blur overlay for guests */}
      {!isLoggedIn && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-[#0D1117]/70 backdrop-blur-md border border-[#1E293B]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 border border-[#1E293B] mb-4">
            <Lock className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-white mb-1">AI Analysis Locked</p>
          <p className="text-sm text-slate-400 mb-4">Login to unlock Cown AI insights</p>
          <button
            onClick={() => toast.error("Oops! Log in first to use this feature. 🔒")}
            className="px-5 py-2 bg-[#00E5FF] text-slate-900 font-bold text-sm rounded-lg border-b-[3px] border-[#0099cc] active:border-b-0 active:translate-y-1 hover:bg-cyan-300 transition-all"
          >
            Login for AI Access
          </button>
        </div>
      )}

      <div className={`py-2 ${!isLoggedIn ? "min-h-[280px]" : ""}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20">
              <img src="/icon.svg" alt="Cown AI Icon" className="h-6 w-6" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-cyan-500 border-[2.5px] border-[#121825] animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-[22px] font-black tracking-tight text-white">
              Cown AI
            </h3>
            <Popover>
              <PopoverTrigger asChild>
                <button className="focus:outline-none flex items-center justify-center">
                  <Info className="w-4 h-4 shrink-0 text-slate-500 hover:text-slate-300 transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" className="max-w-[280px] sm:max-w-xs bg-[#1E293B] text-[#E2E8F0] border-slate-700 p-3 z-50">
                <p className="text-xs leading-relaxed text-left">
                  Cown AI is your shortcut to conquering the crypto market, turning hours of in-depth research into sharp insights in just one click. Powered by high-speed AI language models, Cown AI acts as your personal analyst. Ready to dissect market trends, explain coin fundamentals, and evaluate security metrics in real-time.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Suggestion pills — hide once chat has started */}
        {displayHistory.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#0D1117] px-3 py-2 text-xs font-medium text-slate-400 transition-all cursor-pointer hover:border-cyan-500/30 hover:text-cyan-300 hover:bg-cyan-500/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-3 w-3" />
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat history */}
        {displayHistory.length > 0 && (
          <div className="flex flex-col gap-3 mb-4 max-h-[400px] overflow-y-auto pr-1 [\&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {displayHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mr-2 mt-0.5">
                    <img src="/icon.svg" alt="Cown AI" className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[90%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-white"
                      : "bg-[#0D1117] border border-[#1E293B] text-slate-300"
                  }`}
                >
                  {msg.sender === "ai" ? (
                    <TypewriterMarkdown 
                      text={msg.text} 
                      isStopped={isTypingStopped} 
                      intervalRef={typingIntervalRef}
                      onStart={idx === displayHistory.length - 1 ? () => setIsTyping(true) : undefined}
                      onFinish={idx === displayHistory.length - 1 ? () => setIsTyping(false) : undefined}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mr-2 mt-0.5">
                  <img src="/icon.svg" alt="Cown AI" className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-xl bg-[#0D1117] border border-[#1E293B] px-3 py-2.5 text-xs text-slate-300 flex items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  {isThinkingLong && (
                    <span className="text-slate-400 text-[10px] animate-pulse">Analyzing market data...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom input */}
        <div className="flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#0D1117] px-3 py-2 focus-within:border-cyan-500/40 transition-colors">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSend()}
            placeholder={`Ask about ${coinName}...`}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none disabled:opacity-60"
          />
          {isGenerating || isTyping ? (
            <button
              onClick={stopGeneration}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            </button>
          ) : (
            <button
              onClick={handleCustomSend}
              disabled={!inputValue.trim() || isLoading}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
