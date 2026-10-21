"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CrownMark } from "@/components/crown-logo";

export default function StoreError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[900px] px-5 pt-40 pb-24 text-center sm:px-10">
      <CrownMark className="mx-auto w-24" />
      <h1 className="display mt-10 text-[clamp(2.4rem,7vw,5rem)]">Algo salió mal</h1>
      <p className="mx-auto mt-6 max-w-md text-muted">
        Tuvimos un problema al cargar esta página. Probá de nuevo en unos segundos.
      </p>
      {error.digest && <p className="mt-3 text-xs text-muted">Código: {error.digest}</p>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => retry()}>
          Reintentar
        </button>
        <Link href="/" className="btn btn-outline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
