import Image from "next/image";
import { CrownMark } from "./crown-logo";
import { cn } from "@/lib/utils";

/**
 * Imagen de producto. Si todavía no se subió ninguna foto,
 * muestra un marcador neutro con el logo de Crown.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src?: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-surface", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <CrownMark className="w-[38%] text-black/[0.09]" aria-hidden />
      )}
    </div>
  );
}
