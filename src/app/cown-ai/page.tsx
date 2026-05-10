import { getSession } from "@/app/actions";
import { redirect } from "next/navigation";
import CownAiWrapper from "./CownAiWrapper";
import { getMarketTableData, getGlobalData, getFearAndGreed, getTrending } from "@/lib/market-data";
import { getSharedCryptoNews } from "@/lib/news-data";

export default async function CownAiPage() {
  const user = await getSession();
  
  if (!user) {
    redirect("/?protected=cown-ai");
  }

  const [marketTable, globalData, fearAndGreed, trendingCoins, newsData] = await Promise.all([
    getMarketTableData(1),
    getGlobalData(),
    getFearAndGreed(),
    getTrending(5),
    getSharedCryptoNews(),
  ]);

  return (
    <CownAiWrapper 
      marketData={marketTable.marketData} 
      globalData={globalData}
      fearAndGreed={fearAndGreed}
      trendingCoins={trendingCoins}
      newsData={newsData}
    />
  );
}
