import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const RECEIPT_BUCKET = "receipts";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export { RECEIPT_BUCKET };

export function takeReceiptFile(formData: FormData): File | null {
  const value = formData.get("receipt");
  formData.delete("receipt");
  if (value instanceof File && value.size > 0) return value;
  return null;
}

export function supabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase URL / service role key missing from env");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function extFor(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function uploadReceipt(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Receipt must be a PNG, JPEG, WebP, or GIF");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Receipt must be between 1 byte and 5 MB");
  }

  const path = `${crypto.randomUUID()}.${extFor(file.type)}`;
  const body = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin()
    .storage.from(RECEIPT_BUCKET)
    .upload(path, body, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Receipt upload failed: ${error.message}`);
  return path;
}

export async function signedReceiptUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const { data, error } = await supabaseAdmin()
    .storage.from(RECEIPT_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
