import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-zinc-900/80 bg-zinc-950/60 backdrop-blur-sm">
      <Container size="wide" className="py-10">
        <div className="flex flex-col-reverse items-center justify-between gap-6 sm:flex-row">
          <p className="font-mono text-xs text-zinc-600">
            <span className="text-yellow-400">▸</span> built with intent
            <span className="mx-2 text-zinc-800">/</span>
            © {year} miggydev
          </p>
          <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.15em]">
            <a
              href="https://github.com/MiggyDev619/miggy-devlog"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 transition-colors hover:text-yellow-400"
            >
              source ↗
            </a>
            <Link
              href="/"
              className="text-zinc-500 transition-colors hover:text-yellow-400"
            >
              home
            </Link>
            <Link
              href="/posts"
              className="text-zinc-500 transition-colors hover:text-yellow-400"
            >
              logs
            </Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
