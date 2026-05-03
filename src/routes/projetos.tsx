import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projetos")({
  component: ProjetosPage,
});

type Podcast = {
  id: string;
  titulo: string;
  slug: string;
  excerpt: string | null;
  conteudo: string;
  capa_url: string | null;
  categoria: string;
  autor: string | null;
  published_at: string | null;
  imagens: string[] | null;
  audio_url: string | null;
};

function ProjetosPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("podcasts")
      .select("id, titulo, slug, excerpt, capa_url, categoria, autor, published_at, imagens, audio_url")
      .eq("publicado", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPodcasts(data ?? []);
        setLoading(false);
      });
  }, []);

  const handlePlay = (id: string, audioUrl: string) => {
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    if (audio) {
      if (playing === id) {
        audio.pause();
        setPlaying(null);
      } else {
        document.querySelectorAll('audio').forEach((a) => (a as HTMLAudioElement).pause());
        audio.play();
        setPlaying(id);
      }
    }
  };

  const extractAudioUrl = (conteudo: string): string | null => {
    const match = conteudo.match(/https:\/\/[^\s]+\.(mp3|wav|ogg|m4a)/i);
    return match ? match[0] : null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-32 md:pt-40 pb-20 px-6 lg:px-12 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1920&q=80"
            alt="Podcast"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        <div className="mx-auto max-w-[1400px] relative">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            <span className="text-clay">§</span> Frequência Sertaneja
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9]">
            Podcasts<span className="text-clay">.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Vozes do sertão, histórias contadas e sons que ecoam na caatinga.
            Um projeto de comunicação comunitária.
          </p>

          <div className="mt-12 flex items-center gap-3">
            <div className="flex items-center gap-2 text-clay">
              <div className="w-3 h-3 rounded-full bg-clay animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em]">
                {podcasts.length} episódio{podcasts.length !== 1 ? "s" : ""} disponível{podcasts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          {loading && <div className="text-muted-foreground">Carregando...</div>}
          {!loading && podcasts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl text-clay/40 font-display mb-4">🎙️</div>
              <p className="text-muted-foreground text-lg">Nenhum podcast publicado ainda.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Em breve, novos episódios!</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((p) => {
              const audioUrl = p.audio_url || extractAudioUrl(p.conteudo);
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-clay/50 transition-all duration-500 hover:shadow-2xl hover:shadow-clay/10"
                  onClick={() => (window.location.href = `/podcasts/${p.slug}`)}
                >
                  <div className="relative aspect-square mb-5 bg-secondary rounded-xl overflow-hidden">
                    {p.capa_url ? (
                      <img
                        src={p.capa_url}
                        alt={p.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-clay/20 to-ochre/20 flex items-center justify-center text-6xl text-clay/40">
                        🎙️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {audioUrl && (
                      <div className="absolute bottom-4 right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlay(p.id, audioUrl);
                          }}
                          className="w-12 h-12 rounded-full bg-clay/90 hover:bg-clay flex items-center justify-center transition-all transform hover:scale-110 shadow-lg"
                        >
                          {playing === p.id ? (
                            <svg className="w-5 h-5 text-paper" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-paper ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-clay text-paper text-xs px-3 py-1.5 font-mono uppercase tracking-wider rounded-full">
                      🎧 Podcast
                    </div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : ""}
                    {p.autor ? ` · ${p.autor}` : ""}
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl leading-tight group-hover:text-clay transition-colors line-clamp-2">
                    {p.titulo}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-2">{p.excerpt}</p>
                  )}
                  {audioUrl && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-clay">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                      <span> Disponível para reprodução</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <audio onEnded={() => setPlaying(null)} />

      <Footer />
    </div>
  );
}