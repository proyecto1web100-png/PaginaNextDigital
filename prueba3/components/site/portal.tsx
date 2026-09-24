"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import type { Session } from "@supabase/supabase-js"
import { ArrowUpRight, Clock, Loader2, LogOut, Send } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/ui/pill"
import { Tag } from "@/components/ui/tag"
import { wa } from "@/lib/site"
import { STAGES, STAGE_LABEL, redirectError, supabase, type AccessStatus, type ClientProject, type OwnRequest } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { AdminPanel } from "./admin"
import { FilesPanel } from "./files"
import { LogoN } from "./logo"
import { gentle } from "./motion"

type Role = "loading" | "admin" | "error" | AccessStatus

// Captured when the module loads, before Supabase tidies the URL after the Google return.
const INITIAL_RETURN_ERROR = typeof window === "undefined" ? null : redirectError()
const noopSubscribe = () => () => {}

export function Portal() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [role, setRole] = useState<Role>("loading")
  const [request, setRequest] = useState<OwnRequest | null>(null)
  // Shown only after hydration so the static HTML and the first client render match.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const returnError = hydrated ? INITIAL_RETURN_ERROR : null

  useEffect(() => {
    if (!supabase) {
      router.replace("/#acceso")
      return
    }
    // detectSessionInUrl completes the Google return (?code=…) before getSession resolves.
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    if (session === null && !returnError) router.replace("/#acceso")
    if (!session || !supabase) return
    const uid = session.user.id
    ;(async () => {
      const { data: admin, error: adminError } = await supabase.from("admins").select("user_id").eq("user_id", uid).maybeSingle()
      if (admin) return setRole("admin")
      const { data: req, error: reqError } = await supabase
        .from("access_requests")
        .select("status, full_name, business_name, submitted_at")
        .eq("user_id", uid)
        .maybeSingle()
      // A database/permission error must not look like "pending approval".
      if (adminError || reqError) {
        console.error("Portal role lookup failed", adminError ?? reqError)
        return setRole("error")
      }
      setRequest((req as OwnRequest | null) ?? null)
      setRole((req?.status as AccessStatus | undefined) ?? "pending")
    })()
  }, [session, router, returnError])

  async function signOut() {
    await supabase?.auth.signOut()
    router.replace("/#acceso")
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-3 px-4 md:px-8">
          <a href="../" className="flex items-center gap-3" aria-label="Volver a NextDigital">
            <LogoN className="text-[28px]" />
            <span className="font-display text-lg font-bold tracking-tight">
              {role === "admin" ? "Panel de NextDigital" : "Portal de clientes"}
            </span>
          </a>
          {session && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.email}</span>
              <Button variant="outline" size="sm" onClick={signOut} className="press rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background">
                <LogOut aria-hidden /> Salir
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
        {returnError && !session && (
          <div className="max-w-xl rounded-3xl border border-border bg-card p-6 md:p-8" role="alert">
            <p className="text-lg font-semibold">{returnError}</p>
            <a href="../#acceso" className="press mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:bg-brand">
              Volver a intentar
            </a>
          </div>
        )}
        {!returnError && (!session || role === "loading") && (
          <p className="flex items-center gap-2 text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando tu portal…
          </p>
        )}
        {session && role === "admin" && <AdminPanel selfId={session.user.id} />}
        {session && role === "pending" &&
          (request?.submitted_at ? (
            <Pending session={session} request={request} />
          ) : (
            <RequestForm session={session} initialName={request?.full_name ?? fullName(session)} onSubmitted={setRequest} />
          ))}
        {session && role === "rejected" && <Rejected />}
        {session && role === "error" && (
          <div className="max-w-xl rounded-3xl border border-border bg-card p-6 md:p-8" role="alert">
            <p className="text-lg font-semibold">No pudimos cargar tu acceso.</p>
            <p className="mt-2 text-ink-2">Recarga la página en un momento. Si sigue igual, escríbenos.</p>
            <WhatsAppButton text={`Hola NextDigital! No puedo entrar al portal con ${session.user.email}.`} />
          </div>
        )}
        {session && role === "approved" && <Projects session={session} name={request?.full_name} />}
      </main>
    </div>
  )
}

const fullName = (s: Session) => ((s.user.user_metadata?.full_name ?? s.user.user_metadata?.name) as string | undefined) ?? ""
const firstOf = (name?: string | null) => name?.trim().split(/\s+/)[0] ?? ""

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
      {children}
    </p>
  )
}

/* ── Pending / rejected ───────────────────────────────────── */

/* ── Request form (first visit) ───────────────────────────── */

function RequestForm({
  session,
  initialName,
  onSubmitted,
}: {
  session: Session
  initialName: string
  onSubmitted: (r: OwnRequest) => void
}) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const full_name = String(f.get("full_name")).trim()
    const business_name = String(f.get("business_name")).trim()
    setBusy(true)
    setError("")
    const { error } = await supabase!.rpc("submit_access_request", { p_full_name: full_name, p_business_name: business_name || null })
    setBusy(false)
    if (error) {
      setError("No pudimos enviar tu solicitud. Revisa tu nombre e inténtalo de nuevo.")
      return
    }
    onSubmitted({ status: "pending", full_name, business_name: business_name || null, submitted_at: new Date().toISOString() })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={gentle} className="max-w-xl">
      <Eyebrow>Solicitud de acceso</Eyebrow>
      <h1 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.02]">Completa tu solicitud.</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
        Así NextDigital sabe quién eres y a qué página vincular tu acceso con{" "}
        <span className="font-semibold text-foreground">{session.user.email}</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-3xl border border-border bg-card p-6 md:p-8">
        <div className="grid gap-2">
          <Label htmlFor={`${id}-name`}>Tu nombre</Label>
          <Input
            id={`${id}-name`}
            name="full_name"
            required
            maxLength={120}
            autoComplete="name"
            defaultValue={initialName}
            placeholder="Nombre y apellido"
            className="h-12 rounded-xl bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${id}-business`}>
            Nombre de tu negocio <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id={`${id}-business`}
            name="business_name"
            maxLength={120}
            autoComplete="organization"
            placeholder="Ej. Kenias Studio"
            className="h-12 rounded-xl bg-background/60"
          />
        </div>
        <Button type="submit" size="lg" disabled={busy} className="press h-12 rounded-full text-base font-semibold hover:bg-brand">
          {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />} Enviar solicitud
        </Button>
        <p role="alert" className="min-h-5 text-sm text-destructive">{error}</p>
      </form>
    </motion.div>
  )
}

/* ── Submitted, waiting for approval ──────────────────────── */

function Pending({ session, request }: { session: Session; request: OwnRequest }) {
  const name = firstOf(request.full_name)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={gentle} className="max-w-xl">
      <Eyebrow>Acceso en revisión</Eyebrow>
      <h1 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.02]">Gracias{name ? `, ${name}` : ""}.</h1>
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-8">
        <Pill tone="brand"><Clock className="size-3" aria-hidden /> Pendiente de aprobación</Pill>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2">
          Recibimos tu solicitud con <span className="font-semibold text-foreground">{session.user.email}</span>. En cuanto
          NextDigital la apruebe y la vincule a tu página web, verás aquí el avance de tu proyecto.
        </p>
        <dl className="mt-5 grid gap-3 rounded-2xl bg-paper-2 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-semibold">{request.full_name}</dd>
          </div>
          {request.business_name && (
            <div>
              <dt className="text-muted-foreground">Negocio</dt>
              <dd className="font-semibold">{request.business_name}</dd>
            </div>
          )}
        </dl>
        <WhatsAppButton
          text={`Hola NextDigital! Soy ${request.full_name}${request.business_name ? ` de ${request.business_name}` : ""} y acabo de solicitar acceso al portal con ${session.user.email}.`}
          label="Avisar por WhatsApp"
        />
      </div>
    </motion.div>
  )
}

function Rejected() {
  return (
    <div className="max-w-xl">
      <Eyebrow>Acceso no disponible</Eyebrow>
      <h1 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.02]">No encontramos un proyecto para esta cuenta.</h1>
      <p className="mt-5 text-[17px] text-ink-2">Si crees que es un error, escríbenos y lo revisamos.</p>
      <WhatsAppButton text="Hola NextDigital! Mi acceso al portal fue rechazado y creo que es un error." />
    </div>
  )
}

/* ── Approved client ──────────────────────────────────────── */

function Projects({ session, name: savedName }: { session: Session; name?: string | null }) {
  const [projects, setProjects] = useState<ClientProject[] | null>(null)
  const [error, setError] = useState("")
  const name = firstOf(savedName) || firstOf(fullName(session))

  useEffect(() => {
    // RLS only returns this client's rows, and only once their access is approved.
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
      <Eyebrow>Tu proyecto</Eyebrow>
      <h1 className="mt-4 text-[clamp(2.3rem,5vw,4rem)] font-bold leading-[1.02]">Hola{name ? `, ${name}` : ""}.</h1>

      {error && <p className="mt-8 text-destructive" role="alert">{error}</p>}
      {!projects && !error && (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando proyectos…
        </p>
      )}
      {projects && projects.length === 0 && (
        <div className="mt-8 max-w-xl rounded-3xl border border-border bg-card p-8">
          <p className="text-lg font-semibold">Tu acceso está aprobado, pero aún no hay un proyecto vinculado.</p>
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
      {projects && (
        <div className="mt-10">
          <FilesPanel userId={session.user.id} canUpload />
        </div>
      )}
    </>
  )
}

export function ProjectCard({ project: p, children }: { project: ClientProject; children?: React.ReactNode }) {
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
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-label="Avance del proyecto" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
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

      {children ?? <WhatsAppButton text={`Hola NextDigital! Tengo una consulta sobre mi proyecto ${p.name}.`} label="Solicitar un cambio" />}
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
