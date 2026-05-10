import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // Browser can use relative URLs
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel deployment
  return `http://localhost:${process.env.PORT || 3000}`; // Local development
};
