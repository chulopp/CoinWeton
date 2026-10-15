"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Star, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoginModal from "@/components/auth/LoginModal";
import SearchModal from "./SearchModal";
import { useSession, signOut } from "next-auth/react";

export default function NavbarBottomTier() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [mobileMenuOpen]);

  const handleScrollTo = (id: string) => {
    if (pathname !== "/") {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Successfully logged out");
  };

  return (
    <>
      <div className="w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between px-2 md:px-4 py-3">
          <div className="flex items-center gap-3 md:gap-8">
            {/* Hamburger Menu Button (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center h-9 w-9 text-slate-300 hover:text-white transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 w-auto">
              <img
                src="/icon.svg"
                alt="CoinWeton Icon"
                className="h-10 w-auto relative z-10"
              />
              <img
                src="/text5.svg"
                alt="CoinWeton Text"
                className="h-9 w-auto hidden sm:block translate-y-[5px]"
              />
            </Link>

            {/* Main Navigation (desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => handleScrollTo("market")}
                className={`text-sm font-semibold transition-colors cursor-pointer ${
                  pathname === "/"
                    ? "text-[#00E5FF]"
                    : "text-slate-300 hover:text-[#00E5FF]"
                }`}
              >
                Market
              </button>
              <Link
                href="/news"
                className={`text-sm font-semibold transition-colors ${
                  pathname === "/news"
                    ? "text-[#00E5FF]"
                    : "text-slate-300 hover:text-[#00E5FF]"
                }`}
              >
                News
              </Link>
              <Link
                href="/cown-ai"
                className={`relative text-sm font-semibold transition-colors ${
                  pathname === "/cown-ai"
                    ? "text-[#00E5FF]"
                    : "text-slate-300 hover:text-[#00E5FF]"
                }`}
              >
                Cown AI
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
              </Link>
            </nav>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Watchlist */}
            <Link href="/watchlist" className="flex items-center gap-2 cursor-pointer group">
              <div className="flex items-center justify-center h-9 w-5">
                <Star className="h-5 w-5 transition-all group-hover:scale-110 text-yellow-400 fill-yellow-400" />
              </div>
              <span className={`hidden sm:inline text-sm font-semibold transition-colors ${
                pathname === "/watchlist"
                  ? "text-[#00E5FF]"
                  : "text-white group-hover:text-[#00E5FF]"
              }`}>
                Watchlist
              </span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Bar */}
              <SearchModal open={searchOpen} onOpenChange={setSearchOpen}>
                <button 
                  className="relative hidden sm:block outline-none"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search coins..."
                    className="h-9 w-48 rounded-lg border-border bg-card/80 pl-9 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-primary/20 lg:w-64 cursor-pointer"
                    readOnly
                  />
                </button>
              </SearchModal>

              {/* Mobile Search Button */}
              <SearchModal open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
                  onClick={() => setMobileSearchOpen(true)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </SearchModal>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="h-9 bg-slate-700 text-white font-bold px-2 sm:px-4 rounded-lg border-b-[3px] border-slate-800 active:border-b-0 active:translate-y-1 hover:bg-slate-600 transition-all flex items-center gap-2 text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              ) : (
                <>
                  {/* Login */}
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="h-9 bg-[#00E5FF] text-slate-900 font-bold px-2 sm:px-4 rounded-lg border-b-[3px] border-[#0099cc] active:border-b-0 active:translate-y-1 hover:bg-cyan-300 transition-all flex items-center gap-2 text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Login</span>
                  </button>

                  {/* Sign Up */}
                  <button
                    onClick={() => setLoginOpen(true)}
                    className="h-9 bg-slate-700 text-white font-bold px-2 sm:px-4 rounded-lg border-b-[3px] border-slate-800 active:border-b-0 active:translate-y-1 hover:bg-slate-600 transition-all flex items-center gap-2 text-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Up</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen Mobile Menu Overlay via Portal */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[100] bg-[#111827] text-foreground flex flex-col justify-between p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="flex flex-col gap-5">
            {/* Top Bar with Logo & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-1.5"
              >
                <img
                  src="/icon.svg"
                  alt="CoinWeton Icon"
                  className="h-9 w-auto"
                />
                <img
                  src="/text5.svg"
                  alt="CoinWeton Text"
                  className="h-8 w-auto translate-y-[3px]"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Quick Search Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileSearchOpen(true);
              }}
              className="relative flex w-full items-center h-11 px-3.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all text-left group"
            >
              <Search className="h-4 w-4 mr-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span>Search coins...</span>
            </button>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  handleScrollTo("market");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between text-left text-base font-semibold px-4 py-3 rounded-xl transition-all ${
                  pathname === "/"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>Market</span>
              </button>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between text-base font-semibold px-4 py-3 rounded-xl transition-all ${
                  pathname === "/news"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>News</span>
              </Link>
              <Link
                href="/cown-ai"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between text-base font-semibold px-4 py-3 rounded-xl transition-all ${
                  pathname === "/cown-ai"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Cown AI</span>
                  <span className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.7)]" />
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-[#00E5FF]">
                  AI Bot
                </span>
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between text-base font-semibold px-4 py-3 rounded-xl transition-all ${
                  pathname === "/watchlist"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>Watchlist</span>
                </div>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </Link>
            </nav>
          </div>

          {/* Bottom Auth Section */}
          <div className="pt-6 mt-6 border-t border-border/50">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2 py-1">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-10 w-10 rounded-full border border-border"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-[#00E5FF] border border-border">
                      {user.name?.[0] || user.email?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-white truncate">
                      {user.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user.email || ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <LogIn className="h-4 w-4 rotate-180 text-rose-400" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginOpen(true);
                  }}
                  className="w-full h-11 bg-[#00E5FF] hover:bg-cyan-300 text-slate-900 font-bold rounded-xl border-b-[3px] border-[#0099cc] active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginOpen(true);
                  }}
                  className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Shared Login/Signup Modal */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
