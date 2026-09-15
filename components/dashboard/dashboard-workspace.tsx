"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PaperclipIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { GenerationStatus } from "@/components/dashboard/generation-status";
import { SlideDeckViewer } from "@/components/dashboard/slide-deck-viewer";
import type { DeckDetail, DeckListItem } from "@/src/types/deck";

type NavId = "new-chat" | "ideas";

type DashboardWorkspaceProps = {
  userName: string;
};

const STATUS_MESSAGES = [
  "Thinking about your idea",
  "Structuring the narrative",
  "Writing slide copy",
  "Designing visuals",
  "Putting the deck together",
];

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

async function readFileAsIdea(file: File) {
  const isText =
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|json)$/i.test(file.name);

  if (isText) {
    const text = (await file.text()).trim();
    return text || `Attached file: ${file.name}`;
  }

  return `The user attached a file named "${file.name}" as supporting material.`;
}

export function DashboardWorkspace({ userName }: DashboardWorkspaceProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<NavId>("new-chat");
  const [idea, setIdea] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<DeckDetail | null>(null);
  const [ideas, setIdeas] = useState<DeckListItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const greeting = useMemo(() => firstName(userName), [userName]);
  const isGenerating =
    busy ||
    activeDeck?.status === "PENDING" ||
    activeDeck?.status === "GENERATING";
  const isComplete = activeDeck?.status === "COMPLETE" && activeDeck.slides.length > 0;

  const loadIdeas = useCallback(async () => {
    const response = await fetch("/api/decks");
    if (!response.ok) return;
    const data = (await response.json()) as DeckListItem[];
    setIdeas(data);
  }, []);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  useEffect(() => {
    if (!isGenerating) return;
    const timer = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (!activeDeck || activeDeck.status === "COMPLETE" || activeDeck.status === "FAILED") {
      return;
    }

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/decks/${activeDeck.id}`);
      if (!response.ok) return;
      const deck = (await response.json()) as DeckDetail;
      setActiveDeck(deck);
      if (deck.status === "COMPLETE" || deck.status === "FAILED") {
        void loadIdeas();
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [activeDeck, loadIdeas]);

  function resetComposer() {
    setIdea("");
    setFile(null);
    setFileName(null);
    setError(null);
    setBusy(false);
    setStatusIndex(0);
    setActiveDeck(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSelect(id: NavId) {
    setActive(id);
    if (id === "new-chat") {
      resetComposer();
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    let prompt = idea.trim();
    if (file) {
      const fileIdea = await readFileAsIdea(file);
      prompt = prompt ? `${prompt}\n\n${fileIdea}` : fileIdea;
    }

    if (prompt.length < 20) {
      setError("Tell me a bit more — at least 20 characters.");
      return;
    }

    setBusy(true);
    setActive("new-chat");

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: prompt }),
      });
      const payload = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !payload.id) {
        throw new Error(payload.error || "Could not start generation.");
      }

      const detailResponse = await fetch(`/api/decks/${payload.id}`);
      const deck = (await detailResponse.json()) as DeckDetail;
      setActiveDeck(deck);
      void loadIdeas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function openDeck(id: string) {
    const response = await fetch(`/api/decks/${id}`);
    if (!response.ok) return;
    const deck = (await response.json()) as DeckDetail;
    setActiveDeck(deck);
    setActive("new-chat");
  }

  function openPdf() {
    if (!activeDeck) return;
    window.open(`/dashboard/pdf/${activeDeck.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6.25rem)] w-full max-w-[1400px] gap-4 px-4 pb-4">
      <DashboardSidebar
        collapsed={collapsed}
        active={active}
        onToggle={() => setCollapsed((value) => !value)}
        onSelect={handleSelect}
      />

      <section
        className="
          relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl
          border border-white/10 bg-white/[0.03] p-5 backdrop-blur-3xl
          shadow-[0_8px_40px_rgba(0,0,0,0.28)]
          transition-[flex-basis,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          sm:p-7
        "
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/45 to-transparent" />

        {active === "ideas" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="font-heading text-2xl font-semibold text-white">Ideas</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Your previous pitch deck prompts live here.
            </p>
            <div className="mt-6 grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1">
              {ideas.length === 0 ? (
                <p className="text-sm text-zinc-500">No ideas yet. Start a new chat to create one.</p>
              ) : (
                ideas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openDeck(item.id)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-[#d09a82]/30 hover:bg-white/[0.07]"
                  >
                    <p className="truncate font-sans text-sm font-semibold text-zinc-100">
                      {item.title || item.idea}
                    </p>
                    <p className="mt-1 text-xs capitalize text-zinc-500">
                      {item.status.toLowerCase()} · {item.slideCount} slides
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              className={`flex min-h-0 flex-1 flex-col ${
                isComplete ? "items-stretch" : "items-center justify-center"
              }`}
            >
              {!isGenerating && !isComplete ? (
                <div className="max-w-2xl text-center">
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-[#d09a82]">
                    SlidePilot
                  </p>
                  <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Welcome, {greeting}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                    Describe your startup, product, or story and I will turn it into a pitch deck.
                  </p>
                </div>
              ) : null}

              {isGenerating ? (
                <div className="flex max-w-xl flex-col items-center gap-4 text-center">
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                    {idea.trim() || activeDeck?.idea}
                  </p>
                  <GenerationStatus
                    message={
                      activeDeck?.status === "PENDING"
                        ? "Queued — getting ready"
                        : STATUS_MESSAGES[statusIndex]
                    }
                  />
                </div>
              ) : null}

              {activeDeck?.status === "FAILED" ? (
                <p className="mt-4 text-sm text-rose-300">
                  {activeDeck.errorMessage || "Generation failed. Try another idea."}
                </p>
              ) : null}

              {isComplete ? (
                <SlideDeckViewer
                  title={activeDeck.title || "Untitled deck"}
                  slides={activeDeck.slides}
                  onOpenPdf={openPdf}
                />
              ) : null}
            </div>

            {!isComplete ? (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="relative mt-6 shrink-0 rounded-[24px] border border-white/12 bg-white/[0.05] backdrop-blur-2xl"
                >
                  <label htmlFor="deck-idea" className="sr-only">
                    Describe your pitch deck idea
                  </label>
                  <textarea
                    id="deck-idea"
                    rows={4}
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    placeholder="A fintech for college students that rounds up spare change into index funds..."
                    className="w-full resize-none bg-transparent px-5 pt-4 pb-14 font-sans text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500"
                  />

                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      onChange={(event) => {
                        const nextFile = event.target.files?.[0] ?? null;
                        setFile(nextFile);
                        setFileName(nextFile?.name ?? null);
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Upload a file"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.12] hover:text-white"
                    >
                      <PaperclipIcon aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      type="submit"
                      aria-label="Submit idea"
                      disabled={isGenerating}
                      className="flex size-10 items-center justify-center rounded-xl border border-[#d09a82]/40 bg-[#d09a82]/20 text-[#e2b09b] transition hover:bg-[#d09a82]/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <PaperPlaneTiltIcon aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </form>
                {fileName ? (
                  <p className="mt-2 truncate text-xs text-zinc-500">Attached: {fileName}</p>
                ) : null}
                {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
