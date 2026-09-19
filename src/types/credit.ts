
export type CreditTransactionStatus = "PENDING" | "SUCCESS" | "FAILED";


export type CreditTransactionType = "PURCHASE" | "DECK_GENERATION" | "REFUND" | "BONUS" | "ADMIN_ADJUSTMENT"


export type AddCreditsInput = {
    userId: string
    amount: number
    type: CreditTransactionType
    purchaseId?: string
}

export type ConsumeCreditsInput = {
    userId: string
    amount: number
    deckId: string
};

export type RefundCreditsInput = {
    userId: string
    amount: number
    deckId?: string
}