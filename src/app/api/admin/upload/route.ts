import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveProductImage, UploadError } from "@/lib/uploads";

export async function POST(request: Request) {
  // Doble control: el proxy ya filtró, acá se vuelve a verificar contra la base.
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await request.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  if (files.length > 8) return NextResponse.json({ error: "Subí hasta 8 imágenes por vez." }, { status: 400 });

  try {
    const urls: string[] = [];
    for (const f of files) urls.push(await saveProductImage(f));
    return NextResponse.json({ urls });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 422 });
    console.error("[upload]", e);
    return NextResponse.json({ error: "No pudimos guardar las imágenes." }, { status: 500 });
  }
}
