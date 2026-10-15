"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Star, LogIn, UserPlus, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoginModal from "@/components/auth/LoginModal";
import SearchModal from "./SearchModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession, signOut } from "next-auth/react";

export default function NavbarBottomTier() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navBottom, setNavBottom] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateNavBottom = () => {
      if (navRef.current) {
        setNavBottom(navRef.current.getBoundingClientRect().bottom);
      }
    };
    updateNavBottom();
    window.addEventListener("resize", updateNavBottom);
    window.addEventListener("scroll", updateNavBottom);
    return () => {
      window.removeEventListener("resize", updateNavBottom);
      window.removeEventListener("scroll", updateNavBottom);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && navRef.current) {
      setNavBottom(navRef.current.getBoundingClientRect().bottom);
    }
  }, [mobileMenuOpen]);

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
    setLogoutConfirmOpen(false);
    await signOut({ callbackUrl: "/" });
    toast.success("Successfully logged out");
  };

  return (
    <>
      <div ref={navRef} className="w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between px-2 md:px-4 py-3">
          <div className="flex items-center gap-3 md:gap-8">
            {/* Hamburger / Close Menu Button (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 text-slate-300 hover:text-white transition-colors"
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                  onClick={() => setLogoutConfirmOpen(true)}
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

      {/* Full-screen Mobile Menu Overlay via Portal starting directly below navbar */}
      {mounted && mobileMenuOpen && createPortal(
        <div
          style={{ top: navBottom > 0 ? `${navBottom}px` : "57px" }}
          className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#111827] text-foreground flex flex-col justify-start px-5 py-6 overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
        >
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => {
                handleScrollTo("market");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between text-left text-base font-semibold px-4 py-3.5 rounded-xl transition-all ${
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
              className={`flex items-center justify-between text-base font-semibold px-4 py-3.5 rounded-xl transition-all ${
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
              className={`flex items-center justify-between text-base font-semibold px-4 py-3.5 rounded-xl transition-all ${
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
              className={`flex items-center justify-between text-base font-semibold px-4 py-3.5 rounded-xl transition-all ${
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
        </div>,
        document.body
      )}

      {/* Shared Login/Signup Modal */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] border-slate-700/60 bg-slate-900 p-6">
          <DialogHeader className="items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-2">
              <LogIn className="h-6 w-6 rotate-180" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Log Out Confirmation
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Are you sure you want to log out of your CoinWeton account?
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(false)}
              className="flex-1 h-10 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 hover:text-white transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all text-sm"
            >
              Log Out
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
