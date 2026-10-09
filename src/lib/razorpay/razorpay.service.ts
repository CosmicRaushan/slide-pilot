import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

import {
  getRazorpayClient,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
} from "./razorpay.client";

type RazorpayOrderInput = {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string | number>;
};

type RazorpayPaymentSignatureInput = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export { getRazorpayClient, getRazorpayKeyId } from "./razorpay.client";

export async function createRazorpayOrder(input: RazorpayOrderInput) {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise <= 0) {
    throw new Error("Razorpay order amount must be a positive integer in paise");
  }

  if (!input.receipt.trim() || input.receipt.length > 40) {
    throw new Error("Razorpay order receipt must contain 1 to 40 characters");
  }

  const currency = input.currency ?? "INR";
  if (currency !== "INR") {
    throw new Error("Only INR Razorpay orders are supported");
  }

  return getRazorpayClient().orders.create({
    amount: input.amountPaise,
    currency,
    receipt: input.receipt,
    notes: input.notes,
  });
}

export async function fetchRazorpayOrder(orderId: string) {
  if (!orderId.trim()) {
    throw new Error("Razorpay order ID is required");
  }

  return getRazorpayClient().orders.fetch(orderId);
}

export async function fetchRazorpayPayment(paymentId: string) {
  if (!paymentId.trim()) {
    throw new Error("Razorpay payment ID is required");
  }

  return getRazorpayClient().payments.fetch(paymentId);
}

export async function captureRazorpayPayment(
  paymentId: string,
  amountPaise: number,
) {
  if (!paymentId.trim()) {
    throw new Error("Razorpay payment ID is required");
  }

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error("Razorpay capture amount must be a positive integer in paise");
  }

  return getRazorpayClient().payments.capture(paymentId, amountPaise, "INR");
}

export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: RazorpayPaymentSignatureInput): boolean {
  if (
    !orderId.trim() ||
    !paymentId.trim() ||
    !/^[a-f\d]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expectedSignature = createHmac("sha256", getRazorpayKeySecret())
    .update(`${orderId}|${paymentId}`)
    .digest();
  const receivedSignature = Buffer.from(signature, "hex");

  return (
    expectedSignature.length === receivedSignature.length &&
    timingSafeEqual(expectedSignature, receivedSignature)
  );
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  if (!rawBody || !/^[a-f\d]{64}$/i.test(signature)) {
    return false;
  }

  return Razorpay.validateWebhookSignature(
    rawBody,
    signature,
    getRazorpayWebhookSecret(),
  );
}
