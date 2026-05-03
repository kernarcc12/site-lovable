import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/podcasts")({
  component: PodcastsPage,
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

function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const slugMatch = path.match(/^\/podcasts\/([^/]+)$/);
    if (slugMatch) {
      const slug = slugMatch[1];
      supabase
        .from("podcasts")
        .select("id, titulo, excerpt, conteudo, capa_url, imagens, categoria, autor, published_at, audio_url")
        .eq("slug", slug)
        .eq("publicado", true)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setCurrentPodcast(data);
          setLoading(false);
        });
    } else {
      supabase
        .from("podcasts")
        .select("id, titulo, slug, excerpt, capa_url, categoria, autor, published_at, imagens, audio_url")
        .eq("publicado", true)
        .order("published_at", { ascending: false })
        .then(({ data }) => {
          setPodcasts(data ?? []);
          setLoading(false);
        });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <div className="pt-40 flex items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Carregando podcasts...</div>
        </div>
      </div>
    );
  }

  if (currentPodcast) {
    const audioUrl = currentPodcast.audio_url || extractAudioUrl(currentPodcast.conteudo);
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <article className="pt-32 md:pt-40 pb-20 px-6 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <button
              onClick={() => (window.location.href = "/podcasts")}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-clay transition-colors"
            >
              ← Voltar aos podcasts
            </button>

            <div className="mt-10 relative">
              {currentPodcast.capa_url ? (
                <div className="relative aspect-square max-w-md mx-auto">
                  <img
                    src={currentPodcast.capa_url}
                    alt={currentPodcast.titulo}
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                  />
                  {audioUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePlay(currentPodcast.id, audioUrl)}
                        className="w-20 h-20 rounded-full bg-clay/90 hover:bg-clay flex items-center justify-center transition-all transform hover:scale-110"
                      >
                        <svg
                          className="w-10 h-10 text-paper ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-clay/30 to-ochre/30 rounded-lg flex items-center justify-center">
                  <div className="text-8xl text-clay/50">🎙️</div>
                </div>
              )}
            </div>

            <audio
              id={`audio-${currentPodcast.id}`}
              src={audioUrl || undefined}
              onEnded={() => setPlaying(null)}
              className="hidden"
            />

            {audioUrl && (
              <div className="mt-8 sticky bottom-6 z-10">
                <div className="bg-ink/95 backdrop-blur-md rounded-full px-6 py-4 flex items-center gap-4 shadow-xl">
                  <button
                    onClick={() => handlePlay(currentPodcast.id, audioUrl)}
                    className="w-12 h-12 rounded-full bg-clay hover:bg-ochre flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {playing === currentPodcast.id ? (
                      <svg className="w-5 h-5 text-paper" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-paper ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-paper text-sm font-medium truncate">{currentPodcast.titulo}</div>
                    <div className="text-paper/60 text-xs truncate">{currentPodcast.autor || "Lovab"}</div>
                  </div>
                  <div className="text-paper/60 text-xs">
                    {playing === currentPodcast.id ? "Reproduzindo..." : "Pausado"}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 space-y-8">
              <div className="text-xs uppercase tracking-[0.3em] text-clay font-mono">Podcast</div>
              <h1 className="font-display text-4xl md:text-5xl leading-[0.95] tracking-tight">
                {currentPodcast.titulo}
              </h1>

              {currentPodcast.excerpt && (
                <p className="text-xl md:text-2xl italic text-clay leading-snug border-l-4 border-clay pl-6">
                  {currentPodcast.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground border-y border-border py-4">
                {currentPodcast.autor && <span>Por {currentPodcast.autor}</span>}
                {currentPodcast.published_at && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span>
                      {new Date(currentPodcast.published_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </>
                )}
              </div>

              <div className="prose prose-lg max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap text-lg">
                {currentPodcast.conteudo.replace(/https:\/\/[^\s]+\.(mp3|wav|ogg|m4a)/gi, "").trim()}
              </div>

              {currentPodcast.imagens && currentPodcast.imagens.length > 0 && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {currentPodcast.imagens.map((url: string, i: number) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Imagem ${i + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </article>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-32 md:pt-40 pb-20 px-6 lg:px-12 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-clay blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-ochre blur-3xl" />
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
          {podcasts.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl text-clay/40 font-display mb-4">🎙️</div>
              <p className="text-muted-foreground text-lg">Nenhum podcast publicado ainda.</p>
              <p className="text-muted-foreground/60 text-sm mt-2">Em breve, novas episódios!</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((p) => {
              const audioUrl = p.audio_url || extractAudioUrl(p.conteudo);
              return (
                <div
                  key={p.id}
                  className="group block cursor-pointer"
                  onClick={() => (window.location.href = `/podcasts/${p.slug}`)}
                >
                  <div className="relative overflow-hidden aspect-square mb-5 bg-secondary rounded-xl">
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