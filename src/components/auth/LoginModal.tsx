"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-slate-700/50 bg-slate-900">
        <DialogHeader className="items-center text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-1 mb-2">
            <img src="/icon.svg" alt="CoinWeton" className="h-10 w-auto relative z-10" />
            <img src="/text5.svg" alt="CoinWeton" className="h-7 w-auto block translate-y-[3px]" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Welcome to CoinWeton
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Sign in to track your favorite coins and access personalized insights.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          {/* Continue with Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-600/50 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100 active:scale-[0.98]"
          >
            {/* Google Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900 px-3 text-slate-500">
                Secure authentication powered by Google
              </span>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            By continuing, you agree to CoinWeton&apos;s{" "}
            <Link href="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
