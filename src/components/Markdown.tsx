import ReactMarkdown from "react-markdown";

// Renderiza markdown com a cara da casa (estilos em globals.css, classe .md).
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
