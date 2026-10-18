/**
 * Secciones de la página de inicio que se pueden prender, apagar y reordenar desde el panel.
 * Este archivo lo usan tanto el servidor como el panel (no importa nada del servidor).
 */

export const HOME_SECTION_IDS = ["hero", "athletes", "featured", "products", "categories", "about"] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export type HomeSectionConfig = { id: HomeSectionId; enabled: boolean };

export const HOME_SECTION_META: Record<HomeSectionId, { label: string; description: string }> = {
  hero: {
    label: "Portada",
    description: "La foto a pantalla completa con “crown style, only for true Athletes” y los dos botones.",
  },
  athletes: {
    label: "Athletes",
    description: "Presentación de los atletas de la marca, con acceso a la página de Athletes.",
  },
  featured: {
    label: "Destacados",
    description: "Los productos que marcaste como destacados en el catálogo.",
  },
  products: {
    label: "Productos",
    description: "Vidriera del catálogo con los productos más nuevos y el acceso a toda la tienda.",
  },
  categories: {
    label: "Comprá por categoría",
    description: "Tarjetas con cada categoría que tenga productos a la venta.",
  },
  about: {
    label: "Frase de la marca",
    description: "“Menos ruido. Más entrenamiento.” con la breve presentación de Crown (Nosotros).",
  },
};

/** Orden y estado de fábrica: todo prendido, en el orden en que se ve hoy. */
export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = HOME_SECTION_IDS.map((id) => ({ id, enabled: true }));

export const HOME_SECTIONS_KEY = "home_sections";

/**
 * Convierte lo guardado (texto JSON o ya parseado) en una lista válida:
 * descarta secciones desconocidas o repetidas y agrega al final las que falten,
 * así un agregado futuro de secciones no rompe lo que ya está guardado.
 */
export function normalizeHomeSections(raw: unknown): HomeSectionConfig[] {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return DEFAULT_HOME_SECTIONS.map((s) => ({ ...s }));
    }
  }
  const seen = new Set<HomeSectionId>();
  const result: HomeSectionConfig[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const { id, enabled } = item as { id?: unknown; enabled?: unknown };
      if (typeof id !== "string" || !(HOME_SECTION_IDS as readonly string[]).includes(id)) continue;
      const sectionId = id as HomeSectionId;
      if (seen.has(sectionId)) continue;
      seen.add(sectionId);
      result.push({ id: sectionId, enabled: enabled !== false });
    }
  }
  // Una sección nueva (que todavía no estaba guardada) entra detrás de la que la precede de fábrica.
  HOME_SECTION_IDS.forEach((id, i) => {
    if (seen.has(id)) return;
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const found = result.findIndex((s) => s.id === HOME_SECTION_IDS[j]);
      if (found !== -1) {
        at = found + 1;
        break;
      }
    }
    result.splice(at, 0, { id, enabled: true });
    seen.add(id);
  });
  return result;
}
