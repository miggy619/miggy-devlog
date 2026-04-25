"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "home" },
  { href: "/posts", label: "logs" },
  { href: "/plan", label: "plan" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled
          ? "border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="miggydev.log home"
          className="group inline-flex items-center gap-2 font-mono text-sm"
        >
          <span className="text-yellow-400 text-base leading-none transition-transform group-hover:translate-x-0.5">
            ▸
          </span>
          <span className="font-semibold text-zinc-100 transition-colors group-hover:text-yellow-400">
            miggydev
          </span>
          <span className="text-zinc-600 transition-colors group-hover:text-zinc-500">
            .log
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] transition-colors",
                isActive(link.href)
                  ? "text-yellow-400"
                  : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              {link.label}
              {isActive(link.href) && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
                />
              )}
            </Link>
          ))}

          <Link
            href="/admin"
            aria-label="Admin dashboard"
            title="Admin"
            className={cn(
              "ml-2 inline-flex h-8 items-center gap-1.5 rounded-md border bg-zinc-900/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors",
              isActive("/admin")
                ? "border-yellow-400/40 text-yellow-400"
                : "border-zinc-800 text-zinc-400 hover:border-yellow-400/30 hover:text-yellow-400",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h18M3 12h18M3 20h18" />
            </svg>
            Admin
          </Link>

          <a
            href="https://github.com/MiggyDev619/miggy-devlog"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub source"
            className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-yellow-400/30 hover:text-yellow-400"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M12 .5a11.5 11.5 0 0 0-3.635 22.412c.575.105.786-.25.786-.555 0-.273-.01-.996-.015-1.956-3.2.695-3.878-1.543-3.878-1.543-.523-1.33-1.278-1.683-1.278-1.683-1.044-.713.079-.698.079-.698 1.155.081 1.763 1.186 1.763 1.186 1.027 1.76 2.695 1.251 3.35.957.104-.744.402-1.252.731-1.54-2.555-.29-5.24-1.278-5.24-5.687 0-1.256.449-2.283 1.186-3.087-.119-.29-.514-1.462.112-3.047 0 0 .967-.31 3.168 1.18a11 11 0 0 1 5.767 0c2.2-1.49 3.166-1.18 3.166-1.18.627 1.585.232 2.757.114 3.047.738.804 1.184 1.831 1.184 3.087 0 4.42-2.69 5.393-5.253 5.678.413.355.78 1.056.78 2.13 0 1.537-.014 2.776-.014 3.152 0 .308.207.666.79.553A11.5 11.5 0 0 0 12 .5z" />
            </svg>
          </a>
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-900 bg-zinc-950/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={cn(
                  "rounded-md px-3 py-2 font-mono text-sm uppercase tracking-[0.15em] transition-colors",
                  isActive(link.href)
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={closeMenu}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 font-mono text-sm uppercase tracking-[0.15em] transition-colors",
                isActive("/admin")
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 4h18M3 12h18M3 20h18" />
              </svg>
              admin
            </Link>
            <a
              href="https://github.com/MiggyDev619/miggy-devlog"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
              className="rounded-md px-3 py-2 font-mono text-sm uppercase tracking-[0.15em] text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
            >
              github ↗
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
