"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

// Toggle de tema flutuante. O tema real já foi aplicado por um script inline no
// layout (sem flash); aqui só sincronizamos o estado e deixamos alternar.
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as Theme | null) ??
      "dark";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage indisponível — ok */
    }
  }

  // Evita mismatch de hidratação: só mostra o ícone certo depois de montar.
  const label = !mounted ? "" : theme === "dark" ? "☀" : "☾";

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      title={theme === "dark" ? "Tema claro" : "Tema escuro"}
      className="fixed bottom-5 right-5 z-50 grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-base text-fg shadow-card transition-all hover:border-ember/50 hover:text-ember"
    >
      <span suppressHydrationWarning>{label}</span>
    </button>
  );
}
