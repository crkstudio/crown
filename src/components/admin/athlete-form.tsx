"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, X } from "lucide-react";
import type { AthleteFormState } from "@/app/actions/admin/athletes";
import { CrownMark } from "@/components/crown-logo";
import { Switch } from "./product-row-actions";
import { cn } from "@/lib/utils";

export type AthleteDraft = { name: string; sport: string; image: string; visible: boolean };

export const EMPTY_ATHLETE: AthleteDraft = { name: "", sport: "Atleta crown", image: "", visible: true };

/** Achica y convierte a WebP en el navegador, para no pasar el límite de ~4,5 MB por request de Vercel. */
async function shrink(file: File): Promise<File> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`"${file.name}" no se pudo leer. Usá JPG, PNG o WebP.`);
  }
  const scale = Math.min(1, 1600 / bmp.width, 2000 / bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error(`No se pudo procesar "${file.name}".`);
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

function Err({ msg }: { msg?: string }) {
  return msg ? (
    <p role="alert" className="mt-1.5 text-sm font-medium text-rose-700">
      {msg}
    </p>
  ) : null;
}

export function AthleteForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: AthleteFormState, fd: FormData) => Promise<AthleteFormState>;
  initial: AthleteDraft;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};
  const [d, setD] = useState(initial);
  const set = <K extends keyof AthleteDraft>(k: K, v: AthleteDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("files", await shrink(file));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "No se pudo subir");
      set("image", json.urls[0]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "No se pudo subir");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="grid max-w-4xl gap-6 lg:grid-cols-[1.3fr_1fr]">
      <input type="hidden" name="image" value={d.image} />
      {d.visible && <input type="hidden" name="visible" value="on" />}

      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 lg:col-span-2">
          {state.error}
        </p>
      )}

      <div className="space-y-6">
        <section className="panel space-y-5 p-6">
          <h2 className="font-bold">Datos</h2>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
              Nombre
            </label>
            <input id="name" name="name" value={d.name} onChange={(e) => set("name", e.target.value)} required maxLength={80} className="field" />
            <Err msg={fe.name} />
          </div>
          <div>
            <label htmlFor="sport" className="mb-1.5 block text-sm font-semibold">
              Deporte o etiqueta
            </label>
            <input id="sport" name="sport" value={d.sport} onChange={(e) => set("sport", e.target.value)} required maxLength={80} className="field" placeholder="Running, Crossfit, Atleta crown…" />
            <Err msg={fe.sport} />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
            <div>
              <p className="text-sm font-semibold">Visible en la tienda</p>
              <p className="text-sm text-muted">Si lo apagás queda guardado pero no se muestra.</p>
            </div>
            <Switch checked={d.visible} onChange={(v) => set("visible", v)} label="Visible en la tienda" />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending || uploading} className="btn btn-primary flex-1 py-3.5">
            {pending ? "Guardando…" : submitLabel}
          </button>
          <Link href="/admin/athletes" className="btn btn-outline py-3.5">
            Cancelar
          </Link>
        </div>
      </div>

      <section className="panel h-fit p-6">
        <h2 className="font-bold">Foto</h2>
        <p className="mb-4 text-sm text-muted">Vertical queda mejor (4:5). JPG, PNG o WebP.</p>
        <div className="relative mb-4 grid aspect-[4/5] place-items-center overflow-hidden rounded-xl bg-surface">
          {d.image ? (
            <>
              <Image src={d.image} alt="Vista previa" fill sizes="320px" className="object-cover" />
              <button
                type="button"
                aria-label="Quitar foto"
                onClick={() => set("image", "")}
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 shadow hover:bg-black hover:text-white"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <CrownMark className="w-24 text-black/[0.09]" aria-hidden />
          )}
        </div>
        <input ref={fileRef} id="photo" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => upload(e.target.files)} disabled={uploading} />
        <label
          htmlFor="photo"
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-black/30 px-4 py-4 text-sm font-semibold transition-colors hover:border-black hover:bg-neutral-50 focus-within:outline-2",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          <Upload size={18} aria-hidden />
          {uploading ? "Subiendo…" : d.image ? "Cambiar foto" : "Subir foto"}
        </label>
        {uploadError && (
          <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
            {uploadError}
          </p>
        )}
        <Err msg={fe.image} />
      </section>
    </form>
  );
}