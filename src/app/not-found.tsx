import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function NotFound() {
  return (
    <Container
      size="reader"
      className="flex flex-col items-center py-24 text-center md:py-32"
    >
      <Eyebrow className="mb-6">
        <span>▸</span> Status: 404
      </Eyebrow>

      <h1 className="mb-5 text-7xl font-bold leading-none tracking-tight md:text-9xl">
        <span className="gradient-text">404</span>
      </h1>

      <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-zinc-500">
        Log not found
      </p>

      <p className="mb-10 max-w-md text-zinc-400">
        This entry doesn&apos;t exist. Maybe the slug changed, maybe it was
        never committed. Either way — nothing here.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            Home <span aria-hidden>→</span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/posts">All Logs</Link>
        </Button>
      </div>
    </Container>
  );
}
