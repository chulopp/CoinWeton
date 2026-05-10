import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API key not configured." },
      { status: 500 }
    );
  }

  let messages: ChatMessage[];

  try {
    const body = await request.json();
    messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages array." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "CoinWeton",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:free",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text: string =
      data?.choices?.[0]?.message?.content ?? "No response from AI.";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("Error calling OpenRouter:", err);
    return NextResponse.json(
      { error: "Failed to reach AI service." },
      { status: 500 }
    );
  }
}
