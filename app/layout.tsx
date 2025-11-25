import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Semantic Image Mapper",
  description: "Upload and match images with AI-driven semantic search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border bg-white/70 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  AI SEMANTIC IMAGE TOOLS
                </p>
                <h1 className="text-2xl font-semibold">Semantic Image Mapper</h1>
              </div>
              <a
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:shadow transition"
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
              >
                View Repo
              </a>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
