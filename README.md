# Crown — tienda online + panel de administración

Sitio de la marca de ropa deportiva **Crown**: tienda pública minimalista (blanco y negro, barra de navegación flotante con efecto *liquid glass*) y un panel de administración completo.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Postgres (Supabase) + Drizzle ORM · Zod · Zustand · Mercado Pago (preparado).

## Puesta en marcha

```bash
npm install
npm run db:setup     # crea las tablas en Supabase, el usuario admin y datos de ejemplo (requiere DATABASE_URL en .env.local)
npm run dev          # http://localhost:3000
```

- Tienda: <http://localhost:3000>
- Panel: <http://localhost:3000/admin> (el usuario y la contraseña iniciales están en `.env.local`: `ADMIN_EMAIL` / `ADMIN_PASSWORD`). **Cambiá la contraseña** desde *Admin → Ajustes*.
- Para empezar de cero, sin productos de ejemplo: `npm run db:push && npm run db:seed -- --no-demo`.

## Qué incluye

### Tienda pública
Inicio con el logo como protagonista · catálogo con filtros por categoría y orden · ficha de producto con talle/color y stock por variante · carrito lateral (se guarda en el navegador) · checkout con validación · pop-up comercial.

### Panel de administración (`/admin`)
| Sección | Qué permite |
|---|---|
| **Resumen** | Ventas de 30 días, pedidos a enviar, gráfico diario, stock bajo, últimos pedidos |
| **Productos** | Crear, editar, **eliminar**, **listar u ocultar** de la tienda, destacar en el inicio, subir hasta 8 fotos, variantes talle/color |
| **Stock** | Editar el stock de cada variante en línea; filtros de stock bajo y agotado |
| **Clientes** | Listado, ficha con historial, búsqueda, exportación a CSV |
| **Ventas** | Todos los pedidos, detalle, cambio de estado. Cancelar un pedido devuelve el stock |
| **Pop-ups** | Mensajes comerciales con vista previa, audiencia (visitantes nuevos / todos), momento de aparición, ventana de fechas y métricas |
| **Ajustes** | Abrir/cerrar la tienda, costo de envío, envío gratis desde, umbral de stock bajo, cambio de contraseña |

## Estado de la tienda: preparada, no habilitada
La tienda **arranca cerrada** (`Ajustes → Tienda abierta para comprar`). Mientras esté cerrada se puede navegar y armar el carrito, pero el checkout no crea pedidos ni toca el stock.

Para habilitar los cobros:
1. Creá una aplicación en Mercado Pago Developers y copiá el **Access Token** y la **clave secreta del webhook**.
2. Cargalos en `.env.local` (`MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`) y poné `NEXT_PUBLIC_SITE_URL` con tu dominio `https://…`.
3. En Mercado Pago, configurá el webhook de *Pagos* hacia `https://TU-DOMINIO/api/webhooks/mercadopago`.
4. Activá *Tienda abierta para comprar* en el panel.

Cómo funciona el cobro: el checkout crea el pedido y reserva el stock en una sola transacción; luego redirige a Mercado Pago. El webhook verifica la firma, **consulta el pago directamente a Mercado Pago** y recién ahí marca el pedido como pagado (comparando el monto). Si el pago no se puede iniciar, el pedido se cancela y el stock vuelve. Los precios siempre se leen de la base, nunca del navegador.
Para usar otra pasarela alcanza con implementar la interfaz de `src/lib/payments/types.ts`.

## Pendientes conocidos
- **Cupones:** el pop-up puede mostrar un código de descuento, pero el checkout todavía no tiene campo de cupón ni lo aplica.
- **Pedidos pendientes:** un pedido que nunca se paga mantiene su stock reservado hasta que lo cancelás a mano desde *Ventas*. Falta una tarea que los libere automáticamente.
- **Mails:** no se envían emails (confirmación de compra, recuperación de contraseña).
- **Limpieza de fotos:** al eliminar un producto, sus archivos de imagen quedan en `data/uploads`.
- **Costo de envío fijo:** no hay cálculo por zona o peso.

## Seguridad
- Sesión del panel con cookie `HttpOnly` firmada (JWT, 7 días). El acceso se verifica en tres capas: `proxy.ts`, cada consulta de datos y cada acción del servidor.
- Contraseñas con bcrypt; límite de 5 intentos fallidos cada 15 minutos por email+IP (en memoria: con varias instancias conviene moverlo a Redis).
- Todas las entradas se validan con Zod. Las imágenes subidas se re-codifican con `sharp` (se descarta cualquier archivo que no sea una imagen real y se eliminan metadatos).
- El CSV exportado neutraliza fórmulas de planilla.

## Despliegue
La base es Postgres (Supabase). Las fotos todavía se guardan en disco (`data/`): para Vercel falta migrarlas a Supabase Storage (siguiente paso).
```bash
npm run build && npm run start
```
Antes del primer deploy: definí `SESSION_SECRET` (`openssl rand -hex 32`), `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `NEXT_PUBLIC_SITE_URL`, y activá los backups de Supabase (y, hasta migrar las fotos a Storage, copiá `data/`).

## Estructura
```
src/app/(store)      Tienda pública (inicio, /tienda, /checkout)
src/app/admin        Panel (login + (panel)/ resumen, productos, stock, clientes, ventas, pop-ups, ajustes)
src/app/actions      Server Actions (checkout, pop-ups, auth y admin/*)
src/app/api          Webhook de Mercado Pago, subida de imágenes, export CSV
src/db               Esquema Drizzle, conexión y seed
src/lib              Consultas, pedidos/stock, auth, pagos, carrito
src/components       UI (nav liquid glass, carrito, pop-up, formularios del panel)
```
