"use client";

// Último recato: erro no próprio root layout. Precisa de <html>/<body> próprios.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          background: "#0b0b0f",
          color: "#ececf1",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 18 }}>Algo quebrou no nível mais baixo</h1>
          <p style={{ color: "#9a9aa8", fontSize: 14 }}>
            Recarregue a página pra tentar de novo.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: "#ff7a1a",
              color: "#0b0b0f",
              border: "none",
              borderRadius: 6,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
