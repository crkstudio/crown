/**
 * Datos legales y comerciales de la tienda. Se usan en el pie de página, las páginas legales,
 * la ficha de producto, el checkout y la pantalla de gracias.
 *
 * ⚠️ COMPLETÁ los valores marcados con "COMPLETAR" antes de publicar: la Ley 24.240 (art. 4) y la
 * Res. GMC 37/19 (incorporada por la Res. 270/2020) exigen mostrar nombre/razón social, CUIT,
 * domicilio físico y electrónico y un correo de atención al consumidor.
 */
export const LEGAL = {
  brand: "Crown",
  legalName: "COMPLETAR: razón social o nombre y apellido del titular",
  cuit: "COMPLETAR: CUIT (XX-XXXXXXXX-X)",
  address: "COMPLETAR: calle y número, ciudad, provincia, código postal",
  email: "COMPLETAR@crown.com.ar",
  phone: "COMPLETAR: teléfono o WhatsApp",
  /** Disp. 954/2025 art. 6: si la atención es solo electrónica/telefónica, mínimo 8 h diarias de lunes a viernes. */
  hours: "Lunes a viernes de 9 a 17 h",

  /** Política comercial propia (editable). */
  shippingEta: "3 a 7 días hábiles",
  dispatchEta: "24 a 48 horas hábiles",
  exchangeDays: 30,
  refundTerm: "10 días hábiles",

  /** Fijados por ley. */
  withdrawalDays: 10,
  updatedAt: "19 de octubre de 2026",
} as const;

/** Leyenda y enlace que exige la Ventanilla Federal Única (Disp. 890/2025). */
export const CONSUMER_COMPLAINT = {
  label: "Defensa de las y los Consumidores. Para reclamos ingrese aquí",
  url: "https://www.argentina.gob.ar/servicio/iniciar-un-reclamo-ante-defensa-del-consumidor",
} as const;

/** Leyenda de la AAIP para formularios que recolectan datos (Ley 25.326, art. 14 inc. 3). */
export const AAIP_NOTICE =
  "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.";

export const WITHDRAWAL_STATUS_LABEL = {
  received: "Recibido",
  processed: "Gestionado",
  rejected: "Rechazado",
} as const;

export const LEGAL_LINKS = [
  { slug: "terminos-y-condiciones", label: "Términos y condiciones" },
  { slug: "politica-de-privacidad", label: "Política de privacidad" },
  { slug: "cambios-y-devoluciones", label: "Cambios y devoluciones" },
  { slug: "garantias", label: "Garantías" },
] as const;
