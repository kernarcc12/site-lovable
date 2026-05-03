import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/projetos")({
  component: ProjetosPage,
});

const projetos = [
  {
    id: 1,
    titulo: "Rádio Comunitária",
    descricao: "Programa de rádio comunitária que leva informação e cultura aos rincões do sertão.",
    imagem: "/projetos/radio.jpg",
    tags: ["Comunicação", "Cultura"],
  },
  {
    id: 2,
    titulo: "Sartura Digital",
    descricao: "Espaço de inclusão digital para jovens e adultos da região, com cursos de informática básica.",
    imagem: "/projetos/sartura.jpg",
    tags: ["Educação", "Tecnologia"],
  },
  {
    id: 3,
    titulo: "Lab Cultural",
    descricao: "Laboratório de criação artística coletiva, reunindo música, teatro e artes visuais.",
    imagem: "/projetos/lab.jpg",
    tags: ["Arte", "Cultura"],
  },
  {
    id: 4,
    titulo: "Memória do Sertão",
    descricao: "Arquivo digital de histórias orais, fotos e documentos da comunidade.",
   imagem: "/projetos/memoria.jpg",
    tags: ["Memória", "Pesquisa"],
  },
  {
    id: 5,
    titulo: "Horta Comunitária",
    descricao: "Projeto de agricultura sustentável e segurança alimentar para famílias da zona rural.",
    imagem: "/projetos/horta.jpg",
    tags: ["Sustentabilidade", "Alimentação"],
  },
  {
    id: 6,
    titulo: "Jovens Comunicadores",
    descricao: "Formação de jovens comunicadores para produção de conteúdos digitais.",
    imagem: "/projetos/jovens.jpg",
    tags: ["Juventude", "Mídia"],
  },
];

function ProjetosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-32 md:pt-40 pb-20 px-6 lg:px-12 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-sertao blur-3xl" />
          <div className="absolute bottom-20 left-20 w-60 h-60 rounded-full bg-clay blur-3xl" />
        </div>
        <div className="mx-auto max-w-[1400px] relative">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6">
            <span className="text-clay">§</span> Ações Coletivas
          </div>
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9]">
            Projetos<span className="text-clay">.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Iniciativas que transformam a comunidade através da cultura, educação e comunicação.
            Cada projeto é uma semente de mudança no sertão.
          </p>
        </div>
      </section>

      <section className="py-20 md:py-32 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projetos.map((projeto) => (
              <div
                key={projeto.id}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border hover:border-clay/50 transition-all duration-500 hover:shadow-2xl hover:shadow-clay/10"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-clay/20 to-ochre/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-30 group-hover:scale-110 transition-transform duration-700">
                    ✦
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>
                <div className="p-6 -mt-4 relative">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {projeto.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] uppercase tracking-[0.15em] px-2 py-1 bg-clay/10 text-clay rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl leading-tight mb-3 group-hover:text-clay transition-colors">
                    {projeto.titulo}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{projeto.descricao}</p>
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-clay text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="uppercase tracking-[0.1em] text-xs">Saiba mais</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-secondary/30">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-clay mb-4">§ Parcerias</div>
          <h2 className="font-display text-3xl md:text-4xl mb-6">Construindo juntos</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nossos projetos são realizados em parceria com organizações locais, governos e comunidades.
            Acreditamos que a transformação happens através da colaboração.
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <div className="text-sm font-mono uppercase tracking-wider">SECULT</div>
            <div className="text-sm font-mono uppercase tracking-wider">UNESCO</div>
            <div className="text-sm font-mono uppercase tracking-wider">MDA</div>
            <div className="text-sm font-mono uppercase tracking-wider">FUNDARPE</div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}