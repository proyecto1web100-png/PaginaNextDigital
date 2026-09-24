"use client"

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, Send, X } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { FAQS, normalize, type Faq } from "@/lib/faq"
import { wa } from "@/lib/site"
import { cn } from "@/lib/utils"
import { spring } from "./motion"

type Msg = { from: "bot" | "user"; text: string; waText?: string }

const QUICK: { label: string; faq?: string; human?: boolean }[] = [
  { label: "Precios", faq: "¿Cuánto cuesta mi página web?" },
  { label: "Tiempo de entrega", faq: "¿Cuánto tiempo tarda en estar lista?" },
  { label: "¿Qué necesito?", faq: "¿Qué necesito para empezar?" },
  { label: "Portal de clientes", faq: "¿Cómo sigo el avance de mi proyecto?" },
  { label: "Hablar con una persona", human: true },
]

const GREETING: Msg = {
  from: "bot",
  text: "¡Hola! Soy el asistente de NextDigital. Puedo responderte sobre precios, tiempos y cómo trabajamos. ¿En qué te ayudo?",
}

/** Picks the FAQ whose keywords best match the question (simple scoring, no AI). */
function answer(question: string): Faq | null {
  const q = ` ${normalize(question)} `
  let best: Faq | null = null
  let bestScore = 0
  for (const f of FAQS) {
    const score = f.keywords.reduce((n, k) => (q.includes(k) ? n + (k.includes(" ") ? 2 : 1) : n), 0)
    if (score > bestScore) {
      best = f
      bestScore = score
    }
  }
  return best
}

export function ChatAssistant() {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([GREETING])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [msgs])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  function ask(text: string, forced?: Faq | null, human = false) {
    const clean = text.trim()
    if (!clean) return
    const f = human ? null : forced ?? answer(clean)
    const reply: Msg = human
      ? { from: "bot", text: "¡Claro! Te atendemos por WhatsApp, normalmente respondemos en menos de 1 hora.", waText: "Hola NextDigital! Quiero hablar con alguien sobre mi página web." }
      : f
        ? { from: "bot", text: f.a }
        : {
            from: "bot",
            text: "No tengo esa respuesta todavía, pero te respondemos por WhatsApp. Te dejo tu pregunta lista para enviar.",
            waText: `Hola NextDigital! ${clean}`,
          }
    setMsgs((m) => [...m, { from: "user", text: clean }, reply])
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="dialog"
            aria-label="Asistente de NextDigital"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: spring }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.12, ease: "easeIn" } }}
            className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(560px,calc(100dvh-8rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_60px_-20px_rgba(18,18,18,0.45)] md:inset-x-auto md:right-6 md:w-[380px]"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="font-display text-lg font-bold leading-tight">Asistente NextDigital</p>
                <p className="text-xs text-muted-foreground">Respuestas automáticas · o escríbenos por WhatsApp</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar asistente" className="press grid size-9 place-items-center rounded-full hover:bg-paper-2">
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed",
                      m.from === "user" ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md bg-paper-2 text-foreground"
                    )}
                  >
                    {m.text}
                    {m.waText && (
                      <a
                        href={wa(m.waText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="press mt-3 flex w-fit items-center gap-2 rounded-full bg-[#1faf54] px-4 py-2 text-sm font-semibold text-white"
                      >
                        <FaWhatsapp aria-hidden /> Abrir WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border px-4 pt-3">
              {QUICK.map((qk) => (
                <button
                  key={qk.label}
                  type="button"
                  onClick={() => ask(qk.label, qk.faq ? FAQS.find((f) => f.q === qk.faq) : null, qk.human)}
                  className="press rounded-full border border-border px-3 py-1.5 text-[13px] font-medium hover:border-foreground"
                >
                  {qk.label}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2 p-4"
              onSubmit={(e) => {
                e.preventDefault()
                ask(inputRef.current?.value ?? "")
                if (inputRef.current) inputRef.current.value = ""
              }}
            >
              <label htmlFor={`${id}-input`} className="sr-only">Escribe tu pregunta</label>
              <input
                ref={inputRef}
                id={`${id}-input`}
                maxLength={300}
                autoComplete="off"
                placeholder="Escribe tu pregunta…"
                className="h-11 min-w-0 flex-1 rounded-full border border-input bg-background/60 px-4 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <button type="submit" aria-label="Enviar pregunta" className="press grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background hover:bg-brand">
                <Send className="size-4" aria-hidden />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente de preguntas"}
        className="press fixed bottom-4 right-4 z-50 grid size-14 place-items-center rounded-full bg-foreground text-background shadow-[0_16px_40px_-12px_rgba(18,18,18,0.5)] transition-colors hover:bg-brand md:bottom-6 md:right-6"
      >
        {open ? <X className="size-6" aria-hidden /> : <MessageCircle className="size-6" aria-hidden />}
      </button>
    </>
  )
}
