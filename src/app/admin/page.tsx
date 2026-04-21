import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const posts = getAllPosts();

  return (
    <Container size="default" className="py-14">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow className="mb-3">
            <span>▸</span> Admin
          </Eyebrow>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
            Manage <span className="gradient-text">Logs</span>
          </h1>
          <p className="mt-2 font-mono text-sm text-zinc-500">
            {posts.length} {posts.length === 1 ? "entry" : "entries"} in repo
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/new">+ New Log</Link>
        </Button>
      </header>

      <AdminDashboard posts={posts} />
    </Container>
  );
}
