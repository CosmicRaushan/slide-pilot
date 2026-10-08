"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  deckId: string | null;
  deck: string | null;
  date: string;
  type: string;
  amount: number;
  status: string;
};

export default function WalletView() {
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWallet() {
      try {
        const response = await fetch("/api/wallet");

        if (!response.ok) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        const data = (await response.json()) as {
          credits: number;
          transactions: Transaction[];
        };

        if (isMounted) {
          setAvailableCredits(data.credits ?? 0);
          setTransactions(data.transactions ?? []);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void fetchWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBuyCredits = () => {
    // Add backend logic here to handle credit purchase or open payment gateway modal
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-2">
      <header className="shrink-0">
        <h1 className="font-heading text-2xl font-semibold text-white">
          Wallet
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your balance and view credit transactions.
        </p>
      </header>

      <section
        aria-labelledby="available-credits-heading"
        className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.075] to-white/[0.025] px-4 py-3 backdrop-blur-3xl md:px-5 md:py-3"
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/40 to-transparent" />

        <div className="relative flex flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBuyCredits}
            className="order-last shrink-0 rounded-full border border-white/20 bg-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-100 transition hover:border-white/30 hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d09a82] md:order-first md:mr-4 md:px-5 md:py-2.5 md:text-sm"
          >
            Buy Credits
          </button>
          <div className="min-w-0">
            <p className="text-sm text-zinc-500">
              {availableCredits === 1
                ? "credit available"
                : "credits available"}
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {loading && availableCredits === null
                ? "..."
                : (availableCredits ?? 0)}
            </h2>
          </div>

        </div>
      </section>

      <section
        aria-labelledby="transactions-heading"
        className="mb-2 flex min-h-0 min-w-0 flex-[1_1_0%] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-3xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-2 py-2 sm:px-6">
          <h2
            id="transactions-heading"
            className="font-heading text-base font-semibold text-white"
          >
            Transactions
          </h2>
          <span className="text-xs text-zinc-500">
            {transactions.length}{" "}
            {transactions.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="min-h-0 min-w-0 flex-[1_1_0%] overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b  bg-[#181414]">
                <th
                  scope="col"
                  className="w-[34%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[24%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Deck
                </th>
                <th
                  scope="col"
                  className="w-[18%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[20%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="w-[17%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[20%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="w-[12%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[14%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="w-[19%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[22%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="min-w-0 px-1 py-3 sm:px-3 sm:py-4">
                    <span
                      title={transaction.deck ?? "No deck"}
                      className="block truncate rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[9px] text-zinc-300 sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      {transaction.deck ?? "-"}
                    </span>
                  </td>
                  <td
                    title={transaction.date}
                    className="truncate whitespace-nowrap px-1 py-3 text-[9px] text-zinc-300 sm:px-3 sm:py-4 sm:text-sm"
                  >
                    <span className="sm:hidden">
                      {transaction.date}
                    </span>
                    <span className="hidden sm:inline">{transaction.date}</span>
                  </td>
                  <td className="truncate px-1 py-3 sm:px-3 sm:py-4">
                    <span className="block truncate whitespace-nowrap rounded-lg bg-white/[0.05] px-1.5 py-1 text-[9px] text-zinc-300 sm:inline-flex sm:px-3 sm:py-1.5 sm:text-xs">
                      {transaction.type === "DECK_GENERATION"
                        ? "Deck"
                        : transaction.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-1 py-3 sm:px-3 sm:py-4">
                    <span
                      className={`
                        text-[9px] font-semibold tabular-nums sm:text-sm
                        ${transaction.amount > 0 ? "text-emerald-400" : "text-rose-400"}
                      `}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                  </td>
                  <td className="min-w-0 px-1 py-3 sm:px-3 sm:py-4">
                    <span
                      className={`
                        inline-flex max-w-full items-center truncate whitespace-nowrap rounded-full border px-1.5 py-1 text-[8px] font-medium sm:px-3 sm:text-xs
                        ${
                          transaction.status === "SUCCESS"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : transaction.status === "FAILED"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        }
                      `}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && transactions.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4">
              <p className="text-sm text-zinc-500" role="status">
                Loading transactions...
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4">
              <p className="text-sm text-zinc-500">No transactions yet.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
