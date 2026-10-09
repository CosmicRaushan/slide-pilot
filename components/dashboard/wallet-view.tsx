"use client";

import { useEffect, useState } from "react";
import {
  BillingPageContent,
  type CreatedPurchase,
} from "@/components/dashboard/billing/billing-page-content";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Purchase = {
  id: string;
  plan: string;
  credits: number;
  amountPaise: number;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const paymentMethodLabels: Record<string, string> = {
  UPI: "UPI",
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  CARD: "Card",
  NET_BANKING: "Net banking",
  WALLET: "Wallet",
};

function formatPaymentMethod(method: string | null) {
  if (!method) {
    return "Not recorded";
  }

  const normalizedMethod = method.toUpperCase().replaceAll(" ", "_");

  return (
    paymentMethodLabels[normalizedMethod] ??
    method.replaceAll("_", " ")
  );
}

export default function WalletView() {
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWallet() {
      try {
        const response = await fetch("/api/wallet");

        if (!response.ok) {
          if (isMounted) {
            setLoadError("Could not load your purchase history.");
            setLoading(false);
          }
          return;
        }

        const data = (await response.json()) as {
          credits: number;
          purchases: Purchase[];
        };

        if (isMounted) {
          setAvailableCredits(data.credits ?? 0);
          setPurchases(data.purchases ?? []);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoadError("Could not load your purchase history.");
          setLoading(false);
        }
      }
    }

    void fetchWallet();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <div className="min-w-0">
            <p className="text-sm text-zinc-500">
              {availableCredits === 1
                ? "credit available"
                : "credits available"}
            </p>

            <h2
              id="available-credits-heading"
              className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl"
            >
              {loading && availableCredits === null
                ? "..."
                : (availableCredits ?? 0)}
            </h2>
          </div>
          <Dialog>
            <DialogTrigger className="relative shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_20px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.14] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 md:px-5 md:py-2.5 md:text-sm">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white/35"
              />
              Buy credits
            </DialogTrigger>
            <DialogContent className="!block !max-w-[calc(100%-1rem)] max-h-[90dvh] overflow-y-auto border border-white/15 bg-[#141212]/95 p-3 text-zinc-100 shadow-2xl backdrop-blur-3xl sm:!max-w-5xl sm:p-7">
              <DialogTitle className="sr-only">Buy credits</DialogTitle>
              <BillingPageContent
                layout="dialog"
                allowTestPurchase={process.env.NODE_ENV === "development"}
                onPurchaseCreated={(purchase: CreatedPurchase) => {
                  setPurchases((current) => [
                    {
                      id: purchase.id,
                      plan: purchase.packageName,
                      credits: purchase.credits,
                      amountPaise: purchase.amountPaise,
                      paymentMethod: purchase.paymentMethod,
                      status: purchase.status,
                      createdAt: purchase.createdAt,
                    },
                    ...current.filter((item) => item.id !== purchase.id),
                  ]);
                }}
                onPurchaseCompleted={(_, credits) => {
                  setAvailableCredits(credits);
                }}
              />
            </DialogContent>
          </Dialog>
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
            Purchase history
          </h2>
          <span className="text-xs text-zinc-500">
            {purchases.length}{" "}
            {purchases.length === 1 ? "purchase" : "purchases"}
          </span>
        </div>

        <div className="min-h-0 min-w-0 flex-[1_1_0%] overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="sticky top-0 z-10 border-b  bg-[#181414]">
                <th
                  scope="col"
                  className="w-[25%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[22%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Plan
                </th>
                <th
                  scope="col"
                  className="w-[20%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[19%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="w-[20%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[19%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Payment
                </th>
                <th
                  scope="col"
                  className="w-[16%] whitespace-nowrap px-1 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[18%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="w-[19%] whitespace-nowrap px-2 py-2 text-left text-[9px] font-semibold uppercase tracking-normal text-zinc-500 sm:w-[22%] sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="transition-colors hover:bg-white/[0.03]"
                >
                  <td className="min-w-0 px-1 py-3 sm:px-3 sm:py-4">
                    <span
                      title={`${purchase.plan} · ${purchase.credits} credits`}
                      className="block truncate rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[9px] text-zinc-300 sm:px-3 sm:py-1.5 sm:text-xs"
                    >
                      {purchase.plan}
                    </span>
                  </td>
                  <td
                    title={new Date(purchase.createdAt).toLocaleString()}
                    className="truncate whitespace-nowrap px-1 py-3 text-[9px] text-zinc-300 sm:px-3 sm:py-4 sm:text-sm"
                  >
                    {new Intl.DateTimeFormat("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(purchase.createdAt))}
                  </td>
                  <td className="truncate px-1 py-3 sm:px-3 sm:py-4">
                    <span className="block truncate whitespace-nowrap rounded-lg bg-white/[0.05] px-1.5 py-1 text-[9px] text-zinc-300 sm:inline-flex sm:px-3 sm:py-1.5 sm:text-xs">
                      {formatPaymentMethod(purchase.paymentMethod)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-1 py-3 sm:px-3 sm:py-4">
                    <span className="text-[9px] font-semibold tabular-nums text-zinc-200 sm:text-sm">
                      {currency.format(purchase.amountPaise / 100)}
                    </span>
                  </td>
                  <td className="min-w-0 px-1 py-3 sm:px-3 sm:py-4">
                    <span
                      className={`
                        inline-flex max-w-full items-center truncate whitespace-nowrap rounded-full border px-1.5 py-1 text-[8px] font-medium sm:px-3 sm:text-xs
                        ${
                          purchase.status === "SUCCESS"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : purchase.status === "FAILED"
                              ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                              : purchase.status === "REFUNDED"
                                ? "border-white/15 bg-white/[0.06] text-zinc-300"
                              : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                        }
                      `}
                    >
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && purchases.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4">
              <p className="text-sm text-zinc-500" role="status">
                Loading purchase history...
              </p>
            </div>
          ) : loadError ? (
            <div className="flex h-40 items-center justify-center px-4">
              <p className="text-sm text-zinc-400" role="alert">
                {loadError}
              </p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4">
              <p className="text-sm text-zinc-500">No purchases yet.</p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
