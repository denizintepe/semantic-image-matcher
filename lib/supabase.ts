import { createClient } from "@supabase/supabase-js";

export type ImageRow = {
  id: string;
  image_url: string;
  description: string;
  embedding: number[];
  created_at: string;
};

export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase credentials are not configured");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
