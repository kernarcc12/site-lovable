import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

console.log(">>> BlogSlug route loaded", window.location.pathname);

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPost,
  head: () => ({
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
  excerpt: string | null;
  conteudo: string;
  capa_url: string | null;
  imagens: string[] | null;
  categoria: string;
  autor: string | null;
  published_at: string | null;
};

function BlogPost() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    console.log("Loading post for slug:", slug);
    supabase
      .from("posts")
      .select("id, titulo, excerpt, conteudo, capa_url, imagens, categoria, autor, published_at")
      .eq("slug", slug)
      .eq("publicado", true)
      .maybeSingle()
      .then(({ data, error }) => {
        console.log("Post data:", data);
        console.log("Error:", error);
        if (!data) setNotFound(true);
        else setPost(data);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <article className="pt-32 md:pt-40 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-clay transition-colors">
            ← Voltar ao blog
          </Link>

          {loading && <div className="mt-12 text-muted-foreground">Carregando…</div>}
          {notFound && (
            <div className="mt-20 text-center">
              <h1 className="font-display text-5xl">Postagem não encontrada</h1>
            </div>
          )}
          {post && (
            <>
              <div className="mt-10 text-xs uppercase tracking-[0.3em] text-clay font-mono">{post.categoria}</div>
              <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95] tracking-tight">{post.titulo}</h1>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground border-y border-border py-4">
                {post.autor && <span>Por {post.autor}</span>}
                {post.published_at && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span>{new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
                  </>
                )}
              </div>
              <div className="mt-12 space-y-8">
                {post.capa_url && (
                  <img src={post.capa_url} alt={post.titulo} className="w-full max-h-[600px] object-cover" />
                )}
                {post.excerpt && (
                  <p className="font-display text-2xl md:text-3xl italic text-clay leading-snug">
                    {post.excerpt}
                  </p>
                )}
                <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">
                  {post.conteudo}
                </div>
                {post.imagens && post.imagens && post.imagens.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {post.imagens.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`Imagem ${i + 1}`} className="w-full max-h-[500px] object-contain border border-border" />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </article>
      <Footer />
    </div>
  );
}