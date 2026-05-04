import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
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
  const [progress, setProgress] = useState<Record<string, number>>({});

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

  const handlePlay = (e: React.MouseEvent, id: string, audioUrl: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    if (!audio) return;
    
    if (playing === id) {
      audio.pause();
      setPlaying(null);
    } else {
      document.querySelectorAll('audio').forEach((a) => (a as HTMLAudioElement).pause());
      audio.play();
      setPlaying(id);
    }
  };

  const handleTimeUpdate = (id: string) => {
    const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
    if (audio) {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(prev => ({ ...prev, [id]: percent }));
    }
  };

  const handleEnded = () => {
    setPlaying(null);
    setProgress({});
  };

  const extractAudioUrl = (conteudo: string): string | null => {
    const match = conteudo.match(/https:\/\/[^\s]+\.(mp3|wav|ogg|m4a)/i);
    return match ? match[0] : null;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            Projetos<span className="text-clay">.</span>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((p) => {
              const audioUrl = p.audio_url || extractAudioUrl(p.conteudo);
              const isPlaying = playing === p.id;
              return (
                <div
                  key={p.id}
                  className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-clay/40 transition-all duration-300 hover:shadow-xl hover:shadow-clay/5 cursor-pointer"
                  onClick={() => (window.location.href = `/podcasts/${p.slug}`)}
                >
                  <audio
                    id={`audio-${p.id}`}
                    src={audioUrl || undefined}
                    onTimeUpdate={() => handleTimeUpdate(p.id)}
                    onEnded={handleEnded}
                  />
                  
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {p.capa_url ? (
                      <img
                        src={p.capa_url}
                        alt={p.titulo}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-clay/30 via-ochre/20 to-clay/10 flex items-center justify-center">
                        <div className="text-8xl">🎙️</div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    
                    
                    <div className="absolute top-4 left-4">
                      <span className="bg-clay/90 text-paper text-xs font-mono px-3 py-1.5 uppercase tracking-wider rounded-full backdrop-blur-sm">
                        🎧 Podcast
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="font-mono text-clay/80">
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                      {p.autor && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span>{p.autor}</span>
                        </>
                      )}
                    </div>
                    
                    <h2 className="font-display text-xl md:text-2xl leading-tight mb-3 group-hover:text-clay transition-colors line-clamp-2">
                      {p.titulo}
                    </h2>
                    
                    {p.excerpt && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {p.excerpt}
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                      {audioUrl && (
                        <a href="https://orizonn.com.br/blog/o-uso-da-ia-na-producao-cultural" target="_blank" rel="noopener noreferrer" className="text-xs text-clay/70 flex items-center gap-1 hover:text-clay transition-colors">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                          </svg>
                          Artigo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}