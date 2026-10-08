"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FilePdfIcon,
  XIcon,
} from "@phosphor-icons/react";

import type { Slide } from "@/src/types/deck";

type SlideDeckViewerProps = {
  title: string;
  generatedAt: string;
  slides: Slide[];
  onOpenPdf: () => void;
};

export function SlideDeckViewer({
  title,
  generatedAt,
  slides,
  onOpenPdf,
}: SlideDeckViewerProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [collapsedContent, setCollapsedContent] = useState<Set<string>>(
    () => new Set(),
  );

  const slide = slides[index];
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  const go = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= slides.length) return;
      setDirection(nextIndex > index ? "next" : "prev");
      setIndex(nextIndex);
    },
    [index, slides.length],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        return;
      }
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, index]);

  if (!slide) {
    return (
      <p className="text-sm text-zinc-400">No slides were generated yet.</p>
    );
  }

  const lightbox =
    lightboxOpen
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Slide image"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 backdrop-blur-2xl"
          >
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setLightboxOpen(false)}
              className="absolute inset-0 cursor-default"
            />
            <button
              type="button"
              aria-label="Close image"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-5 right-5 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/[0.16]"
            >
              <XIcon aria-hidden="true" className="size-5" />
            </button>

            <div className="relative z-10 flex w-full max-w-5xl items-center gap-3 sm:gap-5">
              <button
                type="button"
                aria-label="Previous image"
                disabled={!canPrev}
                onClick={() => go(index - 1)}
                className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <CaretLeftIcon aria-hidden="true" className="size-6" />
              </button>

              <div
                key={`${slide.id}-lightbox-${direction}`}
                className={`
                relative min-h-[75vh] flex-1 overflow-hidden
                rounded-[28px] border border-white/12 bg-white/[0.04]
                shadow-[0_24px_80px_rgba(0,0,0,0.45)]
                ${direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}
                `}
              >
                {slide.imageUrl ? (
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-zinc-400">No image</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label="Next image"
                disabled={!canNext}
                onClick={() => go(index + 1)}
                className="flex size-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-xl transition hover:bg-white/[0.16] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <CaretRightIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-1.5 font-sans text-xs text-zinc-300 backdrop-blur-xl">
              {index + 1} / {slides.length}
            </p>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h1>
          <time
            dateTime={generatedAt}
            className="mt-2 block text-sm text-zinc-400"
          >
            {new Date(generatedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
        </div>
        <button
          type="button"
          onClick={onOpenPdf}
          className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.1] hover:text-white"
        >
          <FilePdfIcon aria-hidden="true" className="size-4" />
          Export PDF
        </button>
      </header>

      <div className="space-y-6">
        {slides.map((currentSlide, slideIndex) => (
          <article key={currentSlide.id} className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
              {currentSlide.title}
            </h2>

            <button
              type="button"
              onClick={() => {
                if (currentSlide.imageUrl) {
                  setIndex(slideIndex);
                  setLightboxOpen(true);
                }
              }}
              aria-label={
                currentSlide.imageUrl
                  ? `Open image for ${currentSlide.title}`
                  : undefined
              }
              className="group relative block aspect-[16/7] w-full overflow-hidden rounded-2xl bg-black/25 text-left"
            >
              {currentSlide.imageUrl ? (
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No image
                </div>
              )}
              <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/55 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                {slideIndex + 1}
              </span>
              {currentSlide.imageUrl ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4 text-xs text-white opacity-0 transition group-hover:opacity-100"></span>
              ) : null}
            </button>

            <section className="border-b border-white/10 pb-4">
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label={
                    collapsedContent.has(currentSlide.id)
                      ? `Expand content for ${currentSlide.title}`
                      : `Collapse content for ${currentSlide.title}`
                  }
                  aria-expanded={!collapsedContent.has(currentSlide.id)}
                  aria-controls={`slide-content-${currentSlide.id}`}
                  onClick={() => {
                    setCollapsedContent((current) => {
                      const next = new Set(current);
                      if (next.has(currentSlide.id)) {
                        next.delete(currentSlide.id);
                      } else {
                        next.add(currentSlide.id);
                      }
                      return next;
                    });
                  }}
                  className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d09a82]"
                >
                  <CaretDownIcon
                    aria-hidden="true"
                    className={`size-4 transition-transform ${
                      collapsedContent.has(currentSlide.id) ? "-rotate-90" : ""
                    }`}
                  />
                </button>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Slide content
                </h3>
              </div>
              <div
                id={`slide-content-${currentSlide.id}`}
                hidden={collapsedContent.has(currentSlide.id)}
              >
                <div className="mt-2 space-y-2 text-lg leading-7 text-zinc-400">
                  {currentSlide.content
                    .split(/(?=^\s*•\s*)/m)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, paragraphIndex) => {
                      const isBullet = paragraph.startsWith("•");
                      const text = paragraph
                        .replace(/\s+/g, " ")
                        .replace(/^•\s*/, "");

                      return (
                        <p
                          key={`${currentSlide.id}-content-${paragraphIndex}`}
                          className={
                            isBullet
                              ? "whitespace-normal pl-6 [text-indent:-1.5rem]"
                              : "whitespace-pre-wrap"
                          }
                        >
                          {isBullet ? `• ${text}` : text}
                        </p>
                      );
                    })}
                </div>
              </div>
            </section>
          </article>
        ))}
      </div>
      {lightbox}
    </div>
  );
}
