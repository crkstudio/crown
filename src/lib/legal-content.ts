import { AAIP_NOTICE, CONSUMER_COMPLAINT, LEGAL } from "./legal";

export type LegalSection = { title: string; paragraphs?: string[]; list?: string[] };
export type LegalDoc = { slug: string; title: string; description: string; sections: LegalSection[] };

const provider = `${LEGAL.legalName}, CUIT ${LEGAL.cuit}, con domicilio en ${LEGAL.address}. Correo de atención al consumidor: ${LEGAL.email}. Teléfono: ${LEGAL.phone}.`;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "terminos-y-condiciones",
    title: "Términos y condiciones",
    description: "Condiciones de compra en la tienda online de Crown.",
    sections: [
      {
        title: "1. Quiénes somos",
        paragraphs: [`Este sitio es operado por ${provider} En adelante, “${LEGAL.brand}”.`],
      },
      {
        title: "2. Aceptación y normas aplicables",
        paragraphs: [
          "Al realizar una compra aceptás estos términos. La relación se rige por la Ley 24.240 de Defensa del Consumidor, el Código Civil y Comercial de la Nación y sus normas complementarias, en particular la Disposición 954/2025 (botón de arrepentimiento) y la Resolución 270/2020 (comercio electrónico).",
          "Para comprar tenés que ser mayor de 18 años.",
        ],
      },
      {
        title: "3. Productos y disponibilidad",
        paragraphs: [
          "Las fotos son orientativas: el color puede variar levemente según la pantalla. El stock se reserva cuando generás el pedido. Si el pago no se acredita, el pedido puede cancelarse y el stock liberarse.",
          "Si detectamos un error evidente de publicación (precio o stock), te avisamos antes de despachar y podés cancelar sin costo.",
        ],
      },
      {
        title: "4. Precios",
        paragraphs: [
          "Los precios están expresados en pesos argentinos e incluyen IVA y demás impuestos. El precio publicado es el precio final al contado. El costo de envío se informa por separado antes de que pagues; no hay otros cargos ocultos.",
        ],
      },
      {
        title: "5. Medios de pago",
        paragraphs: [
          "Los pagos se procesan a través de Mercado Pago, con los medios que esa plataforma tenga habilitados (por ejemplo, tarjetas de crédito y débito o dinero en cuenta). Si elegís pagar en cuotas, Mercado Pago te informa la cantidad de cuotas, su periodicidad y el Costo Financiero Total (CFT) antes de confirmar el pago.",
          `${LEGAL.brand} no almacena los datos de tu tarjeta. El pedido queda confirmado cuando Mercado Pago acredita el pago.`,
        ],
      },
      {
        title: "6. Envíos y plazos de entrega",
        paragraphs: [
          `Enviamos a todo el país. El plazo estimado de entrega es de ${LEGAL.shippingEta} contados desde la acreditación del pago; el despacho se realiza dentro de ${LEGAL.dispatchEta}. El costo de envío se calcula en el checkout y es gratis a partir del monto indicado en la tienda.`,
          "Coordinamos la entrega por el email y el teléfono que cargaste en el pedido, y te informamos el número de seguimiento. Revisá los datos de entrega antes de pagar: son tu responsabilidad.",
          "El plazo de entrega forma parte de la oferta. Si no lo cumplimos, podés, a tu elección, exigir el cumplimiento, aceptar otro producto equivalente o rescindir la compra con la restitución de lo pagado (art. 10 bis, Ley 24.240).",
        ],
      },
      {
        title: "7. Facturación",
        paragraphs: [
          "Emitimos factura electrónica por cada compra y te la enviamos por email. Si necesitás factura A, escribinos con tu número de pedido, CUIT y razón social antes de que se emita el comprobante.",
        ],
      },
      {
        title: "8. Arrepentimiento, cambios y garantía",
        paragraphs: [
          `Podés arrepentirte de tu compra dentro de los ${LEGAL.withdrawalDays} días corridos desde que recibís el producto o celebrás el contrato, lo que ocurra último, usando el “Botón de arrepentimiento” de la página de confirmación de tu compra o escribiéndonos a ${LEGAL.email}. Las condiciones de cambios, devoluciones y garantía están en sus páginas específicas.`,
        ],
      },
      {
        title: "9. Datos personales",
        paragraphs: ["El tratamiento de tus datos se explica en la Política de privacidad."],
      },
      {
        title: "10. Reclamos",
        paragraphs: [
          `Podés reclamarnos por ${LEGAL.email} (${LEGAL.hours}). Si no te damos una solución, podés presentar tu reclamo ante Defensa del Consumidor: ${CONSUMER_COMPLAINT.label} (${CONSUMER_COMPLAINT.url}).`,
        ],
      },
      {
        title: "11. Propiedad intelectual",
        paragraphs: [
          `Las marcas, logos, fotografías y textos de este sitio pertenecen a ${LEGAL.brand} o a sus titulares y no pueden usarse sin autorización.`,
        ],
      },
      {
        title: "12. Ley aplicable y jurisdicción",
        paragraphs: [
          "Se aplica la ley argentina. Ante cualquier controversia será competente la justicia del domicilio real del consumidor.",
        ],
      },
      {
        title: "13. Cambios en estos términos",
        paragraphs: [
          "Podemos actualizar estos términos. A cada compra se le aplica la versión vigente al momento de realizarla.",
        ],
      },
    ],
  },
  {
    slug: "cambios-y-devoluciones",
    title: "Cambios y devoluciones",
    description: "Cómo arrepentirte de una compra, cambiar un talle o devolver un producto.",
    sections: [
      {
        title: "1. Botón de arrepentimiento (devolución sin causa)",
        paragraphs: [
          `Tenés ${LEGAL.withdrawalDays} días corridos para arrepentirte de tu compra, contados desde que recibís el producto o celebrás el contrato (lo que ocurra último), sin dar explicaciones (art. 34 Ley 24.240 y art. 1110 Código Civil y Comercial). Este derecho no puede ser renunciado.`,
          `Para ejercerlo usá el “Botón de arrepentimiento” de la página de confirmación de tu compra (“Gracias por tu compra”): completás un formulario con tus datos y el número de pedido, sin registrarte ni hacer otro trámite. Si ya cerraste esa página, escribinos a ${LEGAL.email} indicando tu número de pedido. Dentro de las 24 horas, por el mismo medio, te damos un código de identificación de tu solicitud y te indicamos cómo devolver el producto y coordinar el reembolso.`,
        ],
      },
      {
        title: "2. Condiciones de la devolución",
        list: [
          "El producto tiene que estar sin uso, con sus etiquetas y en su embalaje original, a disposición de Crown.",
          "Los gastos de la devolución están a cargo de Crown.",
          `Te reintegramos lo que pagaste, por el mismo medio de pago y en un máximo de ${LEGAL.refundTerm} desde que recibimos el producto. En tarjetas, el reflejo del reintegro depende de tu banco.`,
        ],
      },
      {
        title: "3. Cuándo no aplica",
        paragraphs: [
          "El botón de arrepentimiento no aplica a productos ya utilizados o consumidos, ni en los supuestos del art. 1116 del Código Civil y Comercial (por ejemplo, productos confeccionados a medida o claramente personalizados).",
        ],
      },
      {
        title: "4. Cambio de talle o color",
        paragraphs: [
          `Además del arrepentimiento, ofrecemos cambios de talle o color dentro de los ${LEGAL.exchangeDays} días corridos desde la recepción, sujetos a stock, con el producto sin uso y con etiquetas. El cambio no tiene costo para vos. Si el talle o color que querés no está disponible, podés optar por la devolución.`,
        ],
      },
      {
        title: "5. Producto con falla o distinto al pedido",
        paragraphs: [
          "Si recibiste un producto defectuoso, dañado o diferente al que compraste, aplica la garantía legal: mirá la página de Garantías. Los gastos de traslado están a nuestro cargo.",
        ],
      },
      {
        title: "6. Cómo gestionarlo",
        paragraphs: [
          `Escribinos a ${LEGAL.email} con tu número de pedido (${LEGAL.hours}). Coordinamos el retiro o el envío de la devolución sin costo para vos.`,
        ],
      },
    ],
  },
  {
    slug: "garantias",
    title: "Garantías",
    description: "Garantía legal de los productos de Crown.",
    sections: [
      {
        title: "1. Garantía legal",
        paragraphs: [
          "Los productos nuevos tienen garantía legal de 6 meses desde la entrega (3 meses si fueran usados), por defectos o vicios de cualquier índole que afecten la identidad entre lo ofrecido y lo entregado o su correcto funcionamiento, aunque fueran visibles al momento de la compra (arts. 11 a 18, Ley 24.240).",
          "Son solidariamente responsables de la garantía los productores, importadores, distribuidores y vendedores (art. 13).",
        ],
      },
      {
        title: "2. Qué podés pedir",
        paragraphs: ["Ante un defecto cubierto podés elegir entre (art. 17):"],
        list: ["La reparación sin cargo.", "La sustitución del producto por otro de iguales características.", "La devolución de lo pagado.", "Una quita proporcional del precio."],
      },
      {
        title: "3. Costos y plazos",
        paragraphs: [
          "Los gastos de flete y traslado necesarios para hacer efectiva la garantía están a cargo de Crown. El tiempo durante el cual estés privado del producto por una reparación no se cuenta dentro del plazo de la garantía.",
        ],
      },
      {
        title: "4. Qué no cubre",
        paragraphs: [
          "No cubre el desgaste normal por uso, ni los daños por uso, lavado o conservación distintos a los indicados en la etiqueta del producto.",
        ],
      },
      {
        title: "5. Cómo reclamar",
        paragraphs: [
          `Escribinos a ${LEGAL.email} con tu número de pedido y fotos del defecto (${LEGAL.hours}). La factura o el comprobante de pago funciona como constancia de la garantía.`,
        ],
      },
    ],
  },
  {
    slug: "politica-de-privacidad",
    title: "Política de privacidad",
    description: "Qué datos personales recolectamos, para qué los usamos y cómo ejercer tus derechos.",
    sections: [
      {
        title: "1. Responsable",
        paragraphs: [`Responsable del tratamiento: ${provider}`],
      },
      {
        title: "2. Qué datos recolectamos",
        list: [
          "Al comprar: nombre y apellido, email, teléfono, domicilio de entrega y notas del envío.",
          "Al dejar tu email en un pop-up: tu email, para enviarte el beneficio ofrecido.",
          "Al usar el botón de arrepentimiento: nombre, email, teléfono (opcional), número de pedido y detalle de la devolución.",
          "En tu navegador guardamos el carrito, si ya viste un pop-up y tu elección sobre el aviso de cookies (almacenamiento local). Para el acceso del equipo al panel de administración usamos una cookie técnica de sesión, estrictamente necesaria. Hoy no usamos cookies de seguimiento publicitario ni de analítica; si lo hacemos en el futuro, solo será con tu consentimiento.",
        ],
        paragraphs: ["No almacenamos los datos de tu tarjeta: los procesa Mercado Pago."],
      },
      {
        title: "3. Para qué los usamos",
        list: [
          "Gestionar tu pedido: cobro, envío, facturación y atención posventa.",
          "Cumplir obligaciones legales e impositivas.",
          "Enviarte novedades y descuentos, solamente si lo aceptaste. Podés darte de baja cuando quieras escribiéndonos.",
        ],
      },
      {
        title: "4. Con quién los compartimos",
        paragraphs: [
          "Solo con quienes necesitamos para cumplir la compra: Mercado Pago (pagos), empresas de transporte y logística (entrega), organismos fiscales cuando corresponda y proveedores tecnológicos de alojamiento y base de datos, que pueden operar servidores fuera de la Argentina. No vendemos tus datos.",
        ],
      },
      {
        title: "5. Cuánto tiempo los conservamos",
        paragraphs: [
          "Mientras dure la relación comercial y durante los plazos que exigen las normas fiscales, comerciales y de defensa del consumidor. Después los eliminamos o anonimizamos.",
        ],
      },
      {
        title: "6. Tus derechos",
        paragraphs: [
          `Podés acceder, rectificar, actualizar y suprimir tus datos escribiendo a ${LEGAL.email}. Respondemos los pedidos de acceso dentro de 10 días corridos y los de rectificación o supresión dentro de 5 días hábiles (Ley 25.326, arts. 14 y 16).`,
          AAIP_NOTICE,
        ],
      },
      {
        title: "7. Seguridad",
        paragraphs: [
          "Usamos conexiones cifradas y limitamos el acceso a los datos al personal autorizado. Ningún sistema es infalible: si ocurre un incidente que te afecte, te lo informaremos.",
        ],
      },
      {
        title: "8. Cambios",
        paragraphs: [`Esta política puede actualizarse. Última actualización: ${LEGAL.updatedAt}.`],
      },
    ],
  },
];

export const getLegalDoc = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug);
