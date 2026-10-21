"use client";

// Último recurso: falla el layout raíz. Reemplaza al documento entero, por eso lleva sus propios estilos.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.2rem", margin: 0 }}>Algo salió mal</h1>
          <p style={{ color: "#666", margin: "1rem 0 2rem" }}>Estamos teniendo un problema. Probá de nuevo en unos segundos.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ background: "#000", color: "#fff", border: 0, borderRadius: 999, padding: "0.8rem 1.6rem", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
