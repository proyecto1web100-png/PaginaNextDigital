"use client"
import { useState } from "react"
import { Menu, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Adapted from VengeanceUI's NotchNavbar: items, logo and actions are props,
// links are in-page anchors, and the theme toggle is removed (the site is dark-only).

export type NotchNavItem = { label: string; href: string; icon: LucideIcon }

export interface NotchNavbarProps extends React.HTMLAttributes<HTMLElement> {
  left: NotchNavItem[]
  right: NotchNavItem[]
  logo: React.ReactNode
  /** Rendered after the right-hand links on desktop and at the end of the mobile menu. */
  actions?: React.ReactNode
  /** Compact action shown on the right on mobile. */
  mobileAction?: React.ReactNode
}

const NavLink = ({ href, icon: Icon, label, onClick }: NotchNavItem & { onClick?: () => void }) => (
  <a
    href={href}
    onClick={onClick}
    className="group flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
  >
    <Icon className="w-4 h-4 opacity-70 group-hover:opacity-100" aria-hidden />
    <span>{label}</span>
  </a>
)

const Rule = ({ y }: { y: number }) => (
  <line x1="0" y1={y} x2="100%" y2={y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} className="text-foreground" />
)

export function NotchNavbar({ className, left, right, logo, actions, mobileAction, ...props }: NotchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const close = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className={cn("fixed top-0 inset-x-0 z-50 h-16 flex px-0 pointer-events-none", className)} {...props}>
        {/* Left side bar */}
        <div className="flex-1 h-10 bg-background z-20 relative min-w-0 pointer-events-auto">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
            <Rule y={39.5} />
            <Rule y={36.5} />
          </svg>
        </div>

        {/* Notch: 3 slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px pointer-events-auto">
          <div className="w-[50px] h-full relative shrink-0">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64" aria-hidden>
              <path d="M0 39.5 C25 39.5 25 63.5 50 63.5" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} className="text-foreground" />
              <path d="M0 36.5 C25 36.5 25 60.5 50 60.5" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} className="text-foreground" />
            </svg>
          </div>

          <div className="flex-1 h-full relative min-w-0 -ml-px">
            <div className="absolute inset-0 bg-background">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" aria-hidden>
                <Rule y={63.5} />
                <Rule y={60.5} />
              </svg>
            </div>

            <div className="relative w-full h-full flex items-end justify-between gap-2 pb-2 px-4 md:px-8">
              <nav aria-label="Secciones" className="hidden md:flex gap-8 mb-1 shrink-0">
                {left.map((item) => <NavLink key={item.label} {...item} />)}
              </nav>

              <button
                type="button"
                className="md:hidden mb-1 p-1 text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen((o) => !o)}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="notch-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex justify-center shrink-0 mx-2 md:mx-4 mt-1">{logo}</div>

              <div className="hidden md:flex gap-6 items-center shrink-0 -mb-0.5">
                <nav aria-label="Más secciones" className="flex gap-6">
                  {right.map((item) => <NavLink key={item.label} {...item} />)}
                </nav>
                {actions && <div className="flex gap-4 pl-4 border-l border-foreground/10 shrink-0 items-center">{actions}</div>}
              </div>

              <div className="md:hidden flex items-center gap-2 mb-1">{mobileAction}</div>
            </div>
          </div>

          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64" aria-hidden>
              <path d="M0 63.5 C25 63.5 25 39.5 50 39.5" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} className="text-foreground" />
              <path d="M0 60.5 C25 60.5 25 36.5 50 36.5" fill="none" stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} className="text-foreground" />
            </svg>
          </div>
        </div>

        {/* Right side bar */}
        <div className="flex-1 h-10 bg-background z-20 relative min-w-0 -ml-px pointer-events-auto">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden>
            <Rule y={39.5} />
            <Rule y={36.5} />
          </svg>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="notch-mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 30 } }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.12, ease: "easeIn" } }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-foreground/5 p-4 md:hidden shadow-lg"
          >
            <nav aria-label="Secciones" className="flex flex-col gap-1">
              {[...left, ...right].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 transition-colors"
                  onClick={close}
                >
                  <item.icon className="w-5 h-5 opacity-70" aria-hidden />
                  <span className="font-medium text-foreground/90">{item.label}</span>
                </a>
              ))}
              {actions && (
                <>
                  <div className="h-px bg-foreground/10 my-2" />
                  <div className="flex flex-col gap-2" onClick={close}>{actions}</div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
