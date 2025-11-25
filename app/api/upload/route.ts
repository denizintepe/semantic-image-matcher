import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { getServiceClient } from "@/lib/supabase";
import { saveToBlob } from "@/lib/blob";

export const runtime = "nodejs";

async function describeImage(url: string) {
  const client = getOpenAI();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this image in detail, focusing on emotions, actions, setting, and abstract concepts.",
          },
          {
            type: "image_url",
            image_url: {
              url,
            },
          },
        ],
      },
    ],
  });

  const description = completion.choices[0]?.message?.content?.trim();
  if (!description) {
    throw new Error("OpenAI did not return a description");
  }
  return description;
}

async function createEmbedding(input: string) {
  const client = getOpenAI();
  const embedding = await client.embeddings.create({
    input,
    model: "text-embedding-3-small",
  });
  return embedding.data[0]?.embedding ?? [];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files?.length) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const results = [] as { image_url: string; description: string }[];

    for (const file of files) {
      const imageUrl = await saveToBlob(file);
      const description = await describeImage(imageUrl);
      const embedding = await createEmbedding(description);

      const { error } = await supabase.from("images").insert({
        image_url: imageUrl,
        description,
        embedding,
      });

      if (error) {
        throw error;
      }

      results.push({ image_url: imageUrl, description });
    }

    return NextResponse.json({ uploaded: results });
  } catch (error: unknown) {
    console.error("Upload failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
