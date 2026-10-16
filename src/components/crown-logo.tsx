import type { SVGProps } from "react";

/**
 * Logo de Crown vectorizado a partir del PNG original.
 * Usa currentColor: cambia de color con `text-*`.
 */
export function CrownMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 2000 985" fill="currentColor" role="img" aria-label="Crown" {...props}>
      <path d="M1000 0 1532 528 1150 654 1000 543 849 654 467 528Z" />
      <path d="M0 439 788 699 408 982Z" />
      <path d="M2000 441 1212 701 1591 983Z" />
    </svg>
  );
}
