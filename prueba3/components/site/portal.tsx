"use client"

import { useEffect, useId, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { Session } from "@supabase/supabase-js"
import { ArrowUpRight, Loader2, LogOut } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/ui/pill"
import { Tag } from "@/components/ui/tag"
import { wa } from "@/lib/site"
import { authErrorMessage, supabase, type ClientProject, type ProjectStatus } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { LogoN } from "./logo"
import { gentle } from "./motion"

const STAGES: ProjectStatus[] = ["diseño", "desarrollo", "revisión", "publicado"]
const STAGE_LABEL: Record<ProjectStatus, string> = {
  diseño: "Diseño",
  desarrollo: "Desarrollo",
  revisión: "Revisión",
  publicado: "Publicado",
}

type View = "loading" | "signed-out" | "recovery" | "ready"

export function Portal() {
  const router = useRouter()
  const [view, setView] = useState<View>("loading")
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) {
      router.replace("/#acceso")
      return
    }
    // detectSessionInUrl finishes OAuth / reset-password returns before getSession resolves.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setView((v) => (v === "recovery" ? v : data.session ? "ready" : "signed-out"))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === "PASSWORD_RECOVERY") setView("recovery")
      else if (event === "SIGNED_OUT") setView("signed-out")
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (view === "signed-out") router.replace("/#acceso")
  }, [view, router])

  async function signOut() {
    await supabase?.auth.signOut()
    router.replace("/#acceso")
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-4 md:px-8">
          <a href="../" className="flex items-center gap-3" aria-label="Volver a NextDigital">
            <LogoN className="text-[28px]" />
            <span className="font-display text-lg font-bold tracking-tight">Portal de clientes</span>
          </a>
          {session && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut} className="press rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background">
                <LogOut aria-hidden /> Cerrar sesión
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
        {(view === "loading" || view === "signed-out") && (
          <p className="flex items-center gap-2 text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando tu portal…
          </p>
        )}
        {view === "recovery" && <NewPassword onDone={() => setView("ready")} />}
        {view === "ready" && session && <Projects session={session} />}
      </main>
    </div>
  )
}

/* ── Projects ─────────────────────────────────────────────── */

function Projects({ session }: { session: Session }) {
  const [projects, setProjects] = useState<ClientProject[] | null>(null)
  const [error, setError] = useState("")
  const name = (session.user.user_metadata?.full_name as string | undefined)?.split(" ")[0]

  useEffect(() => {
    // RLS on `projects` only returns rows whose client_id is the signed-in user.
    supabase!
      .from("projects")
      .select("id, name, plan, status, progress, next_step, site_url, updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("No pudimos cargar tus proyectos. Recarga la página o escríbenos.")
        else setProjects((data ?? []) as ClientProject[])
      })
  }, [])

  return (
    <>
      <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
        Tu proyecto
      </p>
      <h1 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.02]">Hola{name ? `, ${name}` : ""}.</h1>

      {error && <p className="mt-8 text-destructive" role="alert">{error}</p>}

      {!projects && !error && (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando proyectos…
        </p>
      )}

      {projects && projects.length === 0 && (
        <div className="mt-8 max-w-xl rounded-3xl border border-border bg-card p-8">
          <p className="text-lg font-semibold">Todavía no hay proyectos asociados a tu cuenta.</p>
          <p className="mt-2 text-ink-2">Si ya contrataste con nosotros, escríbenos y lo vinculamos a tu correo.</p>
          <WhatsAppButton text={`Hola NextDigital! Inicié sesión con ${session.user.email} y no veo mi proyecto.`} />
        </div>
      )}

      {projects && projects.length > 0 && (
        <ul className="mt-10 grid gap-6">
          {projects.map((p) => (
            <motion.li key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={gentle}>
              <ProjectCard project={p} />
            </motion.li>
          ))}
        </ul>
      )}
    </>
  )
}

function ProjectCard({ project: p }: { project: ClientProject }) {
  const stage = Math.max(0, STAGES.indexOf(p.status))
  const progress = Math.min(100, Math.max(0, p.progress))
  const updated = new Date(p.updated_at).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" })

  return (
    <article className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {p.plan && <Tag>Plan {p.plan}</Tag>}
            <Pill tone={p.status === "publicado" ? "success" : "brand"}>{STAGE_LABEL[p.status] ?? p.status}</Pill>
          </div>
          <h2 className="mt-3 text-3xl font-bold">{p.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Actualizado el {updated}</p>
        </div>
        {p.site_url && (
          <a href={p.site_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 border-b-[1.5px] border-current pb-0.5 text-sm font-semibold hover:text-brand">
            Ver sitio <ArrowUpRight className="size-4" aria-hidden />
          </a>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Avance</span>
          <span className="font-display text-lg font-bold">{progress}%</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-paper-2"
          role="progressbar"
          aria-label="Avance del proyecto"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div className="h-full rounded-full bg-orange" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={gentle} />
        </div>
      </div>

      <ol className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Etapas">
        {STAGES.map((s, i) => (
          <li
            key={s}
            aria-current={i === stage ? "step" : undefined}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              i < stage && "border-border bg-paper-2 text-ink-2",
              i === stage && "border-foreground bg-foreground text-background",
              i > stage && "border-dashed border-border text-muted-foreground"
            )}
          >
            <span className="block font-mono text-xs opacity-70">0{i + 1}</span>
            <span className="font-semibold">{STAGE_LABEL[s]}</span>
          </li>
        ))}
      </ol>

      {p.next_step && (
        <div className="mt-8 rounded-2xl bg-paper-2 p-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Siguiente paso</p>
          <p className="mt-1 text-[17px]">{p.next_step}</p>
        </div>
      )}

      <WhatsAppButton text={`Hola NextDigital! Tengo una consulta sobre mi proyecto ${p.name}.`} label="Solicitar un cambio" />
    </article>
  )
}

function WhatsAppButton({ text, label = "Escribir por WhatsApp" }: { text: string; label?: string }) {
  return (
    <a
      href={wa(text)}
      target="_blank"
      rel="noopener noreferrer"
      className="press mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-colors hover:bg-brand"
    >
      <FaWhatsapp aria-hidden /> {label}
    </a>
  )
}

/* ── Password recovery ────────────────────────────────────── */

function NewPassword({ onDone }: { onDone: () => void }) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password"))
    if (password !== String(form.get("confirm"))) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setBusy(true)
    const { error } = await supabase!.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(authErrorMessage(error))
    else onDone()
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      <h1 className="text-3xl font-bold">Crea una contraseña nueva</h1>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-new`}>Nueva contraseña</Label>
        <Input id={`${id}-new`} name="password" type="password" autoComplete="new-password" minLength={8} required className="h-12 rounded-xl" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-confirm`}>Repite la contraseña</Label>
        <Input id={`${id}-confirm`} name="confirm" type="password" autoComplete="new-password" minLength={8} required className="h-12 rounded-xl" />
      </div>
      <Button type="submit" size="lg" disabled={busy} className="press h-12 rounded-full font-semibold hover:bg-brand">
        {busy && <Loader2 className="animate-spin" aria-hidden />} Guardar contraseña
      </Button>
      <p role="alert" className="min-h-5 text-sm text-destructive">{error}</p>
    </form>
  )
}
