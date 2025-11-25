import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { getServiceClient, type ImageRow } from "@/lib/supabase";

export const runtime = "nodejs";

type MatchResult = {
  title: string;
  image: ImageRow | null;
  score: number | null;
};

async function embedText(input: string) {
  const client = getOpenAI();
  const embedding = await client.embeddings.create({
    input,
    model: "text-embedding-3-small",
  });
  return embedding.data[0]?.embedding ?? [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const titles: string[] = body?.titles ?? [];

    if (!titles.length) {
      return NextResponse.json({ error: "No titles provided" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const matches: MatchResult[] = [];

    for (const rawTitle of titles) {
      const title = rawTitle.trim();
      if (!title) continue;

      const vector = await embedText(title);

      const { data, error } = await supabase.rpc("match_images", {
        query_embedding: vector,
        match_limit: 1,
      });

      if (error) {
        throw error;
      }

      const best = Array.isArray(data) ? data[0] : null;
      matches.push({
        title,
        image: best ?? null,
        score: best?.score ?? null,
      });
    }

    return NextResponse.json({ matches });
  } catch (error: unknown) {
    console.error("Matching failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
