import Image from "next/image";
import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";

import { GoogleSignInForm } from "@/components/auth/google-sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Chai AI Code Reviewer with your Google account.",
};

type SignInPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

const SignInPage = async ({ searchParams }: SignInPageProps) => {
  const { callbackUrl } = await searchParams;

  return (
    <>
      {" "}
      <Card
        className="
       w-full max-w-md
       border border-white/15
       bg-white/10
       text-white
       shadow-[0_20px_80px_rgba(0,0,0,0.35)]
       backdrop-blur-2xl
       supports-[backdrop-filter]:bg-white/[0.08]
     "
      >
        {" "}
        <CardHeader className="items-center text-center">
          {" "}
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">
            Welcome on Slidepilot
          </CardTitle>
          <CardDescription className="mt-2 text-white/65">
            Sign in with Google to manage your presentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <GoogleSignInForm callbackUrl={callbackUrl} />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
      </Card>
    </>
  );
};

export default SignInPage;
