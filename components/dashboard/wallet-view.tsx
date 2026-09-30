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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 space-y-6">
      <div>
        <p className=" text-sm text-zinc-400">
          Manage your balance and view credit transactions.
        </p>
      </div>

      <section
        className="
          relative overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
          p-5 md:p-6
        "
      >
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d09a82]/40 to-transparent" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider text-zinc-500">
              Available Credits
            </p>

            <h2 className="mt-2 text-4xl font-bold text-white md:text-5xl">
              {loading && availableCredits === null
                ? "..."
                : (availableCredits ?? 0)}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleBuyCredits}
            className="
              rounded-4xl
              border border-white/20
              bg-white/10
              px-5
              py-2
              font-medium
              text-zinc-100
              transition-all
              hover:border-white/30
              hover:bg-white/15
            "
          >
            Buy Credits
          </button>
        </div>
      </section>

      <section
        className="
          overflow-hidden
          rounded-2xl
          border border-white/10
          bg-white/[0.04]
          backdrop-blur-3xl
        "
      >
        <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <h2 className="font-heading text-base font-semibold text-white">
            Transactions
          </h2>
        </div>

        <div className="overflow-y-auto">
          <table className="min-w-full">
            <thead className="sticky ">
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Deck NAME
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="
                    border-b border-white/5
                    transition-colors
                    hover:bg-white/[0.03]
                  "
                >
                  <td className="px-6 py-4">
                    <span
                      className="
                        rounded-xl
                        border border-white/10
                        bg-white/[0.04]
                        px-3 py-1
                        text-xs text-zinc-300
                      "
                    >
                      {transaction.deck?.split(" ").slice(0, 4).join(" ") ??
                        "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {transaction.date}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className="
                        rounded-xl
                        bg-white/[0.05]
                        px-3 py-1
                        text-xs
                        text-zinc-300
                      "
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`
                        text-sm font-semibold
                        ${
                          transaction.amount > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex items-center
                        rounded-full
                        px-3 py-1
                        text-xs
                        font-medium
                        ${
                          transaction.status === "SUCCESS"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : transaction.status === "FAILED"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
            <div className="flex h-40 items-center justify-center">
              <p className="text-zinc-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-zinc-500">No transactions found.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
