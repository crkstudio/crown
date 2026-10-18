import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

/** Vercel corta los requests de funciones en ~4,5 MB: el navegador ya achica la foto antes de subirla. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const BUCKET = "products";

export class UploadError extends Error {}

function bucket() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } }).storage.from(BUCKET);
}

/**
 * Valida que el archivo sea una imagen real (sharp la decodifica), la achica a 1600px
 * y la sube a Supabase Storage como WebP sin metadatos (quita ubicación GPS, etc.).
 * Devuelve la URL pública.
 */
export async function saveProductImage(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" pesa más de 4 MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    output = await sharp(input, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new UploadError(`"${file.name}" no es una imagen válida (usá JPG, PNG o WebP).`);
  }

  const name = `${randomUUID()}.webp`;
  const b = bucket();
  const { error } = await b.upload(name, output, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw new Error(`Supabase Storage: ${error.message}`);
  return b.getPublicUrl(name).data.publicUrl;
}