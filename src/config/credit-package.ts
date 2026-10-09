export type CreditPackageId = "starter" | "pro" | "business" | "test";

export interface CreditPackage {
  id: CreditPackageId;
  name: string;
  credits: number;
  amountPaise: number;
}

export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 10,
    amountPaise: 4_900,
  },
  pro: {
    id: "pro",
    name: "Pro",
    credits: 50,
    amountPaise: 19_900,
  },
  business: {
    id: "business",
    name: "Business",
    credits: 150,
    amountPaise: 49_900,
  },
  test: {
    id: "test",
    name: "Test",
    credits: 5,
    amountPaise: 500,
  },
} as const satisfies Record<CreditPackageId, CreditPackage>;
