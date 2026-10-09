import {
  CreditTransactionStatus,
  CreditTransactionType,
  PurchaseStatus,
} from "@/app/generated/prisma/enums";
import prisma from "@/src/lib/db";
import { CREDIT_PACKAGES } from "@/src/config/credit-package";
import type { CreditPackageId } from "@/src/config/credit-package";

type CreatePurchaseInput = {
  userId: string;
  razorpayOrderId: string;
  packageId?: CreditPackageId;
};

type CompletePurchaseInput = {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  paymentMethod: string;
};

type GetUserPurchaseInput = {
  userId: string;
  razorpayOrderId: string;
};

type FailPurchaseInput = {
  razorpayOrderId: string;
};

export async function createPendingPurchase(input: CreatePurchaseInput) {
  if (!input.userId.trim() || !input.razorpayOrderId.trim()) {
    throw new Error("User ID and Razorpay order ID are required");
  }

  const creditPackage = CREDIT_PACKAGES[input.packageId ?? "test"];

  if (!creditPackage) {
    throw new Error("Invalid credit package");
  }

  return prisma.purchase.create({
    data: {
      userId: input.userId,
      razorpayOrderId: input.razorpayOrderId,
      packageId: creditPackage.id,
      credits: creditPackage.credits,
      amount: creditPackage.amountPaise,
      status: PurchaseStatus.PENDING,
      description: `${creditPackage.name} credit package`,
    },
  });
}

export async function completePurchase(input: CompletePurchaseInput) {
  if (!input.userId.trim() || !input.razorpayOrderId.trim()) {
    throw new Error("User ID and Razorpay order ID are required");
  }

  if (!input.razorpayPaymentId.trim()) {
    throw new Error("Payment ID is required");
  }

  if (!input.paymentMethod.trim()) {
    throw new Error("Payment method is required");
  }

  // Call only after verifying the payment with the payment provider.
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findFirstOrThrow({
      where: {
        userId: input.userId,
        razorpayOrderId: input.razorpayOrderId,
      },
    });

    if (purchase.status === PurchaseStatus.SUCCESS) {
      if (purchase.razorpayPaymentId !== input.razorpayPaymentId) {
        throw new Error("Purchase is already linked to another payment");
      }

      return purchase;
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new Error(`Cannot complete a ${purchase.status} purchase`);
    }

    const updated = await tx.purchase.updateMany({
      where: {
        id: purchase.id,
        userId: input.userId,
        status: PurchaseStatus.PENDING,
      },
      data: {
        status: PurchaseStatus.SUCCESS,
        razorpayPaymentId: input.razorpayPaymentId,
        paymentMethod: input.paymentMethod,
      },
    });

    if (updated.count === 0) {
      const latestPurchase = await tx.purchase.findUniqueOrThrow({
        where: { id: purchase.id },
      });

      if (latestPurchase.status === PurchaseStatus.SUCCESS) {
        if (latestPurchase.razorpayPaymentId !== input.razorpayPaymentId) {
          throw new Error("Purchase is already linked to another payment");
        }

        return latestPurchase;
      }

      throw new Error(`Cannot complete a ${latestPurchase.status} purchase`);
    }

    await tx.user.update({
      where: { id: purchase.userId },
      data: {
        credits: { increment: purchase.credits },
      },
    });

    await tx.creditTransaction.create({
      data: {
        userId: purchase.userId,
        purchaseId: purchase.id,
        amount: purchase.credits,
        type: CreditTransactionType.PURCHASE,
        status: CreditTransactionStatus.SUCCESS,
      },
    });

    return tx.purchase.findUniqueOrThrow({
      where: { id: purchase.id },
    });
  });
}

export async function getPurchaseForUser(input: GetUserPurchaseInput) {
  return prisma.purchase.findFirst({
    where: {
      userId: input.userId,
      razorpayOrderId: input.razorpayOrderId,
    },
    select: {
      id: true,
      userId: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      amount: true,
      status: true,
    },
  });
}

export async function failPendingPurchase(input: FailPurchaseInput) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUniqueOrThrow({
      where: { razorpayOrderId: input.razorpayOrderId },
    });

    if (purchase.status === PurchaseStatus.FAILED) {
      return purchase;
    }

    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new Error(`Cannot fail a ${purchase.status} purchase`);
    }

    const updated = await tx.purchase.updateMany({
      where: {
        id: purchase.id,
        status: PurchaseStatus.PENDING,
      },
      data: { status: PurchaseStatus.FAILED },
    });

    if (updated.count === 0) {
      const latestPurchase = await tx.purchase.findUniqueOrThrow({
        where: { id: purchase.id },
      });

      if (latestPurchase.status === PurchaseStatus.FAILED) {
        return latestPurchase;
      }

      throw new Error(`Cannot fail a ${latestPurchase.status} purchase`);
    }

    return tx.purchase.findUniqueOrThrow({
      where: { id: purchase.id },
    });
  });
}

export async function getPurchaseHistory(userId: string, take = 50) {
  if (!Number.isInteger(take) || take < 1 || take > 100) {
    throw new Error("Purchase history limit must be between 1 and 100");
  }

  return prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      packageId: true,
      credits: true,
      amount: true,
      paymentMethod: true,
      status: true,
      createdAt: true,
    },
  });
}
