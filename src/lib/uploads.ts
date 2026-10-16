import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const FILE_NAME_RE = /^[a-f0-9-]{36}\.webp$/;

export class UploadError extends Error {}

/**
 * Valida que el archivo sea una imagen real (sharp la decodifica), la achica a 1600px
 * y la guarda como WebP sin metadatos (quita ubicación GPS, etc.).
 */
export async function saveProductImage(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`"${file.name}" pesa más de 8 MB.`);
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
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.webp`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), output);
  return `/media/${name}`;
}
