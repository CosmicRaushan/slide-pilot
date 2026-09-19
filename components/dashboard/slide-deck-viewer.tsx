"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CaretLeftIcon,
  CaretRightIcon,
  FilePdfIcon,
  XIcon,
} from "@phosphor-icons/react";

import type { Slide } from "@/src/types/deck";

type SlideDeckViewerProps = {
  title: string;
  slides: Slide[];
  onOpenPdf: () => void;
};

export function SlideDeckViewer({
  title,
  slides,
  onOpenPdf,
}: SlideDeckViewerProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const slide = slides[index];
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    setIndex(0);
    setDirection("next");
    setLightboxOpen(false);
  }, [slides]);

  function go(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setDirection(nextIndex > index ? "next" : "prev");
    setIndex(nextIndex);
  }

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
  }, [index, slides.length]);

  if (!slide) {
    return (
      <p className="text-sm text-zinc-400">No slides were generated yet.</p>
    );
  }

  const lightbox =
    lightboxOpen && mounted
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
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1 items-stretch gap-3">
        <button
          type="button"
          aria-label="Previous slide"
          disabled={!canPrev}
          onClick={() => go(index - 1)}
          className="my-auto flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CaretLeftIcon aria-hidden="true" className="size-5" />
        </button>

        <article
          key={`${slide.id}-${direction}`}
          className={`
            w-full min-w-[430px]
            flex flex-col overflow-hidden rounded-[16px]
            border border-white/12 bg-white/[0.05] backdrop-blur-3xl
            shadow-[0_16px_60px_rgba(0,0,0,0.35)]
            ${direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}
          `}
        >
          <button
            type="button"
            onClick={() => {
              if (slide.imageUrl) setLightboxOpen(true);
            }}
            aria-label={slide.imageUrl ? "Open image" : undefined}
            className="group relative h-[420px] overflow-hidden bg-black/20 text-left"
          >
            {slide.imageUrl ? (
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="h-full w-full object-cover transition duration-300 "
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No image
              </div>
            )}

            <p className="absolute left-4 top-4 rounded-full bg-black/40 px-2 py-1 text-xs text-zinc-200 backdrop-blur">
              {index + 1}
            </p>

            {slide.imageUrl ? (
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 py-3 text-xs text-zinc-200 opacity-0 transition ">
                Click to view
              </span>
            ) : null}
          </button>
        </article>

        <button
          type="button"
          aria-label="Next slide"
          disabled={!canNext}
          onClick={() => go(index + 1)}
          className="my-auto flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CaretRightIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      {/* {// need some improvement } */}
      <div className="shrink-0 border-t border-white/10 bg-white/[0.03]  px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d09a82]">
          Notes
        </p>
        <h3 className="mt-1.5 font-heading text-lg font-semibold text-white">
          {slide.title}
        </h3>
        <p className="mt-2 max-h-[22vh] overflow-y-auto text-sm leading-6 text-zinc-300">
          {slide.content}
        </p>
      </div>
      {lightbox}
    </div>
  );
}
