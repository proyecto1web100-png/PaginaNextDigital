import { cn } from "@/lib/utils"

/**
 * Brand mark: a heavy "N" in electric blue with a stacked, offset shadow.
 * Uses the system SF Pro on Apple devices and falls back to Geist Black elsewhere.
 */
export function LogoN({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block select-none leading-none text-[#1f4bff]", className)}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", var(--font-geist-sans), system-ui, sans-serif',
        fontWeight: 900,
        letterSpacing: "-0.04em",
        textShadow: "0 1px 0 #1438d6, 0 2px 0 #0f2cb0, 0 3px 0 #0b228a, 0 8px 18px rgba(31, 75, 255, 0.45)",
      }}
    >
      N
    </span>
  )
}
