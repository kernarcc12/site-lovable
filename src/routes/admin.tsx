import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Nav } from "@/components/site/Nav";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Eiken Project" }],
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
  categoria: string;
  publicado: boolean;
  published_at: string | null;
  autor: string | null;
  capa_url: string | null;
  imagens: string[] | null;
};

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else { setIsAdmin(false); setChecking(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) checkAdmin(data.session.user.id);
      else setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function checkAdmin(uid: string) {
    setChecking(true);
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setChecking(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <div className="pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-5xl">
          {checking && <div className="text-muted-foreground">Verificando acesso…</div>}
          {!checking && !user && <AuthForm />}
          {!checking && user && !isAdmin && <NotAdmin email={user.email ?? ""} userId={user.id} onPromoted={() => checkAdmin(user.id)} />}
          {!checking && user && isAdmin && <Dashboard user={user} />}
        </div>
      </div>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
          data: { display_name: name },
        },
      });
      if (error) setErr(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto pt-12">
      <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        <span className="text-clay">§</span> Painel administrativo
      </div>
      <h1 className="font-display text-5xl mb-2">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
      <p className="text-muted-foreground mb-10">
        {mode === "login" ? "Acesse o painel para gerenciar postagens." : "Cadastre-se para administrar o site."}
      </p>
      <form onSubmit={submit} className="space-y-5">
        {mode === "signup" && (
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2 text-lg" />
          </div>
        )}
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2 text-lg" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2 text-lg" />
        </div>
        {err && <div className="text-destructive text-sm">{err}</div>}
        <button disabled={loading} type="submit" className="w-full bg-foreground text-background py-3 text-xs uppercase tracking-[0.2em] hover:bg-clay transition-colors disabled:opacity-50">
          {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="mt-6 text-sm text-muted-foreground hover:text-clay">
        {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
      </button>
    </div>
  );
}

function NotAdmin({ email, userId, onPromoted }: { email: string; userId: string; onPromoted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function tornarAdmin() {
    setLoading(true); setMsg("");
    // Permite virar admin se ainda não houver nenhum admin no sistema
    const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) {
      setMsg("Já existe um administrador. Peça para ele te dar acesso pelo banco de dados.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) setMsg(error.message);
    else onPromoted();
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto pt-12 text-center">
      <h1 className="font-display text-4xl mb-4">Acesso restrito</h1>
      <p className="text-muted-foreground mb-8">
        Sua conta <strong className="text-foreground">{email}</strong> não tem permissão de administrador.
      </p>
      <button onClick={tornarAdmin} disabled={loading} className="bg-clay text-paper px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-ochre hover:text-ink transition-colors disabled:opacity-50">
        {loading ? "Verificando…" : "Sou o primeiro admin do sistema"}
      </button>
      {msg && <div className="mt-6 text-sm text-destructive">{msg}</div>}
      <button onClick={() => supabase.auth.signOut()} className="block mx-auto mt-8 text-sm text-muted-foreground hover:text-clay">
        Sair
      </button>
    </div>
  );
}

function Dashboard({ user }: { user: User }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | "new" | null>(null);

  async function load() {
    const { data } = await supabase.from("posts").select("id, titulo, slug, categoria, publicado, published_at, autor").order("created_at", { ascending: false });
    setPosts(data ?? []);
  }
  useEffect(() => { load(); }, []);

  if (editing) return <PostEditor post={editing === "new" ? null : editing} user={user} onClose={() => { setEditing(null); load(); }} />;

  return (
    <>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
            <span className="text-clay">§</span> Painel
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">Postagens</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setEditing("new")} className="bg-clay text-paper px-5 py-3 text-xs uppercase tracking-[0.2em] hover:bg-ochre hover:text-ink transition-colors">
            + Nova postagem
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-clay">
            Sair
          </button>
        </div>
      </div>

      <div className="border-t border-border">
        {posts.length === 0 && <div className="py-20 text-center text-muted-foreground">Nenhuma postagem ainda. Crie a primeira!</div>}
        {posts.map((p) => (
          <div key={p.id} className="grid grid-cols-12 gap-4 items-center py-5 border-b border-border">
            <div className="col-span-12 md:col-span-6">
              <div className="font-display text-xl">{p.titulo}</div>
              <div className="text-xs text-muted-foreground font-mono mt-1">/{p.slug}</div>
            </div>
            <div className="col-span-4 md:col-span-2 text-xs uppercase tracking-wider">{p.categoria}</div>
            <div className="col-span-4 md:col-span-2">
              <span className={`text-xs uppercase tracking-wider px-2 py-1 ${p.publicado ? "bg-sertao/20 text-sertao" : "bg-muted text-muted-foreground"}`}>
                {p.publicado ? "Publicado" : "Rascunho"}
              </span>
            </div>
            <div className="col-span-4 md:col-span-2 flex justify-end gap-3">
              <button onClick={() => setEditing(p)} className="text-sm text-clay hover:underline">Editar</button>
              <button onClick={async () => {
                if (!confirm("Excluir esta postagem?")) return;
                await supabase.from("posts").delete().eq("id", p.id);
                load();
              }} className="text-sm text-destructive hover:underline">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-clay">→ Ver blog público</Link>
      </div>
    </>
  );
}

function PostEditor({ post, user, onClose }: { post: Post | null; user: User; onClose: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("noticia");
  const [autor, setAutor] = useState("");
  const [capaUrl, setCapaUrl] = useState<string | null>(null);
  const [imagens, setImagens] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [publicado, setPublicado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveKey] = useState(() => `draft-${post?.id || 'new'}`);

  useEffect(() => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      const draft = JSON.parse(saved);
      setTitulo(draft.titulo || post?.titulo || "");
      setSlug(draft.slug || post?.slug || "");
      setExcerpt(draft.excerpt || "");
      setConteudo(draft.conteudo || "");
      setCategoria(draft.categoria || post?.categoria || "noticia");
      setAutor(draft.autor || post?.autor || "");
      setCapaUrl(draft.capa_url ?? post?.capa_url ?? null);
      setImagens(draft.imagens || post?.imagens || []);
      setAudioUrl(draft.audio_url ?? null);
      setPublicado(draft.publicado ?? post?.publicado ?? false);
    } else if (post) {
      setTitulo(post.titulo);
      setSlug(post.slug);
      setCategoria(post.categoria);
      setAutor(post.autor || "");
      setPublicado(post.publicado);
    }
  }, [autoSaveKey, post]);

  useEffect(() => {
    if (!post) return;
    supabase.from("posts").select("excerpt, conteudo, capa_url, imagens, audio_url").eq("id", post.id).single().then(({ data }) => {
      if (data) {
        setExcerpt(data.excerpt ?? "");
        setConteudo(data.conteudo ?? "");
        setCapaUrl(data.capa_url);
        setImagens(data.imagens ?? []);
        setAudioUrl(data.audio_url ?? null);
        localStorage.setItem(autoSaveKey, JSON.stringify({
          titulo: post.titulo,
          slug: post.slug,
          excerpt: data.excerpt ?? "",
          conteudo: data.conteudo ?? "",
          categoria: post.categoria,
          autor: post.autor ?? "",
          capa_url: data.capa_url,
          imagens: data.imagens ?? [],
          publicado: post.publicado
        }));
      }
    });
  }, [post, autoSaveKey]);

  useEffect(() => {
    if (!post) setSlug(slugify(titulo));
  }, [titulo, post]);

  useEffect(() => {
    localStorage.setItem(autoSaveKey, JSON.stringify({ titulo, slug, excerpt, conteudo, categoria, autor, capa_url: capaUrl, imagens, audio_url: audioUrl, publicado }));
  }, [titulo, slug, excerpt, conteudo, categoria, autor, capaUrl, imagens, audioUrl, publicado, autoSaveKey]);

  async function uploadCapa(file: File) {
    setUploading(true); setErr("");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
    if (error) { setErr(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setCapaUrl(data.publicUrl);
    setUploading(false);
  }

  async function uploadAudio(file: File) {
    setUploading(true); setErr("");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/audio/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
    if (error) { setErr(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    setAudioUrl(data.publicUrl);
    setUploading(false);
  }

  async function uploadImagem(file: File): Promise<string | null> {
    setUploading(true); setErr("");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    console.log("Uploading to:", path);
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: false });
    console.log("Upload error:", error);
    if (error) { setErr(error.message); setUploading(false); return null; }
    const { data } = supabase.storage.from("post-images").getPublicUrl(path);
    console.log("Public URL:", data.publicUrl);
    setUploading(false);
    return data.publicUrl;
  }

  async function handleAddImagem(file: File) {
    const url = await uploadImagem(file);
    if (url) {
      setImagens([...imagens, url]);
    }
  }

  function removerImagem(index: number) {
    setImagens(imagens.filter((_, i) => i !== index));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setErr("");
    console.log("Saving images:", imagens);
    const payload = {
      titulo: titulo || post?.titulo || "",
      slug: slug || slugify(titulo) || "",
      excerpt: excerpt || null,
      conteudo: conteudo || "",
      categoria,
      autor: autor || null,
      capa_url: capaUrl,
      imagens: imagens.length > 0 ? imagens : null,
      audio_url: audioUrl,
      publicado,
      published_at: publicado ? (post?.published_at ?? new Date().toISOString()) : null,
      author_id: user.id,
    };
    console.log("Payload:", payload);
    const { error } = post
      ? await supabase.from("posts").update(payload).eq("id", post.id)
      : await supabase.from("posts").insert(payload);
    console.log("Save error:", error);
    setSaving(false);
    if (error) setErr(error.message);
    else {
      localStorage.removeItem(autoSaveKey);
      onClose();
    }
  }

  return (
    <form onSubmit={save}>
      <div className="flex items-center justify-between mb-10">
        <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:text-clay">← Voltar</button>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] cursor-pointer">
            <input type="checkbox" checked={publicado} onChange={(e) => setPublicado(e.target.checked)} className="accent-clay h-4 w-4" />
            Publicado
          </label>
          <button disabled={saving} type="submit" className="bg-clay text-paper px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-ochre hover:text-ink transition-colors disabled:opacity-50">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2 font-display text-3xl md:text-5xl" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Slug (URL)</label>
            <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2 font-mono text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2">
              <option value="noticia">Notícia</option>
              <option value="oficina">Oficina</option>
              <option value="evento">Evento</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Autor</label>
            <input value={autor} onChange={(e) => setAutor(e.target.value)} className="w-full bg-transparent border-b border-border focus:border-clay outline-none py-2" />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Imagem de capa</label>
          {capaUrl && (
            <img src={capaUrl} alt="capa" className="mb-3 max-h-64 w-auto object-cover border border-border" />
          )}
          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCapa(e.target.files[0])} className="block text-sm" />
          {uploading && <div className="text-xs text-muted-foreground mt-2">Enviando…</div>}
          {capaUrl && (
            <button type="button" onClick={() => setCapaUrl(null)} className="text-xs text-destructive hover:underline mt-2">
              Remover imagem
            </button>
          )}
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Galeria de imagens</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {imagens.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-24 object-cover border border-border" />
                <button type="button" onClick={() => removerImagem(i)} className="absolute top-1 right-1 bg-destructive text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] cursor-pointer text-clay hover:text-ochre transition-colors">
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAddImagem(e.target.files[0])} className="hidden" />
            + Adicionar imagem
          </label>
          {uploading && <div className="text-xs text-muted-foreground mt-2">Enviando…</div>}
        </div>

        {categoria === "podcast" && (
          <div className="bg-clay/10 border border-clay/30 rounded-lg p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-clay mb-4">🎙️ Arquivo de Áudio</div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Upload de áudio (MP3, WAV, OGG)</label>
              <input type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && uploadAudio(e.target.files[0])} className="block text-sm" />
              {uploading && <div className="text-xs text-muted-foreground mt-2">Enviando…</div>}
            </div>
            {audioUrl && (
              <div className="mt-4 p-4 bg-background rounded border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-clay/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-clay" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Áudio carregado</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{audioUrl.split('/').pop()}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => setAudioUrl(null)} className="text-xs text-destructive hover:underline">
                    Remover
                  </button>
                </div>
              </div>
            )}
            <div className="mt-4 text-xs text-muted-foreground">
              O áudio também pode ser adicionado no conteúdo usando uma URL direta (ex: https://exemplo.com/audio.mp3)
            </div>
          </div>
        )}

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Resumo (excerpt)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={300} className="w-full bg-transparent border border-border focus:border-clay outline-none p-3 italic" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">Conteúdo</label>
          <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)} required rows={20} className="w-full bg-transparent border border-border focus:border-clay outline-none p-4 leading-relaxed text-lg" />
        </div>

        {err && <div className="text-destructive text-sm">{err}</div>}
      </div>
    </form>
  );
}