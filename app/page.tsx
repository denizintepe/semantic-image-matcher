"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface MatchResult {
  title: string;
  image: {
    id: string;
    image_url: string;
    description: string;
    score?: number;
  } | null;
  score: number | null;
}

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [titles, setTitles] = useState("A happy dog running in a park\nA calm sunset over mountains\nA group brainstorming in an office");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append("files", file));

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const body = await response.json();
    if (!response.ok) {
      setUploadMessage(body.error ?? "Upload failed");
    } else {
      setUploadMessage(`Uploaded ${body.uploaded.length} images and processed embeddings.`);
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

  const titleList = useMemo(() => titles.split("\n").map((t) => t.trim()).filter(Boolean), [titles]);

  const handleMatch = useCallback(async () => {
    setMatching(true);
    setMatches([]);
    const response = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titles: titleList }),
    });

    const body = await response.json();
    if (!response.ok) {
      setUploadMessage(body.error ?? "Matching failed");
    } else {
      setMatches(body.matches ?? []);
      setUploadMessage(null);
    }
    setMatching(false);
  }, [titleList]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Upload className="h-5 w-5" /> Upload images
          </CardTitle>
          <CardDescription>
            Drag and drop hundreds of images. Each file is sent to Vercel Blob, described with GPT-4o-mini, and embedded via
            text-embedding-3-small before being stored in Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-10 text-center transition hover:border-primary hover:bg-accent/40 ${isDragActive ? "border-primary bg-accent/40" : "border-border bg-accent/20"}`}
          >
            <input {...getInputProps()} />
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Drop images here</p>
              <p className="text-sm text-muted-foreground">We will analyze and store each upload with semantic metadata.</p>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Processing upload, hang tight...</p>}
          </div>
          {uploadMessage && <p className="mt-3 text-sm text-muted-foreground">{uploadMessage}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5" /> Match titles to images
          </CardTitle>
          <CardDescription>
            Paste a newline-separated list of titles. We embed the text, perform a cosine similarity search in Supabase with
            pgvector, and return the closest image for each title.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={titles}
            onChange={(event) => setTitles(event.target.value)}
            placeholder="Enter titles, one per line"
          />
          <div className="flex justify-end">
            <Button onClick={handleMatch} disabled={!titleList.length || matching}>
              {matching ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Matching...
                </span>
              ) : (
                "Find best matches"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>The top semantic match for each title.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {matches.map((match) => (
                <div key={match.title} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm uppercase tracking-[0.08em] text-muted-foreground">Title</p>
                      <p className="text-lg font-semibold">{match.title}</p>
                    </div>
                    {match.score != null && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {match.score.toFixed(3)}
                      </span>
                    )}
                  </div>
                  {match.image ? (
                    <div className="mt-4 space-y-3">
                      <div className="relative overflow-hidden rounded-lg border border-border">
                        <Image
                          src={match.image.image_url}
                          alt={match.image.description}
                          width={640}
                          height={360}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">{match.image.description}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">No match found for this title.</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
