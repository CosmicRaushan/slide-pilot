import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/src/auth/actions";
import { CREDIT_PACKAGES } from "@/src/config/credit-package";
import {
  createRazorpayOrder,
  getRazorpayClient,
  getRazorpayKeyId,
} from "@/src/lib/razorpay/razorpay.service";
import { createPendingPurchase } from "@/src/services/purchase.service";

const createPurchaseSchema = z.object({
  packageId: z.enum(["starter", "pro", "business", "test"]),
});

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = createPurchaseSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "A valid credit package is required" },
      { status: 400 },
    );
  }

  const { packageId } = parsedBody.data;
  if (
    packageId === "test" &&
    process.env.NODE_ENV !== "development"
  ) {
    return NextResponse.json(
      { error: "Test purchases are only available in development" },
      { status: 400 },
    );
  }

  const creditPackage = CREDIT_PACKAGES[packageId ?? "test"];

  let keyId: string;
  try {
    getRazorpayClient();
    keyId = getRazorpayKeyId();
  } catch {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  if (packageId === "test" && !keyId.startsWith("rzp_test_")) {
    return NextResponse.json(
      { error: "The ₹5 test package requires Razorpay test-mode credentials" },
      { status: 400 },
    );
  }

  const receipt = randomUUID();

  let providerOrder;
  try {
    providerOrder = await createRazorpayOrder({
      amountPaise: creditPackage.amountPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: session.user.id,
        packageId: creditPackage.id,
      },
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { error: "Could not create payment order" },
      { status: 502 },
    );
  }

  if (
    typeof providerOrder.id !== "string" ||
    providerOrder.amount !== creditPackage.amountPaise ||
    providerOrder.currency !== "INR"
  ) {
    console.error("Razorpay returned an invalid order response");
    return NextResponse.json(
      { error: "Payment provider returned an invalid order" },
      { status: 502 },
    );
  }

  try {
    const purchase = await createPendingPurchase({
      userId: session.user.id,
      razorpayOrderId: providerOrder.id,
      packageId,
    });

    return NextResponse.json(
      {
        purchase: {
          id: purchase.id,
          orderId: providerOrder.id,
          packageId: creditPackage.id ?? null,
          packageName: creditPackage.name,
          credits: creditPackage.credits,
          amountPaise: creditPackage.amountPaise,
          paymentMethod: null,
          status: purchase.status,
          createdAt: purchase.createdAt.toISOString(),
        },
        keyId,
        currency: "INR",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Razorpay order was created but its pending purchase could not be saved:",
      error,
    );
    return NextResponse.json(
      { error: "Could not save pending purchase" },
      { status: 500 },
    );
  }
}
