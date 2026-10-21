import Link from "next/link";
import { CrownMark } from "./crown-logo";

export function NotFoundView() {
  return (
    <div className="mx-auto max-w-[900px] px-5 pt-40 pb-24 text-center sm:px-10">
      <CrownMark className="mx-auto w-24" />
      <p className="mt-10 text-sm font-semibold text-muted">Error 404</p>
      <h1 className="display mt-2 text-[clamp(2.4rem,7vw,5rem)]">No encontramos esa página</h1>
      <p className="mx-auto mt-6 max-w-md text-muted">
        Puede que el link esté mal escrito o que el producto ya no esté disponible.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/tienda" className="btn btn-primary">
          Ir a la tienda
        </Link>
        <Link href="/" className="btn btn-outline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
