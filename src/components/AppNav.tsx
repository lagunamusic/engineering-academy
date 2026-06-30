"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./SignOutButton";

const LINKS = [
  { href: "/cockpit", label: "Cockpit" },
  { href: "/trilha", label: "Trilha" },
  { href: "/skill-tree", label: "Skill Tree" },
  { href: "/portfolio", label: "Portfólio" },
];

export function AppNav({ email }: { email?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-6 py-3">
        <Link href="/cockpit" className="mr-3 flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-ember text-xs font-bold text-bg">
            ⚡
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`mono rounded-md px-3 py-1.5 text-xs tracking-wide transition-colors ${
                  active
                    ? "bg-surface-high text-fg"
                    : "text-muted hover:text-fg"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {email && (
            <span className="mono hidden text-[11px] text-muted md:inline">
              {email}
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
