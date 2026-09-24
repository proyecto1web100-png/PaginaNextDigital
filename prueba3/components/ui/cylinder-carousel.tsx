"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CarouselImage {
  src: string;
  alt?: string;
  /** When set, the card becomes a link that opens this URL in a new tab. */
  href?: string;
  title?: string;
  /** Shown in the card's browser bar (e.g. the site's host name). */
  subtitle?: string;
  /** Repeated cards used only to fill the cylinder: hidden from assistive tech and tab order. */
  decorative?: boolean;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  /** Card width in px, or any CSS length (e.g. "clamp(180px, 28vw, 400px)"). */
  cardWidth?: number | string;
  /** Card aspect ratio (CSS aspect-ratio value). */
  cardAspect?: string;
  /** Perspective as a multiple of the card width; larger = flatter ring. */
  perspectiveFactor?: number;
  /** Width of the fade on each side, as a percentage of the carousel width. */
  edgeFade?: number;
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 32,
      cardWidth = 250,
      cardAspect = "7/10",
      perspectiveFactor = 1.4,
      edgeFade = 20,
      style,
      ...props
    },
    ref
  ) => {
    const N = images.length;

    // --n: number of cards, --w: card width, --ba: angle between cards.
    // Defined on the root so perspective can scale with the card width.
    const vars = {
      "--n": N,
      "--w": typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
      "--ba": `calc(1turn / var(--n))`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;
    const mask = `linear-gradient(90deg, transparent, #000 ${edgeFade}% ${100 - edgeFade}%, transparent)`;

    return (
      <div
        ref={ref}
        className={cn("cyl-root w-full grid place-items-center overflow-hidden", className)}
        style={{
          ...vars,
          perspective: `calc(var(--w) * ${perspectiveFactor})`,
          maskImage: mask,
          WebkitMaskImage: mask,
          ...style,
        }}
        {...props}
      >
        <style>
          {`
            @keyframes cyl-ry { to { transform: rotateY(1turn); } }
            .cyl-spin { animation: cyl-ry var(--anim-dur) linear infinite; }
            .cyl-root:hover .cyl-spin,
            .cyl-root:focus-within .cyl-spin { animation-play-state: paused; }
            @media (prefers-reduced-motion: reduce) { .cyl-spin { animation: none; } }
          `}
        </style>
        <div
          className={cn(
            // The rotating wrapper sits at z=0, in front of the cards (pushed back
            // with a negative translateZ), so it must not swallow their clicks.
            "cyl-spin pointer-events-none grid place-items-center [transform-style:preserve-3d]",
            containerClassName
          )}
        >
          {images.map((img, i) => {
            const cardStyle = {
              width: "var(--w)",
              "--i": i,
              transform:
                "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
            } as React.CSSProperties;

            const face = (
              <>
                {img.subtitle && (
                  <span className="flex h-7 items-center gap-1.5 border-b border-black/10 bg-[#ece7dd] px-3" aria-hidden>
                    <i className="size-2 rounded-full bg-black/15" />
                    <i className="size-2 rounded-full bg-black/15" />
                    <i className="size-2 rounded-full bg-black/15" />
                    <span className="ml-2 truncate text-[11px] font-medium text-black/55">{img.subtitle}</span>
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.decorative ? "" : img.alt || img.title || `Proyecto ${i + 1}`}
                  draggable={false}
                  className="block w-full object-cover object-left-top"
                  style={{ aspectRatio: cardAspect }}
                />
              </>
            );

            const cardClasses = cn(
              "pointer-events-auto [grid-area:1/1] relative block overflow-hidden rounded-xl bg-white [backface-visibility:hidden]",
              "ring-1 ring-black/10 shadow-[0_24px_48px_-24px_rgba(18,18,18,0.45)]",
              cardClassName
            );

            return img.href ? (
              <a
                key={i}
                href={img.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={img.decorative ? undefined : `Abrir ${img.title ?? "proyecto"} en una pestaña nueva`}
                aria-hidden={img.decorative || undefined}
                tabIndex={img.decorative ? -1 : undefined}
                className={cn(
                  cardClasses,
                  "outline-none transition-[box-shadow] duration-200 hover:ring-2 hover:ring-[#121212] focus-visible:ring-4 focus-visible:ring-brand"
                )}
                style={cardStyle}
              >
                {face}
              </a>
            ) : (
              <div key={i} className={cardClasses} style={cardStyle} aria-hidden={img.decorative || undefined}>
                {face}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";
