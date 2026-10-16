export type Athlete = {
  id: string;
  name: string;
  /** Disciplina o deporte. */
  sport: string;
  /**
   * Foto del atleta. Subí el archivo a `public/athletes/` y poné la ruta, por ejemplo "/athletes/matias.jpg".
   * Mientras sea `null`, la tarjeta muestra el marcador con el logo de Crown.
   */
  image: string | null;
};

const confirmed: Athlete[] = [
  { id: "matias", name: "Matías", sport: "Atleta Crown", image: "/athletes/matias.jpg" },
];

/** Marcadores hasta completar la grilla. Se van reemplazando a medida que sumás atletas arriba. */
const placeholders: Athlete[] = Array.from({ length: Math.max(0, 8 - confirmed.length) }, (_, i) => ({
  id: `proximamente-${i + 1}`,
  name: "Próximamente",
  sport: "Atleta Crown",
  image: null,
}));

export const athletes: Athlete[] = [...confirmed, ...placeholders];