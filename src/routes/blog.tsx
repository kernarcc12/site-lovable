import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  component: BlogList,
  head: () => ({
    meta: [
      { title: "Blog — Eiken Project" },
      { name: "description", content: "Notícias, oficinas e crônicas do sertão pernambucano." },
      { property: "og:title", content: "Blog — Eiken Project" },
      { property: "og:description", content: "Notícias, oficinas e crônicas do sertão pernambucano." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..700,0..100&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
});

type Post = {
  id: string;
  titulo: string;
  slug: string;
  excerpt: string | null;
  capa_url: string | null;
  categoria: string;
  autor: string | null;
  published_at: string | null;
  imagens: string[] | null;
};

const CATEGORIAS = ["todas", "noticia", "oficina", "evento"];

function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filtro, setFiltro] = useState("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("posts")
      .select("id, titulo, slug, excerpt, capa_url, categoria, autor, published_at, imagens")
      .eq("publicado", true)
      .order("published_at", { ascending: false });
    if (filtro !== "todas") q = q.eq("categoria", filtro);
    q.then(({ data }) => {
      setPosts(data ?? []);
      setLoading(false);
    });
  }, [filtro]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-32 md:pt-40 pb-20 px-6 lg:px-12 border-b border-border">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            <span className="text-clay">§</span> Diário do Sertão
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9]">
            Blog<span className="text-clay">.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Crônicas, oficinas, mostras e bastidores da cultura viva de Triunfo.
          </p>

          <div className="mt-12 flex flex-wrap gap-3">
            {CATEGORIAS.map((c) => (
              <button
                key={c}
                onClick={() => setFiltro(c)}
                className={`text-xs uppercase tracking-[0.2em] px-4 py-2 border transition-colors ${
                  filtro === c
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          {loading && <div className="text-muted-foreground">Carregando…</div>}
          {!loading && posts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl text-clay/40 font-display mb-4">✦</div>
              <p className="text-muted-foreground">Nenhuma postagem ainda.</p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group block">
                <div className="relative overflow-hidden aspect-[4/5] mb-5 bg-secondary">
                  {p.capa_url ? (
                    <img src={p.capa_url} alt={p.titulo} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : p.imagens && p.imagens.length > 0 ? (
                    <img src={p.imagens[0]} alt={p.titulo} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-clay/20 flex items-center justify-center text-6xl text-clay/40 font-display">✦</div>
                  )}
                  <div className="absolute top-4 left-4 bg-paper text-ink text-xs px-3 py-1.5 font-mono uppercase tracking-wider">{p.categoria}</div>
                  {p.imagens && p.imagens.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-paper/90 text-ink text-xs px-2 py-1 font-mono">
                      {p.imagens.length} imgs
                    </div>
                  )}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {p.published_at ? new Date(p.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                  {p.autor ? ` · ${p.autor}` : ""}
                </div>
                <h2 className="font-display text-2xl md:text-3xl leading-tight group-hover:text-clay transition-colors">{p.titulo}</h2>
                {p.excerpt && <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}