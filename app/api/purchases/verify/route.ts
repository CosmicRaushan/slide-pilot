import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerSession } from "@/src/auth/actions";
import prisma from "@/src/lib/db";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  verifyRazorpayPaymentSignature,
} from "@/src/lib/razorpay/razorpay.service";
import {
  completePurchase,
  getPurchaseForUser,
} from "@/src/services/purchase.service";

const verifyPurchaseSchema = z.object({
  razorpay_order_id: z.string().trim().min(1).max(255),
  razorpay_payment_id: z.string().trim().min(1).max(255),
  razorpay_signature: z.string().regex(/^[a-f\d]{64}$/i),
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

  const parsedBody = verifyPurchaseSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid Razorpay payment response" },
      { status: 400 },
    );
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsedBody.data;

  let isValidSignature: boolean;
  try {
    isValidSignature = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
    });
  } catch (error) {
    console.error("Razorpay payment signature verification is unavailable:", error);
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  if (!isValidSignature) {
    return NextResponse.json(
      { error: "Payment signature is invalid" },
      { status: 400 },
    );
  }

  try {
    const purchase = await getPurchaseForUser({
      userId: session.user.id,
      razorpayOrderId: orderId,
    });

    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    let payment = await fetchRazorpayPayment(paymentId);
    if (
      payment.order_id !== orderId ||
      Number(payment.amount) !== purchase.amount ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Payment does not match the pending purchase" },
        { status: 400 },
      );
    }

    if (payment.status === "authorized" && !payment.captured) {
      try {
        payment = await captureRazorpayPayment(paymentId, purchase.amount);
      } catch (captureError) {
        payment = await fetchRazorpayPayment(paymentId);
        if (payment.status !== "captured" || !payment.captured) {
          console.error("Razorpay payment capture failed:", captureError);
          return NextResponse.json(
            {
              error:
                "Payment is authorized but could not be captured. Please contact support.",
            },
            { status: 502 },
          );
        }
      }
    }

    if (
      payment.order_id !== orderId ||
      Number(payment.amount) !== purchase.amount ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Captured payment does not match the pending purchase" },
        { status: 400 },
      );
    }

    if (payment.status !== "captured" || !payment.captured) {
      return NextResponse.json(
        {
          error: "Payment has not been captured yet.",
          status: "PENDING",
        },
        { status: 409 },
      );
    }

    const completedPurchase = await completePurchase({
      userId: session.user.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      paymentMethod: payment.method,
    });
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      purchase: {
        id: completedPurchase.id,
        orderId: completedPurchase.razorpayOrderId,
        packageId: completedPurchase.packageId,
        credits: completedPurchase.credits,
        amountPaise: completedPurchase.amount,
        paymentMethod: completedPurchase.paymentMethod,
        status: completedPurchase.status,
        createdAt: completedPurchase.createdAt.toISOString(),
      },
      credits: user.credits,
    });
  } catch (error) {
    console.error("Could not verify or complete Razorpay purchase:", error);
    return NextResponse.json(
      { error: "Could not complete this purchase. Please contact support." },
      { status: 500 },
    );
  }
}
