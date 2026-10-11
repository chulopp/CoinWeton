import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Fallback models ordered from best to lowest capacity that passed connection tests
const FALLBACK_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "liquid/lfm-2.5-2.6b:free",
];

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

  let lastStatus = 500;
  let hasRateLimit = false;
  let retryAfterHeader = "30";

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://coinweton.vercel.app",
            "X-Title": "CoinWeton",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
          }),
        }
      );

      if (!response.ok) {
        lastStatus = response.status;
        if (response.status === 429) {
          hasRateLimit = true;
          const retry = response.headers.get("Retry-After");
          if (retry) retryAfterHeader = retry;
        }

        const errorText = await response.text();
        console.warn(`OpenRouter model ${model} failed (${response.status}):`, errorText.slice(0, 150));
        continue;
      }

      const data = await response.json();
      let text: string = data?.choices?.[0]?.message?.content ?? "";

      // Fallback to reasoning if content is omitted
      if (!text && data?.choices?.[0]?.message?.reasoning) {
        text = data.choices[0].message.reasoning;
      }

      // Remove internal reasoning thought tags if present
      text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      if (!text) {
        console.warn(`Model ${model} returned blank text, falling back to next model`);
        continue;
      }

      return NextResponse.json({ text, modelUsed: model });
    } catch (err) {
      console.error(`Error attempting model ${model}:`, err);
    }
  }

  if (hasRateLimit) {
    return NextResponse.json(
      {
        error:
          "Saat ini seluruh server AI sedang mengalami antrean penuh (Rate Limit). Mohon tunggu beberapa saat dan coba lagi.",
        errorType: "RATE_LIMIT",
        retryAfter: Number(retryAfterHeader),
      },
      {
        status: 429,
        headers: { "Retry-After": retryAfterHeader },
      }
    );
  }

  return NextResponse.json(
    { error: `AI service unavailable across all fallback models (Last status: ${lastStatus}).` },
    { status: 502 }
  );
}
