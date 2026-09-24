"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Download, FileText, ImageIcon, Loader2, Trash2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const BUCKET = "client-files"
const MAX_BYTES = 20 * 1024 * 1024
const ACCEPT = "image/*,.pdf,.zip,.txt,.doc,.docx,.xls,.xlsx"

type StoredFile = { path: string; name: string; size: number; type: string; created: string }

/** "1727000000000-Mi logo.png" → "Mi logo.png" (the timestamp keeps names unique). */
const displayName = (stored: string) => stored.replace(/^\d{13}-/, "")

const safeName = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "archivo"

const formatSize = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

async function listFiles(userId: string): Promise<StoredFile[] | null> {
  const { data, error } = await supabase!.storage.from(BUCKET).list(userId, { limit: 200, sortBy: { column: "created_at", order: "desc" } })
  if (error) return null
  return data
    .filter((f) => f.id && !f.name.startsWith("."))
    .map((f) => ({
      path: `${userId}/${f.name}`,
      name: displayName(f.name),
      size: Number(f.metadata?.size ?? 0),
      type: String(f.metadata?.mimetype ?? ""),
      created: f.created_at ?? "",
    }))
}

/**
 * Files of one client (client-files/<userId>/…). Clients upload and delete their own files;
 * the admin panel shows the same list read-only plus delete (enforced by storage RLS).
 */
export function FilesPanel({ userId, canUpload, compact = false }: { userId: string; canUpload: boolean; compact?: boolean }) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<StoredFile[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  const refresh = useCallback(() => {
    listFiles(userId).then((f) => {
      if (f) setFiles(f)
      else setError("No pudimos cargar los archivos.")
    })
  }, [userId])

  useEffect(() => {
    let alive = true
    listFiles(userId).then((f) => {
      if (!alive) return
      if (f) setFiles(f)
      else setError("No pudimos cargar los archivos.")
    })
    return () => {
      alive = false
    }
  }, [userId])

  async function upload(list: FileList | null) {
    if (!list?.length) return
    setError("")
    const tooBig = Array.from(list).filter((f) => f.size > MAX_BYTES)
    if (tooBig.length) {
      setError(`Cada archivo puede pesar hasta 20 MB (${tooBig.map((f) => f.name).join(", ")} es más grande).`)
      return
    }
    for (const file of Array.from(list)) {
      setBusy(`Subiendo ${file.name}…`)
      const { error } = await supabase!.storage
        .from(BUCKET)
        .upload(`${userId}/${Date.now()}-${safeName(file.name)}`, file, { upsert: false, contentType: file.type || undefined })
      if (error) {
        setError(`No se pudo subir ${file.name}. Revisa que sea una imagen, PDF, documento o ZIP.`)
        break
      }
    }
    setBusy(null)
    if (input.current) input.current.value = ""
    refresh()
  }

  async function download(f: StoredFile) {
    const { data, error } = await supabase!.storage.from(BUCKET).createSignedUrl(f.path, 60, { download: f.name })
    if (error || !data) setError("No se pudo descargar el archivo.")
    else window.location.assign(data.signedUrl)
  }

  async function remove(f: StoredFile) {
    if (!window.confirm(`¿Eliminar ${f.name}?`)) return
    setBusy(`Eliminando ${f.name}…`)
    const { error } = await supabase!.storage.from(BUCKET).remove([f.path])
    setBusy(null)
    if (error) setError("No se pudo eliminar el archivo.")
    refresh()
  }

  return (
    <div className={cn(!compact && "rounded-3xl border border-border bg-card p-6 md:p-8")}>
      {!compact && (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Archivos para tu página</p>
          <p className="mt-2 text-ink-2">Sube tu logo, fotos de tus productos o local y textos. Hasta 20 MB por archivo.</p>
        </>
      )}

      {canUpload && (
        <label
          htmlFor={`${id}-file`}
          className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:border-foreground focus-within:border-foreground"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            upload(e.dataTransfer.files)
          }}
        >
          <Upload className="size-6 text-orange" aria-hidden />
          <span className="font-semibold">Toca para elegir archivos</span>
          <span className="text-sm text-muted-foreground">o arrástralos aquí · imágenes, PDF, Word, Excel o ZIP</span>
          <input
            ref={input}
            id={`${id}-file`}
            type="file"
            multiple
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => upload(e.target.files)}
            disabled={busy !== null}
          />
        </label>
      )}

      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
        {busy && (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> {busy}
          </span>
        )}
        {error && <span className="text-destructive">{error}</span>}
      </p>

      {files === null && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando archivos…
        </p>
      )}
      {files?.length === 0 && <p className="text-sm text-muted-foreground">{canUpload ? "Todavía no has subido archivos." : "Sin archivos."}</p>}
      {files && files.length > 0 && (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-3 px-4 py-3">
              {f.type.startsWith("image/") ? (
                <ImageIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{f.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {formatSize(f.size)}
                  {f.created && ` · ${new Date(f.created).toLocaleDateString("es-HN", { day: "numeric", month: "short" })}`}
                </span>
              </span>
              <button type="button" onClick={() => download(f)} aria-label={`Descargar ${f.name}`} className="press grid size-9 place-items-center rounded-full hover:bg-paper-2">
                <Download className="size-4" aria-hidden />
              </button>
              <button type="button" onClick={() => remove(f)} aria-label={`Eliminar ${f.name}`} className="press grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-paper-2 hover:text-destructive">
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
