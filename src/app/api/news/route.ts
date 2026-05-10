import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || searchParams.get("pageToken");
  const limit = searchParams.get("limit") || "10";
  const coin = searchParams.get("coin");

  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  let url = `https://newsdata.io/api/1/crypto?apikey=${apiKey}&language=en&image=1&size=${limit}&removeduplicate=1`;
  
  if (coin) {
    url += `&q=${encodeURIComponent(coin)}`;
  } else {
    url += `&q=crypto`;
  }

  if (page) {
    url += `&page=${page}`;
  }

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from NewsData" }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
