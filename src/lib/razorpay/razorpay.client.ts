import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export function getRazorpayKeyId(): string {
  return getRequiredEnv("RAZORPAY_KEY_ID");
}

export function getRazorpayKeySecret(): string {
  return getRequiredEnv("RAZORPAY_KEY_SECRET");
}

export function getRazorpayWebhookSecret(): string {
  return getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
}

export function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });
  }

  return razorpayClient;
}
