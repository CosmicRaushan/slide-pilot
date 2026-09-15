"use client";

import { useEffect, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  FilePdfIcon,
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

  const slide = slides[index];
  const canPrev = index > 0;
  const canNext = index < slides.length - 1;

  useEffect(() => {
    setIndex(0);
    setDirection("next");
  }, [slides]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, slides.length]);

  function go(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setDirection(nextIndex > index ? "next" : "prev");
    setIndex(nextIndex);
  }

  if (!slide) {
    return (
      <p className="text-sm text-zinc-400">No slides were generated yet.</p>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      <div className="mb-4 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Slide {index + 1} of {slides.length}
        </p>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Previous slide"
          disabled={!canPrev}
          onClick={() => go(index - 1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CaretLeftIcon aria-hidden="true" className="size-5" />
        </button>

        <article
          key={`${slide.id}-${direction}`}
          className={`
            grid h-full max-h-[420px] w-full max-w-3xl overflow-hidden rounded-[28px]
            border border-white/12 bg-white/[0.05] backdrop-blur-3xl
            shadow-[0_16px_60px_rgba(0,0,0,0.35)]
            ${direction === "next" ? "animate-slide-in-right" : "animate-slide-in-left"}
            md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]
          `}
        >
          <div className="relative min-h-[180px] overflow-hidden border-b border-white/10 md:border-b-0 md:border-r">
            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-white/[0.03] text-sm text-zinc-500">
                No image
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d09a82]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="font-heading text-xl font-semibold text-white md:text-2xl">
              {slide.title}
            </h3>
            <p className="text-sm leading-6 text-zinc-300">{slide.content}</p>
          </div>
        </article>

        <button
          type="button"
          aria-label="Next slide"
          disabled={!canNext}
          onClick={() => go(index + 1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-xl transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <CaretRightIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenPdf}
        aria-label="Open generated PDF"
        className="absolute right-0 bottom-0 z-10 flex items-center gap-2 rounded-2xl border border-[#d09a82]/30 bg-[#d09a82]/15 px-3 py-2.5 font-sans text-sm font-semibold text-[#e2b09b] backdrop-blur-xl transition hover:bg-[#d09a82]/25"
      >
        <FilePdfIcon aria-hidden="true" className="size-4" />
        PDF
      </button>
    </div>
  );
}
