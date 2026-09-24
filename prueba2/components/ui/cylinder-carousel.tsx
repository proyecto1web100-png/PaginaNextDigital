"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CarouselImage {
  src: string;
  alt?: string;
  /** When set, the card becomes a link that opens this URL in a new tab. */
  href?: string;
  title?: string;
  subtitle?: string;
  /** Repeated cards used only to fill the cylinder: hidden from assistive tech and tab order. */
  decorative?: boolean;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  /** Card width in px, or any CSS length (e.g. "clamp(150px, 36vw, 230px)"). */
  cardWidth?: number | string;
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
      style,
      ...props
    },
    ref
  ) => {
    const N = images.length;

    // --n: number of cards, --w: card width, --ba: angle between cards
    const customStyle = {
      "--n": N,
      "--w": typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
      "--ba": `calc(1turn / var(--n))`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "cyl-root w-full h-full min-h-[500px] grid place-items-center overflow-hidden",
          className
        )}
        style={{
          perspective: "35em",
          maskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 20% 80%, transparent)",
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
          style={customStyle}
        >
          {images.map((img, i) => {
            const cardStyle = {
              width: "var(--w)",
              aspectRatio: "7/10",
              "--i": i,
              transform:
                "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
            } as React.CSSProperties;

            const face = (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.decorative ? "" : img.alt || img.title || `Proyecto ${i + 1}`}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {(img.title || img.subtitle) && (
                  <span className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-12 text-left sm:p-4">
                    {img.subtitle && (
                      <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-white/60 sm:block">
                        {img.subtitle}
                      </span>
                    )}
                    {img.title && (
                      <span className="text-base font-semibold leading-tight tracking-tight text-white sm:text-lg">
                        {img.title}
                      </span>
                    )}
                  </span>
                )}
              </>
            );

            const cardClasses = cn(
              "pointer-events-auto [grid-area:1/1] relative overflow-hidden rounded-2xl [backface-visibility:hidden]",
              "ring-1 ring-white/10 bg-neutral-900",
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
                  "block outline-none transition-[box-shadow] duration-200 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-brand"
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
