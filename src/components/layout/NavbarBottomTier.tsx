"use client";

import { useState } from "react";
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
  const pathname = usePathname();
  const router = useRouter();

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
      <div className="w-full border-b border-border/50 bg-background/60 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between px-2 md:px-4 py-3">
          <div className="flex items-center gap-3 md:gap-8">
            {/* Hamburger Menu Button (mobile only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 text-slate-300 hover:text-white transition-colors"
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

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-4 pb-4 pt-2 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => { handleScrollTo("market"); setMobileMenuOpen(false); }}
                className={`text-left text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Market
              </button>
              <Link
                href="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === "/news"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                News
              </Link>
              <Link
                href="/cown-ai"
                onClick={() => setMobileMenuOpen(false)}
                className={`relative text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === "/cown-ai"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Cown AI
                <span className="absolute top-2 ml-1 h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
              </Link>
              <Link
                href="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === "/watchlist"
                    ? "text-[#00E5FF] bg-[#00E5FF]/10"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                Watchlist
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Shared Login/Signup Modal */}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
