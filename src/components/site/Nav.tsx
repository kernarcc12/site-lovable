import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-background/70 border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-full bg-clay group-hover:bg-ochre transition-colors" />
          <span className="font-display text-lg tracking-tight">
            Eiken<span className="text-clay">.</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Blog
          </Link>
          <Link to="/podcasts" className="text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Podcasts
          </Link>
          <Link to="/projetos" className="text-muted-foreground hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
            Projetos
          </Link>
          <a href="/#oficinas" className="text-muted-foreground hover:text-foreground transition-colors">Oficinas</a>
          <a href="/#agenda" className="text-muted-foreground hover:text-foreground transition-colors">Agenda</a>
          <a href="/#sobre" className="text-muted-foreground hover:text-foreground transition-colors">Sobre</a>
        </nav>
        <Link to="/admin" className="text-xs uppercase tracking-[0.2em] border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
          Admin
        </Link>
      </div>
    </header>
  );
}