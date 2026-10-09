"use client";

import { useState } from "react";

import { CREDIT_PACKAGES } from "@/src/config/credit-package";

type BillingPageContentProps = {
  layout?: "page" | "dialog";
  allowTestPurchase?: boolean;
  onPurchaseCreated?: (purchase: CreatedPurchase) => void;
  onPurchaseCompleted?: (purchase: CreatedPurchase, credits: number) => void;
};

export type CreatedPurchase = {
  id: string;
  orderId: string;
  packageId: string;
  packageName: string;
  credits: number;
  amountPaise: number;
  paymentMethod: string | null;
  status: string;
  createdAt: string;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme: { color: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal: { ondismiss: () => void };
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: () => void,
  ) => void;
};

type RazorpayCheckoutConstructor = new (
  options: RazorpayCheckoutOptions,
) => RazorpayCheckoutInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayCheckoutConstructor;
  }
}

let checkoutScriptPromise: Promise<RazorpayCheckoutConstructor> | null = null;

function loadRazorpayCheckout() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payment checkout is unavailable."));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          checkoutScriptPromise = null;
          script.remove();
          reject(new Error("Could not initialize payment checkout."));
        }
      };
      script.onerror = () => {
        checkoutScriptPromise = null;
        script.remove();
        reject(new Error("Could not load Razorpay Checkout."));
      };
      document.body.appendChild(script);
    });
  }

  return checkoutScriptPromise;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function BillingPageContent({
  layout = "page",
  allowTestPurchase = false,
  onPurchaseCreated,
  onPurchaseCompleted,
}: BillingPageContentProps) {
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(
    null,
  );
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const creditPackages = Object.values(CREDIT_PACKAGES).filter(
    (creditPackage) =>
      creditPackage.id !== "test" ||
      (layout === "dialog" && allowTestPurchase),
  );

  async function createPurchase(packageId: string) {
    if (creatingPackageId) {
      return;
    }

    setCreatingPackageId(packageId);
    setPurchaseMessage(null);
    setPurchaseError(null);

    try {
      const RazorpayCheckout = await loadRazorpayCheckout();
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const result = (await response.json()) as {
        purchase?: CreatedPurchase;
        keyId?: string;
        currency?: string;
        error?: string;
      };

      if (!response.ok || !result.purchase) {
        throw new Error(result.error ?? "Could not create the purchase.");
      }

      onPurchaseCreated?.(result.purchase);

      if (!result.keyId || !result.currency) {
        throw new Error("Payment checkout could not be initialized.");
      }

      const currentPurchase = result.purchase;
      const checkout = new RazorpayCheckout({
        key: result.keyId,
        amount: currentPurchase.amountPaise,
        currency: result.currency,
        name: "SlidePilot",
        description: `${currentPurchase.packageName} credit package`,
        order_id: currentPurchase.orderId,
        theme: { color: "#18181b" },
        handler: (checkoutResponse) => {
          void (async () => {
            try {
              const verifyResponse = await fetch("/api/purchases/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(checkoutResponse),
              });
              const verifyResult = (await verifyResponse.json()) as {
                purchase?: Pick<
                  CreatedPurchase,
                  | "id"
                  | "orderId"
                  | "packageId"
                  | "credits"
                  | "amountPaise"
                  | "paymentMethod"
                  | "status"
                  | "createdAt"
                >;
                credits?: number;
                error?: string;
              };

              if (
                !verifyResponse.ok ||
                !verifyResult.purchase ||
                typeof verifyResult.credits !== "number"
              ) {
                throw new Error(
                  verifyResult.error ?? "Could not verify the payment.",
                );
              }

              const completedPurchase: CreatedPurchase = {
                ...currentPurchase,
                ...verifyResult.purchase,
              };
              onPurchaseCreated?.(completedPurchase);
              onPurchaseCompleted?.(completedPurchase, verifyResult.credits);
              setPurchaseMessage(
                `Payment successful. Your ${completedPurchase.credits} credits are ready to use.`,
              );
            } catch (error) {
              setPurchaseError(
                error instanceof Error
                  ? error.message
                  : "Could not verify the payment.",
              );
            } finally {
              setCreatingPackageId(null);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setCreatingPackageId(null);
            setPurchaseMessage(
              "Checkout closed. Any payment confirmation will be verified before credits are added.",
            );
          },
        },
      });

      checkout.on("payment.failed", () => {
        setCreatingPackageId(null);
        setPurchaseError(
          "Payment did not complete. You can try again from the credit packs.",
        );
      });
      checkout.open();
      setPurchaseMessage("Complete your payment in the Razorpay checkout.");
    } catch (error) {
      setPurchaseError(
        error instanceof Error
          ? error.message
          : "Could not create the purchase.",
      );
    } finally {
      setCreatingPackageId(null);
    }
  }

  return (
    <main
      className={
        layout === "dialog"
          ? "w-full"
          : "mx-auto w-full max-w-6xl px-4 pt-28 pb-14 sm:px-6 lg:px-8"
      }
    >
      <header className="mb-8">
        <h1
          className={`font-heading font-semibold tracking-tight text-white ${
            layout === "dialog"
              ? "text-2xl sm:text-3xl"
              : "mt-3 text-3xl sm:text-4xl"
          }`}
        >
          Credits for your next big idea.
        </h1>
       
      </header>

      <section aria-labelledby="credit-packs-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2
              id="credit-packs-heading"
              className="font-heading text-xl font-semibold text-white"
            >
              Choose a credit pack
            </h2>
          </div>
        </div>

        <div
          className={
            layout === "dialog"
              ? "grid w-full grid-cols-3 gap-2 sm:gap-3"
              : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          }
        >
          {creditPackages.map((creditPackage) => (
            <article
              key={creditPackage.id}
              className={`relative flex ${
                layout === "dialog"
                  ? "min-h-56 min-w-0 p-2.5 sm:p-4"
                  : "min-h-64 p-5"
              } flex-col overflow-hidden rounded-2xl border bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.055] ${
                creditPackage.id === "pro"
                  ? "border-white/25"
                  : "border-white/10"
              }`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/15"
              />
              <div className="flex min-h-6 min-w-0 items-center justify-between gap-1">
                <h3
                  className={`truncate font-heading font-semibold text-zinc-100 ${
                    layout === "dialog" ? "text-xs sm:text-base" : "text-base"
                  }`}
                >
                  {creditPackage.name}
                </h3>
                {layout !== "dialog" && creditPackage.id === "test" ? (
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                    Test only
                  </span>
                ) : creditPackage.id === "pro" ? (
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-300">
                    Popular
                  </span>
                ) : null}
              </div>

              <p
                className={`mt-6 truncate font-semibold tracking-tight text-white ${
                  layout === "dialog"
                    ? "text-xl sm:text-3xl"
                    : "text-3xl"
                }`}
              >
                {currency.format(creditPackage.amountPaise / 100)}
              </p>
              <p
                className={`mt-1 text-zinc-400 ${
                  layout === "dialog" ? "text-[10px] sm:text-sm" : "text-sm"
                }`}
              >
                {creditPackage.credits} credits
              </p>

              <div className="mt-auto pt-7">
                <button
                  type="button"
                  onClick={() => void createPurchase(creditPackage.id)}
                  disabled={creatingPackageId !== null}
                  className={`relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.07] px-2 text-xs font-medium text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_20px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4 sm:text-sm ${
                    layout === "dialog" ? "h-9 sm:h-11" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/30"
                  />
                  {creatingPackageId === creditPackage.id
                    ? "Opening checkout..."
                    : "Buy credits"}
                </button>
              </div>
            </article>
          ))}
        </div>

        {layout === "dialog" && allowTestPurchase ? (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                Razorpay test-mode purchase
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Pay ₹5 using Razorpay test credentials. Credits are added only
                after the server verifies the payment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void createPurchase("test")}
              disabled={creatingPackageId !== null}
              className="relative shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/[0.07] px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-xl transition hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingPackageId === "test"
                ? "Opening test checkout..."
                : "Pay ₹5 in test mode"}
            </button>
          </div>
        ) : null}

        {purchaseMessage ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs leading-5 text-zinc-300" role="status">
            {purchaseMessage}
          </p>
        ) : null}
        {purchaseError ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs leading-5 text-zinc-300" role="alert">
            {purchaseError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
