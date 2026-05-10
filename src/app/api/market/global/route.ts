import { NextResponse } from "next/server";
import { getGlobalData } from "@/lib/market-data";

export async function GET() {
  try {
    const apiKey =
      process.env.COINGECKO_DEMO_API_KEY ??
      process.env.COINGECKO_API_KEY ??
      process.env.NEXT_PUBLIC_COINGECKO_API_KEY ??
      "";

    console.log("[Global API] Fetching data... API Key present:", !!apiKey);

    const globalData = await getGlobalData();

    console.log("[Global API] Successfully fetched global data.");

    return NextResponse.json({ globalData });
  } catch (error) {
    console.error("[Global API] Critical Execution Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Global Route" },
      { status: 500 }
    );
  }
}
