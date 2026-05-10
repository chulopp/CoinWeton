"use client";

import React from "react";
import { Star, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface WatchlistHoverCardProps {
  coinName: string;
  coinId: string;
  className?: string;
}

export default function WatchlistHoverCard({ coinName, coinId, className }: WatchlistHoverCardProps) {
  const router = useRouter();

  const watchlists = [
    { id: "my", name: "My Watchlist" },
    { id: "josjis", name: "josjis" },
  ];

  const handleAddToWatchlist = (e: React.MouseEvent, watchlistId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`Adding ${coinName} to watchlist ${watchlistId}`);
    // Here we would normally call an API or update state
    // For now, we just simulate the UI
  };

  const handleAddNewWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push("/watchlist?action=new");
  };

  return (
    <div 
      className={cn(
        "z-50 w-64 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-0 overflow-hidden text-left",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Watchlist</h3>
      </div>

      {/* Watchlist Items */}
      <div className="py-1">
        {watchlists.map((wl) => (
          <button
            key={wl.id}
            onClick={(e) => handleAddToWatchlist(e, wl.id)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">{wl.name}</span>
            </div>
            <Plus className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      {/* Footer / Add New */}
      <div className="border-t border-border/40 mt-1 pb-1">
        <button
          onClick={handleAddNewWatchlist}
          className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/[0.03] transition-colors group"
        >
          <div className="flex items-center justify-center">
            <Star className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          </div>
          <span className="text-sm font-medium text-muted-foreground/70 group-hover:text-foreground/90 transition-colors">Add to New Watchlist</span>
        </button>
      </div>
    </div>
  );
}
