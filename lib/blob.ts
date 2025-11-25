import { put } from "@vercel/blob";

export async function saveToBlob(file: File) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  const response = await put(file.name, file, {
    access: "public",
    token,
  });

  return response.url;
}
