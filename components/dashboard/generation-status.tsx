"use client";

type GenerationStatusProps = {
  message: string;
};

export function GenerationStatus({ message }: GenerationStatusProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <span>{message}</span>
      <span className="inline-flex gap-1" aria-hidden="true">
        <span className="size-1 rounded-full bg-[#d09a82] animate-status-dot" />
        <span
          className="size-1 rounded-full bg-[#d09a82] animate-status-dot"
          style={{ animationDelay: "0.16s" }}
        />
        <span
          className="size-1 rounded-full bg-[#d09a82] animate-status-dot"
          style={{ animationDelay: "0.32s" }}
        />
      </span>
      <span className="sr-only">Generating</span>
    </div>
  );
}
