"use client";

import { useEffect } from "react";

import type { DeckDetail } from "@/src/types/deck";

type PdfPreviewProps = {
  deck: DeckDetail;
};

export function PdfPreview({ deck }: PdfPreviewProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.print();
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 px-6 py-10 text-zinc-900 print:bg-white print:p-0">
      <header className="mx-auto mb-10 max-w-3xl print:mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b97861]">
          SlidePilot
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{deck.title || "Untitled deck"}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">{deck.idea}</p>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {deck.slides.map((slide, index) => (
          <article
            key={slide.id}
            className="break-after-page overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm print:break-after-page print:rounded-none print:border-0 print:shadow-none"
          >
            {slide.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="h-64 w-full object-cover"
              />
            ) : null}
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b97861]">
                Slide {index + 1}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{slide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-700">{slide.content}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
