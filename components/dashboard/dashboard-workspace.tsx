"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePathname } from "next/navigation";

import {
  PaperclipIcon,
  PaperPlaneTiltIcon,
  StopIcon,
} from "@phosphor-icons/react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useDashboardSidebarState } from "@/components/dashboard/dashboard-sidebar-state";
import { GenerationStatus } from "@/components/dashboard/generation-status";
import { SlideDeckViewer } from "@/components/dashboard/slide-deck-viewer";
import type { DeckDetail, DeckListItem } from "@/src/types/deck";
import { NavId } from "@/src/types/navigation";
import WalletView from "./wallet-view";

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
    file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);

  if (isText) {
    const text = (await file.text()).trim();
    return text || `Attached file: ${file.name}`;
  }

  return `The user attached a file named "${file.name}" as supporting material.`;
}

async function fetchDecks() {
  try {
    const response = await fetch("/api/decks");

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DeckListItem[];
  } catch {
    return null;
  }
}

export function DashboardWorkspace({ userName }: DashboardWorkspaceProps) {
  const pathname = usePathname();

  const { collapsed, setCollapsed } = useDashboardSidebarState();
  const [idea, setIdea] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [generationDeckId, setGenerationDeckId] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [activeDeck, setActiveDeck] = useState<DeckDetail | null>(null);
  const [ideas, setIdeas] = useState<DeckListItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ideaInputRef = useRef<HTMLTextAreaElement>(null);
  const previousDeckStatus = useRef<{
    id: string;
    status: DeckDetail["status"];
  } | null>(null);

  const greeting = useMemo(() => firstName(userName), [userName]);
  const [, , routeTab, routeDeckId] = pathname.split("/");
  const active: NavId =
    routeTab === "ideas" || routeTab === "wallet" || routeTab === "wallet"
      ? routeTab
      : routeTab === "deck"
        ? "ideas"
        : "new-chat";
  const visibleDeck =
    routeTab === "deck" && activeDeck?.id === routeDeckId ? activeDeck : null;
  const currentDeckId = activeDeck?.id;
  const currentDeckStatus = activeDeck?.status;

  useEffect(() => {
    if (!currentDeckId || !currentDeckStatus) {
      return;
    }

    const previous = previousDeckStatus.current;
    if (
      previous?.id === currentDeckId &&
      previous.status !== "COMPLETE" &&
      currentDeckStatus === "COMPLETE"
    ) {
      setCollapsed(true);
    }

    previousDeckStatus.current = {
      id: currentDeckId,
      status: currentDeckStatus,
    };
  }, [currentDeckId, currentDeckStatus, setCollapsed]);

  const isGenerating =
    busy ||
    visibleDeck?.status === "PENDING" ||
    visibleDeck?.status === "GENERATING";

  const isComplete =
    visibleDeck?.status === "COMPLETE" && visibleDeck.slides.length > 0;

  const loadIdeas = useCallback(async () => {
    const data = await fetchDecks();
    if (data) {
      setIdeas(data);
    }
  }, []);

  useEffect(() => {
    if (active !== "ideas") {
      return;
    }

    let cancelled = false;

    async function refreshIdeas() {
      const data = await fetchDecks();
      if (!cancelled && data) {
        setIdeas(data);
      }
    }

    void refreshIdeas();

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (!routeDeckId || activeDeck?.id === routeDeckId) {
      return;
    }

    let cancelled = false;

    async function loadDeck() {
      try {
        const response = await fetch(`/api/decks/${routeDeckId}`);

        if (!response.ok) {
          throw new Error("Could not load this deck.");
        }

        const deck = (await response.json()) as DeckDetail;

        if (!cancelled) {
          setActiveDeck(deck);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load this deck.",
          );
        }
      }
    }

    void loadDeck();

    return () => {
      cancelled = true;
    };
  }, [routeDeckId, activeDeck?.id]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const timer = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (
      !activeDeck ||
      activeDeck.status === "COMPLETE" ||
      activeDeck.status === "FAILED"
    ) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/decks/${activeDeck.id}`);

        if (!response.ok) {
          return;
        }

        const deck = (await response.json()) as DeckDetail;

        setActiveDeck(deck);

        if (deck.status === "COMPLETE" || deck.status === "FAILED") {
          void loadIdeas();
        }
      } catch {}
    }, 2000);

    return () => window.clearInterval(timer);
  }, [activeDeck, loadIdeas]);

  function resetComposer() {
    setIdea("");
    setFile(null);
    setFileName(null);
    setError(null);
    setBusy(false);
    setStopping(false);
    setGenerationDeckId(null);
    setStatusIndex(0);
    setActiveDeck(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSelect(id: NavId) {
    if (id === "new-chat") {
      resetComposer();
      window.history.pushState(null, "", "/dashboard");
      return;
    }

    window.history.pushState(null, "", `/dashboard/${id}`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || isGenerating) {
      return;
    }
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

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: prompt,
        }),
      });

      const payload = (await response.json()) as {
        id?: string;
        error?: string;
      };

      if (!response.ok || !payload.id) {
        throw new Error(payload.error || "Could not start generation.");
      }

      setGenerationDeckId(payload.id);

      const detailResponse = await fetch(`/api/decks/${payload.id}`);

      if (!detailResponse.ok) {
        throw new Error("Could not load the generated deck.");
      }

      const deck = (await detailResponse.json()) as DeckDetail;

      setActiveDeck(deck);
      void loadIdeas();
      window.history.pushState(null, "", `/dashboard/deck/${deck.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleStopGeneration() {
    const deckId = activeDeck?.id ?? generationDeckId;
    if (!deckId || stopping) {
      return;
    }

    setStopping(true);
    setError(null);

    try {
      const response = await fetch(`/api/decks/${deckId}/cancel`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        status?: DeckDetail["status"];
        errorMessage?: string;
        error?: string;
      };

      if (!response.ok || payload.status !== "FAILED") {
        throw new Error(payload.error || "Could not stop deck generation.");
      }

      setActiveDeck((current) =>
        current?.id === deckId
          ? {
              ...current,
              status: "FAILED",
              errorMessage: payload.errorMessage ?? "Generation stopped.",
            }
          : current,
      );
      setBusy(false);
      void loadIdeas();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not stop generation.");
    } finally {
      setStopping(false);
    }
  }

  async function openDeck(id: string) {
    try {
      const response = await fetch(`/api/decks/${id}`);

      if (!response.ok) {
        throw new Error("Could not load this deck.");
      }

      const deck = (await response.json()) as DeckDetail;
      setActiveDeck(deck);
      setError(null);
      window.history.pushState(null, "", `/dashboard/deck/${id}`);
    } catch {
      setError("Could not open this deck.");
    }
  }

  function openPdf() {
    if (!visibleDeck) {
      return;
    }

    window.open(
      `/dashboard/pdf/${visibleDeck.id}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      className={`mx-auto flex ${
        routeTab === "wallet"
          ? "mt-2 h-[calc(100vh-6.5rem)] pb-0 md:mt-0 md:h-[calc(100vh-6rem)]"
          : routeTab === "ideas"
          ? "h-[calc(100vh-6.25rem)]"
          : "min-h-[calc(100vh-6.25rem)]"
      } w-[calc(100%-2rem)] max-w-[1400px] gap-3 md:gap-4 ${
        routeTab === "wallet" ? "" : "pb-4"
      }`}
    >
      <DashboardSidebar
        className="hidden md:flex"
        collapsed={collapsed}
        active={active}
        onToggle={() => setCollapsed((value) => !value)}
        onSelect={handleSelect}
      />

      <section
        className={`relative flex min-w-0 flex-1 flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-3xl shadow-[0_8px_40px_rgba(0,0,0,0.28)] transition-[flex-basis,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-5 md:p-7 ${
          routeTab === "ideas" || routeTab === "wallet"
            ? "h-full min-h-0 overflow-hidden"
            : "min-h-[calc(100vh-7.25rem)]"
        } ${routeTab === "wallet" ? "pb-2 sm:pb-2" : ""}`}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/45 to-transparent" />

        {routeTab === "ideas" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="font-heading text-2xl font-semibold text-white">
              Ideas
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Your previous pitch deck prompts.
            </p>

            <div className="mt-6 flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {ideas.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No ideas yet. Start a new chat to create one.
                </p>
              ) : (
                ideas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void openDeck(item.id)}
                    className="flex items-center min-h-[60px] w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:border-[#d09a82]/30 hover:bg-white/[0.07]"
                  >
                    <p className="truncate w-full font-sans text-sm font-semibold text-zinc-100">
                      {item.title || item.idea}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : routeTab === "wallet" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <WalletView />
          </div>
        ) : (
          <div
            className={`flex flex-col ${
              isComplete ? "w-full" : "min-h-0 flex-1"
            }`}
          >
            <div
              className={`flex flex-col ${
                isComplete
                  ? "w-full items-stretch"
                  : "min-h-0 flex-1 items-center justify-center"
              }`}
            >
              {!isGenerating && !isComplete ? (
                <div className="max-w-2xl text-center">
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Welcome, {greeting}
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-base">
                    Describe your startup, product, or story and I will turn it
                    into a pitch deck.
                  </p>
                </div>
              ) : null}

              {isGenerating ? (
                <div className="flex max-w-xl flex-col items-center gap-4 text-center">
                  <p className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                    {idea.trim() || visibleDeck?.idea}
                  </p>

                  <GenerationStatus
                    message={
                      visibleDeck?.status === "PENDING"
                        ? "Queued — getting ready"
                        : STATUS_MESSAGES[statusIndex]
                    }
                  />
                </div>
              ) : null}

              {visibleDeck?.status === "FAILED" ? (
                <p className="mt-4 text-sm text-rose-300">
                  {visibleDeck.errorMessage ||
                    "Generation failed. Try another idea."}
                </p>
              ) : null}

              {isComplete ? (
                <div className="mx-auto w-full max-w-4xl space-y-6 pb-8">
                  <SlideDeckViewer
                    title={visibleDeck.title || "Untitled deck"}
                    generatedAt={visibleDeck.createdAt}
                    slides={visibleDeck.slides}
                    onOpenPdf={openPdf}
                  />
                </div>
              ) : null}
            </div>

            {!isComplete ? (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="mt-6 flex shrink-0 items-end gap-2 rounded-[24px] border border-white/12 bg-white/[0.05] p-3 backdrop-blur-2xl"
                >
                  <label htmlFor="deck-idea" className="sr-only">
                    Describe your pitch deck idea
                  </label>

                  <textarea
                    ref={ideaInputRef}
                    id="deck-idea"
                    rows={1}
                    value={idea}
                    onChange={(event) => setIdea(event.target.value)}
                    onInput={(event) => {
                      const input = event.currentTarget;
                      input.style.height = "auto";
                      input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
                    }}
                    disabled={isGenerating}
                    placeholder="A fintech for college students that rounds up spare change into index funds..."
                    className="max-h-40 min-h-10 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 font-sans text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-500 disabled:opacity-60"
                  />

                  <div className="flex shrink-0 items-center gap-2">
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
                      disabled={isGenerating}
                      className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-300 transition hover:bg-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <PaperclipIcon aria-hidden="true" className="size-4" />
                    </button>

                    {isGenerating ? (
                      <button
                        type="button"
                        aria-label="Stop deck generation"
                        title={
                          stopping
                            ? "Stopping generation..."
                            : generationDeckId || activeDeck?.id
                              ? "Stop generation"
                              : "Starting generation..."
                        }
                        onClick={() => void handleStopGeneration()}
                        disabled={
                          stopping || (!generationDeckId && !activeDeck?.id)
                        }
                        className="flex size-10 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/15 text-rose-200 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <StopIcon
                          aria-hidden="true"
                          weight="fill"
                          className="size-4"
                        />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        aria-label="Submit idea"
                        disabled={busy}
                        className="flex size-10 items-center justify-center rounded-full border border-[#d09a82]/40 bg-[#d09a82]/20 text-[#e2b09b] transition hover:bg-[#d09a82]/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <PaperPlaneTiltIcon
                          aria-hidden="true"
                          className="size-4"
                        />
                      </button>
                    )}
                  </div>
                </form>

                {fileName ? (
                  <p className="mt-2 truncate text-xs text-zinc-500">
                    Attached: {fileName}
                  </p>
                ) : null}

                {error ? (
                  <p className="mt-2 text-xs text-rose-300">{error}</p>
                ) : null}
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
