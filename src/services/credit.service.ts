import { CreditTransactionStatus, CreditTransactionType } from "@/app/generated/prisma/enums";
import prisma from "../lib/db";
import { AddCreditsInput, ConsumeCreditsInput, RefundCreditsInput } from "../types/credit";

export async function addCredits(
    input: AddCreditsInput
) {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
            where: { id: input.userId },
            select: { credits: true }
        });

        if (!user) {
            throw new Error("User not found")
        };

        if (input.amount <= 0) {
            throw new Error("Amount must be greater than 0")
        }

        await tx.user.update({
            where: { id: input.userId },
            data: {
                credits: {
                    increment: input.amount
                }
            }
        });


        const creditTransaction = await tx.creditTransaction.create({
            data: {
                userId: input.userId,
                amount: input.amount,
                type:
                    input.type,
                purchaseId: input.purchaseId,
                status: CreditTransactionStatus.SUCCESS
            },
        })
        return creditTransaction;
    })
}


export async function consumeCredits(
    input: ConsumeCreditsInput
) {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: input.userId },
            select: { credits: true }
        });

        if (!user) {
            throw new Error("User not found");
        };

        if (user.credits < input.amount) {
            throw new Error("Insufficient credits");
        };

        await tx.user.update({
            where: { id: input.userId },
            data: {
                credits: {
                    decrement: input.amount
                }
            }
        });

        const transaction =
            await tx.creditTransaction.create({
                data: {
                    userId: input.userId,
                    deckId: input.deckId,
                    amount: -input.amount,
                    type:
                        CreditTransactionType.DECK_GENERATION,
                    status: CreditTransactionStatus.SUCCESS
                },
            })

        console.log(transaction)

        return transaction
    })
}



export async function refundCredits(
    input: RefundCreditsInput
) {
    if (input.amount <= 0) {
        throw new Error("Amount must be greater than 0 for refundCredit");
    }

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: {
                id: input.userId,
            },
            select: {
                id: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        };

        await tx.user.update({
            where: {
                id: input.userId,
            },
            data: {
                credits: {
                    increment: input.amount,
                },
            },
        });

        const creditTransaction =
            await tx.creditTransaction.create({
                data: {
                    userId: input.userId,
                    deckId: input.deckId,
                    amount: input.amount,
                    type: CreditTransactionType.REFUND,
                    status: CreditTransactionStatus.SUCCESS,
                },
            });

        return creditTransaction;
    })
}
