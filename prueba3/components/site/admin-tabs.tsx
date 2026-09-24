"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, MessageCircle, Monitor, Smartphone } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

/* ── Leads (quote form) ───────────────────────────────────── */

type LeadStatus = "nuevo" | "contactado" | "cerrado" | "descartado"
type Lead = {
  id: string
  name: string
  phone: string
  business_name: string | null
  business_type: string | null
  plan: string | null
  message: string | null
  status: LeadStatus
  created_at: string
}

const LEAD_STATUS: { value: LeadStatus; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado" },
  { value: "descartado", label: "Descartado" },
]

const fetchLeads = async () => {
  const { data, error } = await supabase!
    .from("leads")
    .select("id, name, phone, business_name, business_type, plan, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200)
  return error ? null : (data as Lead[])
}

/** WhatsApp link to the lead's own number (Honduras numbers without country code get +504). */
const leadWhatsApp = (l: Lead) => {
  let digits = l.phone.replace(/\D/g, "")
  if (digits.length === 8) digits = `504${digits}`
  const text = `Hola ${l.name.split(/\s+/)[0]}, te escribo de NextDigital por tu solicitud de cotización${l.business_name ? ` para ${l.business_name}` : ""}.`
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<LeadStatus | "todas">("todas")

  const refresh = useCallback(() => {
    fetchLeads().then((l) => (l ? setLeads(l) : setError("No pudimos cargar las cotizaciones.")))
  }, [])

  useEffect(() => {
    let alive = true
    fetchLeads().then((l) => {
      if (!alive) return
      if (l) setLeads(l)
      else setError("No pudimos cargar las cotizaciones.")
    })
    return () => {
      alive = false
    }
  }, [])

  async function setStatus(l: Lead, status: LeadStatus) {
    setLeads((all) => all?.map((x) => (x.id === l.id ? { ...x, status } : x)) ?? null)
    const { error } = await supabase!.from("leads").update({ status }).eq("id", l.id)
    if (error) {
      setError("No se pudo actualizar el estado.")
      refresh()
    }
  }

  if (error) return <p role="alert" className="text-destructive">{error}</p>
  if (!leads) return <Loading text="Cargando cotizaciones…" />

  const newCount = leads.filter((l) => l.status === "nuevo").length
  const shown = filter === "todas" ? leads : leads.filter((l) => l.status === filter)

  return (
    <section aria-labelledby="leads-title">
      <div className="flex items-center gap-3">
        <h1 id="leads-title" className="text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Cotizaciones</h1>
        {newCount > 0 && (
          <Badge className="h-6 min-w-6 rounded-full bg-orange px-2 font-mono text-sm tabular-nums text-foreground" aria-label={`${newCount} nuevas`}>
            {newCount}
          </Badge>
        )}
      </div>
      <p className="mt-3 text-ink-2">Solicitudes enviadas desde el formulario de la página.</p>

      <div role="group" aria-label="Filtrar cotizaciones" className="mt-6 flex flex-wrap gap-2">
        {(["todas", ...LEAD_STATUS.map((s) => s.value)] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={filter === v}
            onClick={() => setFilter(v)}
            className={cn(
              "press h-9 rounded-full border-[1.5px] px-4 text-sm font-semibold capitalize",
              filter === v ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-muted-foreground">No hay cotizaciones aquí.</p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {shown.map((l) => (
            <li key={l.id} className={cn("rounded-3xl border border-border bg-card p-5 md:p-6", l.status === "descartado" && "opacity-60")}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-xl font-bold leading-tight">
                    {l.name}
                    {l.business_name && <span className="font-sans text-base font-normal text-muted-foreground"> · {l.business_name}</span>}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {l.phone} · {new Date(l.created_at).toLocaleString("es-HN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {l.business_type && <Tag>{l.business_type}</Tag>}
                    {l.plan && <Tag>Plan: {l.plan}</Tag>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor={`st-${l.id}`}>Estado</label>
                  <select
                    id={`st-${l.id}`}
                    value={l.status}
                    onChange={(e) => setStatus(l, e.target.value as LeadStatus)}
                    className="h-10 rounded-full border border-input bg-background/60 px-3 text-sm font-semibold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {LEAD_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <a
                    href={leadWhatsApp(l)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => l.status === "nuevo" && setStatus(l, "contactado")}
                    className="press inline-flex h-10 items-center gap-2 rounded-full bg-[#1faf54] px-4 text-sm font-semibold text-white"
                  >
                    <FaWhatsapp aria-hidden /> Escribirle
                  </a>
                </div>
              </div>
              {l.message && (
                <p className="mt-4 flex gap-2 rounded-2xl bg-paper-2 p-4 text-[15px] text-ink-2">
                  <MessageCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {l.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ── Statistics ───────────────────────────────────────────── */

type Summary = {
  views: number
  whatsapp: number
  quotes: number
  mobile: number
  desktop: number
  by_day: { day: string; views: number }[]
  top_pages: { path: string; views: number }[]
  top_referrers: { referrer: string; views: number }[]
}

const PAGE_NAMES: Record<string, string> = { "/": "Inicio", "/blog/": "Blog", "/portal/": "Portal", "/privacidad/": "Privacidad", "/cookies/": "Cookies" }

export function StatsTab() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<Summary | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true
    supabase!.rpc("analytics_summary", { p_days: days }).then(({ data, error }) => {
      if (!alive) return
      if (error) setError("No pudimos cargar las estadísticas.")
      else {
        setError("")
        setData(data as Summary)
      }
    })
    return () => {
      alive = false
    }
  }, [days])

  const conversion = data && data.views ? Math.round(((data.whatsapp + data.quotes) / data.views) * 1000) / 10 : 0
  const maxDay = Math.max(1, ...(data?.by_day.map((d) => d.views) ?? [1]))
  const series = data ? fillDays(data.by_day, days) : []

  return (
    <section aria-labelledby="stats-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="stats-title" className="text-[clamp(2rem,4vw,3rem)] font-bold leading-none">Estadísticas</h1>
          <p className="mt-3 text-ink-2">Solo de visitantes que aceptaron las estadísticas. Sin datos personales.</p>
        </div>
        <div role="group" aria-label="Periodo" className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={cn("press h-9 rounded-full border-[1.5px] px-4 text-sm font-semibold", days === d ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="mt-6 text-destructive">{error}</p>}
      {!data && !error && <div className="mt-6"><Loading text="Cargando estadísticas…" /></div>}

      {data && (
        <>
          <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Visitas" value={data.views} />
            <Stat label="Toques en WhatsApp" value={data.whatsapp} />
            <Stat label="Cotizaciones enviadas" value={data.quotes} />
            <Stat label="Contactos por visita" value={`${conversion}%`} hint="(WhatsApp + cotizaciones) ÷ visitas" />
          </dl>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5 md:p-6">
            <p className="text-sm font-semibold">Visitas por día</p>
            {data.views === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Todavía no hay visitas registradas en este periodo.</p>
            ) : (
              <div className="mt-4 flex h-40 items-end gap-[2px]" role="img" aria-label={`Visitas por día en los últimos ${days} días, máximo ${maxDay} en un día`}>
                {series.map((d) => (
                  <div key={d.day} className="group relative flex h-full flex-1 items-end">
                    <div
                      className={cn("w-full rounded-t-[3px]", d.views ? "bg-orange" : "bg-paper-2")}
                      style={{ height: `${Math.max(2, (d.views / maxDay) * 100)}%` }}
                      title={`${new Date(`${d.day}T12:00:00`).toLocaleDateString("es-HN", { day: "numeric", month: "short" })}: ${d.views}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <RankList title="Páginas más vistas" rows={data.top_pages.map((p) => ({ label: PAGE_NAMES[p.path] ?? p.path, value: p.views }))} />
            <RankList title="De dónde llegan" rows={data.top_referrers.map((r) => ({ label: r.referrer, value: r.views }))} />
            <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
              <p className="text-sm font-semibold">Dispositivo</p>
              <ul className="mt-4 grid gap-3 text-sm">
                <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Smartphone className="size-4" aria-hidden /> Celular</span><b>{pct(data.mobile, data.views)}</b></li>
                <li className="flex items-center justify-between gap-2"><span className="flex items-center gap-2"><Monitor className="size-4" aria-hidden /> Computadora</span><b>{pct(data.desktop, data.views)}</b></li>
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)}%` : "—")

/** One entry per day (oldest → newest), filling days without visits with 0. */
function fillDays(rows: { day: string; views: number }[], days: number) {
  const byDay = new Map(rows.map((r) => [r.day, r.views]))
  const out: { day: string; views: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toLocaleDateString("en-CA", { timeZone: "America/Tegucigalpa" })
    out.push({ day: key, views: byDay.get(key) ?? 0 })
  }
  return out
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</dd>
      {hint && <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  )
}

function RankList({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
      <p className="text-sm font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Sin datos todavía.</p>
      ) : (
        <ul className="mt-4 grid gap-3 text-sm">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between gap-2">
                <span className="truncate">{r.label}</span>
                <b className="tabular-nums">{r.value}</b>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-paper-2">
                <div className="h-full rounded-full bg-foreground" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Loading({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden /> {text}
    </p>
  )
}
