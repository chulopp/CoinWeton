"use client";

import { useState, useRef, useEffect } from "react";
import { Send, TrendingUp, Briefcase, Flame, BarChart3, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import type { CoinMarketRow, GlobalMarketData, FearAndGreedData, HighlightCoin } from "@/lib/market-data";
import type { NewsArticle } from "@/lib/news-data";

// ── Types ─────────────────────────────────────────────────────
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DisplayMessage {
  sender: "user" | "ai";
  text: string;
}

// ── Suggestion Chips Data ─────────────────────────────────────
const suggestions = [
  { icon: BarChart3, label: "Market Update", prompt: "Give me a quick market update" },
  { icon: TrendingUp, label: "Top Gainers", prompt: "What are the top gainers today?" },
  { icon: Briefcase, label: "Portfolio Tips", prompt: "Give me portfolio diversification tips for crypto" },
  { icon: Flame, label: "Trending Tokens", prompt: "Which tokens are trending right now?" },
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

function buildMacroSystemPrompt(
  marketData?: CoinMarketRow[],
  globalData?: GlobalMarketData,
  fearAndGreed?: FearAndGreedData,
  trendingCoins?: HighlightCoin[],
  newsData?: NewsArticle[]
): string {
  const mcap = globalData?.totalMarketCapUsd
    ? `$${(globalData.totalMarketCapUsd / 1e12).toFixed(2)}T`
    : "currently unavailable";
  const vol24h = globalData?.totalVolumeUsd
    ? `$${(globalData.totalVolumeUsd / 1e9).toFixed(2)}B`
    : "currently unavailable";
  const btcDom = globalData?.btcDominance
    ? `${globalData.btcDominance.toFixed(1)}%`
    : "currently unavailable";
  const ethDom = globalData?.ethDominance
    ? `${globalData.ethDominance.toFixed(1)}%`
    : "currently unavailable";
  const change = globalData?.marketCapChangePercentage24h
    ? `${globalData.marketCapChangePercentage24h >= 0 ? "+" : ""}${globalData.marketCapChangePercentage24h.toFixed(2)}`
    : "currently unavailable";
  const fgValue = fearAndGreed?.value !== null ? `${fearAndGreed?.value} (${fearAndGreed?.label})` : "currently unavailable";

  let top5Str = "currently unavailable";
  let topGainersStr = "currently unavailable";
  if (marketData && marketData.length > 0) {
    const top5 = marketData.slice(0, 5);
    top5Str = top5.map(c => `${c.name} ($${c.price})`).join(", ");
    
    const sortedByGain = [...marketData].sort((a, b) => (b.change24h || 0) - (a.change24h || 0));
    topGainersStr = sortedByGain.slice(0, 5).map(c => `${c.name} (+${c.change24h?.toFixed(2)}%)`).join(", ");
  }

  const trendingStr = trendingCoins && trendingCoins.length > 0
    ? trendingCoins.map(c => c.name).join(", ")
    : "currently unavailable";

  const newsStr = newsData && newsData.length > 0
    ? newsData.slice(0, 5).map(n => `- ${n.title}`).join("\n")
    : "currently unavailable";

  return `You are Cown AI, the official data terminal assistant for CoinWeton. Your goal is to provide deep, data-driven market insights. Be concise, professional, and objective.

MARKET OVERVIEW:
- Total Market Cap: ${mcap} (${change}% 24h)
- 24h Volume: ${vol24h}
- BTC Dominance: ${btcDom}
- ETH Dominance: ${ethDom}
- Market Sentiment (Fear & Greed): ${fgValue}

TOP ASSETS & TRENDS:
- Top 5 by Cap: ${top5Str}
- Top 5 Gainers (24h): ${topGainersStr}
- Trending Now: ${trendingStr}

LATEST HEADLINES:
${newsStr}

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
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800/50 prose-tables:w-full prose-tables:border-collapse prose-th:border prose-th:border-slate-700 prose-th:p-2 prose-th:bg-slate-800 prose-td:border prose-td:border-slate-700 prose-td:p-2 text-[13px] sm:text-sm">
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

export default function CownAiClient({ 
  marketData, 
  globalData, 
  fearAndGreed, 
  trendingCoins,
  newsData
}: { 
  marketData?: CoinMarketRow[];
  globalData?: GlobalMarketData;
  fearAndGreed?: FearAndGreedData;
  trendingCoins?: HighlightCoin[];
  newsData?: NewsArticle[];
}) {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isThinkingLong, setIsThinkingLong] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingStopped, setIsTypingStopped] = useState(false);
  const [displayHistory, setDisplayHistory] = useState<DisplayMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Internal API messages array (includes hidden system prompt)
  const apiMessages = useRef<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayHistory, isLoading]);

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    // 1. Build system prompt (regenerated each time so data is fresh)
    const systemPrompt = buildMacroSystemPrompt(marketData, globalData, fearAndGreed, trendingCoins, newsData);

    // 2. Append user display message
    const userDisplay: DisplayMessage = { sender: "user", text: promptText };
    setDisplayHistory((prev) => [...prev, userDisplay]);
    setInputMessage("");
    setIsLoading(true);
    setIsGenerating(true);
    setIsThinkingLong(false);
    setIsTypingStopped(false);
    
    abortControllerRef.current = new AbortController();
    
    const thinkingTimeout = setTimeout(() => {
      setIsThinkingLong(true);
    }, 15000);

    // 3. Build the API messages array
    // Always use the latest system prompt as the first message
    const userMsg: ChatMessage = { role: "user", content: promptText };
    apiMessages.current = [
      { role: "system", content: systemPrompt },
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
        // ── Special handling for 429 Rate Limit ──
        if (res.status === 429) {
          const rateLimitMsg =
            data.error ??
            "⏳ Saat ini server AI sedang penuh (Rate Limit). Mohon tunggu beberapa saat dan coba lagi.";
          setDisplayHistory((prev) => [
            ...prev,
            {
              sender: "ai",
              text: `⏳ ${rateLimitMsg}\n\n_Silakan coba lagi dalam beberapa detik._`,
            },
          ]);
          return; // exit early — don't throw, don't crash
        }

        throw new Error(data.error ?? "Unknown error from AI service.");
      }

      const aiText: string = data.text ?? "I couldn't generate a response.";

      // 4. Append AI message to internal state and display
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

  const handleSend = () => sendMessage(inputMessage.trim());

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

  const markdownComponents = {
    strong: ({ ...props }: React.ComponentProps<"strong">) => <strong className="font-bold text-white tracking-wide" {...props} />,
    p: ({ ...props }: React.ComponentProps<"p">) => <p className="mb-3 last:mb-0 whitespace-pre-line" {...props} />,
    ul: ({ ...props }: React.ComponentProps<"ul">) => <ul className="pl-4 mb-3 list-disc space-y-1" {...props} />,
    li: ({ ...props }: React.ComponentProps<"li">) => <li className="" {...props} />,
  };

  const hasChatStarted = displayHistory.length > 0;

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] w-full max-w-5xl mx-auto bg-transparent relative">
      {/* ─── Ambient Glowing Orbs (Background) ─── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-purple-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute w-[350px] h-[350px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse translate-x-20 -translate-y-10"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute w-[200px] h-[200px] rounded-full border border-slate-700/30" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-slate-700/15" />
      </div>

      {/* ─── Scrollable Chat Area ─── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar relative z-10">
        {/* Default State: Hero Content + News */}
        {!hasChatStarted && (
          <div className="flex flex-col items-center justify-center min-h-full px-4 pt-8">
            {/* AI Icon / Logo */}
            <div className="relative mb-3">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-cyan-500/5">
                <img src="/icon.svg" alt="COWN AI" className="h-16 w-16 relative z-10" />
              </div>
              <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#00E5FF] animate-pulse shadow-lg shadow-cyan-500/50" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Hi, I&apos;m Cown AI.
            </h1>
            <p className="text-slate-400 text-center text-sm mb-12 max-w-md leading-relaxed">
              Your intelligent crypto companion. Powered by real-time market data.
            </p>

            {/* ─── Suggestion Chips ─── */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-16">
              {suggestions.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => sendMessage(chip.prompt)}
                  disabled={isLoading}
                  className="group flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#121825]/80 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-300 transition-all hover:border-cyan-500/40 hover:bg-[#1E293B] hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <chip.icon className="h-5 w-5 text-slate-500 group-hover:text-[#00E5FF] transition-colors" />
                  {chip.label}
                </button>
              ))}
            </div>


          </div>
        )}

        {/* ─── Chat Messages Area ─── */}
        {hasChatStarted && (
          <>
            {displayHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mr-3">
                    <img src="/icon.svg" alt="COWN AI" className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-[13px] sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-white rounded-br-sm"
                      : "bg-[#121825]/80 backdrop-blur-md border border-[#1E293B] text-slate-300 rounded-bl-sm shadow-xl"
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

            {/* Loading / Thinking indicator */}
            {isLoading && (
              <div className="flex w-full justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 mr-3">
                  <img src="/icon.svg" alt="COWN AI" className="h-4 w-4" />
                </div>
                <div className="max-w-[85%] rounded-2xl bg-[#121825]/80 backdrop-blur-md border border-[#1E293B] px-5 py-4 text-[13px] sm:text-sm leading-relaxed text-slate-300 rounded-bl-sm shadow-xl flex items-center gap-3">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  {isThinkingLong && (
                    <span className="text-slate-400 text-xs animate-pulse">Analyzing market data...</span>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ─── Fixed Bottom Chat Input Bar ─── */}
      <div className="shrink-0 w-full px-4 pb-6 md:pb-8 pt-2 bg-transparent relative z-10">
        <div className="mx-auto w-full max-w-3xl">
          {/* Input Container */}
          <div className="relative flex items-center w-full bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl p-2 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
            {/* Textarea */}
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about crypto..."
              rows={1}
              disabled={isLoading}
              className="flex-1 w-full resize-none bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-60"
            />

            <div className="flex items-center shrink-0 pr-1">
              {/* Send / Stop Button */}
              {(isGenerating || isTyping) ? (
                <button
                  onClick={stopGeneration}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-all bg-slate-800 hover:bg-slate-700 shadow-lg shadow-black/20 border border-slate-600"
                  title="Stop generation"
                >
                  <Square className="h-4 w-4 fill-red-500 text-red-500" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    inputMessage.trim() && !isLoading
                      ? "bg-[#00E5FF] text-slate-900 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600/50"
                  }`}
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mt-2 text-center text-[11px] text-slate-600">
            Cown AI can make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
