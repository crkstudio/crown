import path from "node:path";
import fs from "node:fs/promises";
import { FILE_NAME_RE, UPLOAD_DIR } from "@/lib/uploads";

/** Sirve las fotos subidas desde el panel. Solo acepta nombres generados por nosotros (sin rutas). */
export async function GET(_req: Request, ctx: RouteContext<"/media/[file]">) {
  const { file } = await ctx.params;
  if (!FILE_NAME_RE.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
