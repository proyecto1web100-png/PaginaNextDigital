"use client"

import { useCallback, useEffect, useId, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/ui/pill"
import { PLANS, STAGES, STAGE_LABEL, supabase, type AccessRequest, type ClientProject } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { ProjectCard } from "./portal"
import { gentle, spring } from "./motion"

type ProjectRow = ClientProject & { client_id: string }

const fieldClass = "h-11 rounded-xl bg-background/60"
const selectClass = "h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

async function fetchAll() {
  const [r, p] = await Promise.all([
    supabase!.from("access_requests").select("user_id, email, full_name, avatar_url, status, created_at").order("created_at", { ascending: false }),
    supabase!.from("projects").select("id, client_id, name, plan, status, progress, next_step, site_url, updated_at").order("updated_at", { ascending: false }),
  ])
  if (r.error || p.error) return null
  return { requests: r.data as AccessRequest[], projects: p.data as ProjectRow[] }
}

export function AdminPanel() {
  const [requests, setRequests] = useState<AccessRequest[] | null>(null)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [error, setError] = useState("")

  const apply = useCallback((res: Awaited<ReturnType<typeof fetchAll>>) => {
    if (!res) {
      setError("No pudimos cargar los datos. Recarga la página.")
      return
    }
    setRequests(res.requests)
    setProjects(res.projects)
  }, [])

  const load = useCallback(() => {
    fetchAll().then(apply)
  }, [apply])

  useEffect(() => {
    let alive = true
    fetchAll().then((res) => alive && apply(res))
    return () => {
      alive = false
    }
  }, [apply])

  if (error) return <p className="text-destructive" role="alert">{error}</p>
  if (!requests)
    return (
      <p className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando solicitudes…
      </p>
    )

  const pending = requests.filter((r) => r.status === "pending")
  const approved = requests.filter((r) => r.status === "approved")
  const rejected = requests.filter((r) => r.status === "rejected")

  return (
    <div className="grid gap-16">
      <section aria-labelledby="pending-title">
        <div className="flex items-center gap-3">
          <h1 id="pending-title" className="text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Solicitudes</h1>
          {pending.length > 0 && (
            <Badge className="h-6 min-w-6 rounded-full bg-orange px-2 font-mono text-sm tabular-nums text-foreground" aria-label={`${pending.length} pendientes`}>
              {pending.length}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-ink-2">Personas que iniciaron sesión con Google y esperan acceso a su página.</p>
        {pending.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">No hay solicitudes pendientes.</p>
        ) : (
          <ul className="mt-6 grid gap-4">
            <AnimatePresence initial={false}>
              {pending.map((r) => (
                <RequestCard key={r.user_id} request={r} onChanged={load} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>

      <section aria-labelledby="clients-title">
        <h2 id="clients-title" className="text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Clientes</h2>
        <p className="mt-3 text-ink-2">Actualiza la etapa, el avance y el siguiente paso. El cliente lo ve al instante en su portal.</p>
        {approved.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">Todavía no hay clientes aprobados.</p>
        ) : (
          <div className="mt-6 grid gap-10">
            {approved.map((r) => {
              const own = projects.filter((p) => p.client_id === r.user_id)
              return (
                <div key={r.user_id}>
                  <Person request={r} />
                  <div className="mt-4 grid gap-4">
                    {own.map((p) => (
                      <ProjectCard key={p.id} project={p}>
                        <ProjectEditor project={p} onSaved={load} />
                      </ProjectCard>
                    ))}
                    <AddProject userId={r.user_id} onAdded={load} hasProjects={own.length > 0} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {rejected.length > 0 && (
        <section aria-labelledby="rejected-title">
          <h2 id="rejected-title" className="text-2xl font-bold">Rechazadas</h2>
          <ul className="mt-4 grid gap-3">
            {rejected.map((r) => (
              <RequestCard key={r.user_id} request={r} onChanged={load} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Person({ request: r }: { request: AccessRequest }) {
  return (
    <div className="flex items-center gap-3">
      {r.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={r.avatar_url} alt="" referrerPolicy="no-referrer" className="size-10 rounded-full border border-border object-cover" />
      ) : (
        <span className="grid size-10 place-items-center rounded-full bg-paper-2 font-display font-bold">
          {(r.full_name ?? r.email).charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-semibold">{r.full_name ?? r.email}</p>
        <p className="truncate text-sm text-muted-foreground">{r.email}</p>
      </div>
    </div>
  )
}

/* ── Approve / reject ─────────────────────────────────────── */

function RequestCard({ request: r, onChanged }: { request: AccessRequest; onChanged: () => void }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<null | "approve" | "reject">(null)
  const [error, setError] = useState("")
  const date = new Date(r.created_at).toLocaleString("es-HN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })

  async function reject() {
    setBusy("reject")
    const { error } = await supabase!.rpc("reject_client", { p_user: r.user_id })
    setBusy(null)
    if (error) setError("No se pudo rechazar. Inténtalo de nuevo.")
    else onChanged()
  }

  async function approve(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy("approve")
    setError("")
    const { error } = await supabase!.rpc("approve_client", {
      p_user: r.user_id,
      p_name: String(f.get("name")).trim(),
      p_plan: String(f.get("plan")),
      p_site_url: String(f.get("site_url")).trim(),
    })
    setBusy(null)
    if (error) setError("No se pudo aprobar. Inténtalo de nuevo.")
    else onChanged()
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: spring }}
      exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }}
      className={cn("rounded-3xl border border-border bg-card p-5 md:p-6", r.status === "rejected" && "opacity-70")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Person request={r} />
          <span className="hidden text-sm text-muted-foreground md:inline">{date}</span>
        </div>
        {!open && (
          <div className="flex gap-2">
            {r.status === "pending" && (
              <Button variant="outline" onClick={reject} disabled={busy !== null} className="press rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background">
                {busy === "reject" ? <Loader2 className="animate-spin" aria-hidden /> : <X aria-hidden />} Rechazar
              </Button>
            )}
            <Button onClick={() => setOpen(true)} className="press rounded-full bg-orange font-semibold text-foreground hover:bg-foreground hover:text-background">
              <Check aria-hidden /> Aprobar y vincular
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.form
            onSubmit={approve}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: gentle }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.12, ease: "easeIn" } }}
            className="overflow-hidden"
          >
            <ApproveFields />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button type="submit" disabled={busy !== null} className="press rounded-full font-semibold hover:bg-brand">
                {busy === "approve" && <Loader2 className="animate-spin" aria-hidden />} Aprobar acceso
              </Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Cancelar</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </motion.li>
  )
}

function ApproveFields() {
  const id = useId()
  return (
    <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-3">
      <div className="grid gap-2">
        <Label htmlFor={`${id}-name`}>Nombre del proyecto</Label>
        <Input id={`${id}-name`} name="name" required placeholder="Ej. Kenias Studio" className={fieldClass} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-plan`}>Plan</Label>
        <select id={`${id}-plan`} name="plan" defaultValue="Intermedio" className={selectClass}>
          {PLANS.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-url`}>URL de su página</Label>
        <Input id={`${id}-url`} name="site_url" type="url" placeholder="https://…" className={fieldClass} />
      </div>
    </div>
  )
}

/* ── Projects ─────────────────────────────────────────────── */

function AddProject({ userId, onAdded, hasProjects }: { userId: string; onAdded: () => void; hasProjects: boolean }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    const { error } = await supabase!.from("projects").insert({
      client_id: userId,
      name: String(f.get("name")).trim(),
      plan: String(f.get("plan")),
      site_url: String(f.get("site_url")).trim() || null,
    })
    setBusy(false)
    if (error) setError("No se pudo crear el proyecto.")
    else {
      setOpen(false)
      onAdded()
    }
  }

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-fit text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        + {hasProjects ? "Vincular otra página" : "Vincular una página"}
      </button>
    )

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-dashed border-border p-5">
      <ApproveFields />
      <div className="mt-5 flex gap-2">
        <Button type="submit" disabled={busy} className="press rounded-full font-semibold hover:bg-brand">
          {busy && <Loader2 className="animate-spin" aria-hidden />} Vincular
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-full">Cancelar</Button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </form>
  )
}

function ProjectEditor({ project: p, onSaved }: { project: ProjectRow; onSaved: () => void }) {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(p.progress)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    setSaved(false)
    setError("")
    const { error } = await supabase!
      .from("projects")
      .update({
        status: String(f.get("status")),
        progress,
        next_step: String(f.get("next_step")).trim() || null,
        site_url: String(f.get("site_url")).trim() || null,
      })
      .eq("id", p.id)
    setBusy(false)
    if (error) setError("No se pudo guardar.")
    else {
      setSaved(true)
      onSaved()
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-2xl border border-border p-5 md:grid-cols-2">
      <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground md:col-span-2">Editar proyecto</p>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-status`}>Etapa</Label>
        <select id={`${id}-status`} name="status" defaultValue={p.status} className={selectClass}>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${id}-progress`}>Avance: {progress}%</Label>
        <input
          id={`${id}-progress`}
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="h-11 w-full accent-orange"
        />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor={`${id}-next`}>Siguiente paso</Label>
        <Input id={`${id}-next`} name="next_step" defaultValue={p.next_step ?? ""} placeholder="Ej. Enviar las fotos finales" className={fieldClass} />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor={`${id}-site`}>URL de la página</Label>
        <Input id={`${id}-site`} name="site_url" type="url" defaultValue={p.site_url ?? ""} placeholder="https://…" className={fieldClass} />
      </div>
      <div className="flex items-center gap-3 md:col-span-2">
        <Button type="submit" disabled={busy} className="press rounded-full font-semibold hover:bg-brand">
          {busy && <Loader2 className="animate-spin" aria-hidden />} Guardar cambios
        </Button>
        <span role="status" aria-live="polite" className="text-sm">
          {saved && <Pill tone="success">Guardado</Pill>}
          {error && <span className="text-destructive">{error}</span>}
        </span>
      </div>
    </form>
  )
}
