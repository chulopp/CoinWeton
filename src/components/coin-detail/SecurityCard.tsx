"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ── Chain ID mapping for GoPlus API ──────────────────────────
const CHAIN_ID_MAP: Record<string, string> = {
  ethereum: "1",
  "binance-smart-chain": "56",
  "polygon-pos": "137",
  "arbitrum-one": "42161",
  "optimistic-ethereum": "10",
  avalanche: "43114",
  fantom: "250",
  cronos: "25",
  base: "8453",
};

// ── GoPlus response shape ────────────────────────────────────
interface GoPlusTokenSecurity {
  is_open_source?: string;
  is_proxy?: string;
  is_mintable?: string;
  is_honeypot?: string;
  can_take_back_ownership?: string;
}

interface SecurityCheckResult {
  label: string;
  safeLabel: string;
  riskyLabel: string;
  isSafe: boolean;
}

interface SecurityCardProps {
  coin: any;
}

function resolveContractInfo(
  platforms: Record<string, string> | null
): { chainId: string; address: string } | null {
  if (!platforms) return null;

  // Prioritise Ethereum, then iterate through known chains
  const priorityOrder = [
    "ethereum",
    "binance-smart-chain",
    "polygon-pos",
    "arbitrum-one",
    "optimistic-ethereum",
    "avalanche",
    "base",
    "fantom",
    "cronos",
  ];

  for (const chain of priorityOrder) {
    const addr = platforms[chain];
    if (addr && addr.trim().length > 0) {
      const chainId = CHAIN_ID_MAP[chain];
      if (chainId) return { chainId, address: addr.trim().toLowerCase() };
    }
  }

  // Fallback: try any platform with a known chain ID
  for (const [chain, addr] of Object.entries(platforms)) {
    if (addr && addr.trim().length > 0 && CHAIN_ID_MAP[chain]) {
      return {
        chainId: CHAIN_ID_MAP[chain],
        address: addr.trim().toLowerCase(),
      };
    }
  }

  return null;
}

function mapSecurityResults(
  data: GoPlusTokenSecurity
): SecurityCheckResult[] {
  return [
    {
      label: "source_code",
      safeLabel: "Verified Source Code",
      riskyLabel: "Unverified Source Code",
      isSafe: data.is_open_source === "1",
    },
    {
      label: "proxy",
      safeLabel: "No Proxy Contract",
      riskyLabel: "Proxy Contract Detected",
      isSafe: data.is_proxy === "0",
    },
    {
      label: "mint",
      safeLabel: "No Mint Function",
      riskyLabel: "Mint Function Detected",
      isSafe: data.is_mintable === "0",
    },
    {
      label: "honeypot",
      safeLabel: "No Honeypot Detected",
      riskyLabel: "Honeypot Detected",
      isSafe: data.is_honeypot === "0",
    },
    {
      label: "ownership",
      safeLabel: "Renounced Ownership",
      riskyLabel: "Active Ownership",
      isSafe: data.can_take_back_ownership === "0",
    },
  ];
}

export default function SecurityCard({ coin }: SecurityCardProps) {
  const [checks, setChecks] = useState<SecurityCheckResult[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [noContract, setNoContract] = useState(false);
  const [isLayer1, setIsLayer1] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const platforms = coin?.platforms;

  useEffect(() => {
    // 1. Identify True Layer-1
    const isTrueLayer1 =
      !platforms ||
      Object.keys(platforms).length === 0 ||
      (Object.keys(platforms).length === 1 && Object.keys(platforms)[0] === "");

    if (isTrueLayer1) {
      setIsLayer1(true);
      setLoading(false);
      return;
    }

    // 2. Identify Supported Token
    // Attempt to get Ethereum address specifically first
    const ethAddress =
      platforms?.ethereum ||
      coin?.detail_platforms?.ethereum?.contract_address;

    let contractInfo = null;
    if (ethAddress) {
      contractInfo = { chainId: "1", address: ethAddress.toLowerCase() };
    } else {
      contractInfo = resolveContractInfo(platforms);
    }

    if (!contractInfo) {
      // 3. Unsupported Token (has platforms but none supported)
      setUnsupported(true);
      setLoading(false);
      return;
    }

    const { chainId, address } = contractInfo;
    setLoading(true);
    setNoContract(false);
    setUnsupported(false);
    setIsLayer1(false);

    fetch(
      `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${address}`
    )
      .then((res) => res.json())
      .then((json) => {
        const result = json?.result;
        if (!result) {
          setUnsupported(true);
          return;
        }

        // GoPlus returns results keyed by lowercase address
        const tokenData: GoPlusTokenSecurity | undefined =
          result[address.toLowerCase()] ?? result[Object.keys(result)[0]];

        if (!tokenData) {
          setUnsupported(true);
          return;
        }

        setChecks(mapSecurityResults(tokenData));
      })
      .catch((err) => {
        console.error("GoPlus fetch error:", err);
        setUnsupported(true);
      })
      .finally(() => setLoading(false));
  }, [platforms, coin?.detail_platforms]);

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="border-b border-border/50">
        <div className="px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-500/10 border border-slate-500/20">
              <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white">Contract Security</h3>
              <p className="text-[10px] text-slate-500">Loading...</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 rounded bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Layer-1 Fallback UI ──────────────────────────────────
  if (isLayer1) {
    const layer1Checks = [
      "Native Blockchain Asset",
      "Secured by Network Consensus",
      "No Smart Contract Risks",
      "No Proxy Vulnerabilities",
    ];

    return (
      <div className="border-b border-border/50">
        <div className="px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-green-500/10 border border-green-500/20">
              <ShieldCheck className="h-4 w-4 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white">Native Asset - Secure</h3>
              <p className="text-[10px] font-semibold text-green-400">Native Asset</p>
            </div>
          </div>
          <div className="flex flex-col">
            {layer1Checks.map((label) => (
              <div
                key={label}
                className="flex items-center gap-2 py-2 border-b border-border/30 last:border-b-0"
              >
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-[12px] font-medium flex-1 text-slate-300">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Unsupported Token / No Data ──────────────────────────
  if (unsupported || (!loading && !checks)) {
    return (
      <div className="border-b border-border/50">
        <div className="px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-500/10 border border-slate-500/20">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white">Contract Security</h3>
              <p className="text-[10px] text-slate-500">Powered by GoPlus</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            No contract security data available for this asset on supported networks.
          </p>
        </div>
      </div>
    );
  }

  // ── Compute overall status ────────────────────────────────
  const criticalFlags = checks?.filter(
    (c) =>
      !c.isSafe &&
      (c.label === "honeypot" || c.label === "source_code")
  ) ?? [];
  const isOverallSafe = criticalFlags.length === 0;

  return (
    <div className="border-b border-border/50">
      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-md border ${
              isOverallSafe
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            {isOverallSafe ? (
              <ShieldCheck className="h-4 w-4 text-green-400" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-white">Contract Security</h3>
            <p
              className={`text-[10px] font-semibold ${
                isOverallSafe ? "text-green-400" : "text-red-400"
              }`}
            >
              {isOverallSafe ? "Safe Contract" : "Risky Contract"}
            </p>
          </div>
        </div>

        {/* Check Items */}
        <div className="flex flex-col">
          {checks?.map((check) => (
            <div
              key={check.label}
              className="flex items-center gap-2 py-2 border-b border-border/30 last:border-b-0"
            >
              {check.isSafe ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              )}
              <span
                className={`text-[12px] font-medium flex-1 ${
                  check.isSafe ? "text-slate-300" : "text-red-300"
                }`}
              >
                {check.isSafe ? check.safeLabel : check.riskyLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
