"use client";

import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/src/auth/actions";
import { Button } from "@/components/ui/button";
import { SpinnerBallIcon } from "@phosphor-icons/react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />{" "}
      <path
        fill="#34A853"
        d="M12 21.8c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.8Z"
      />{" "}
      <path
        fill="#FBBC05"
        d="M6.54 13.88A5.86 5.86 0 0 1 6.23 12c0-.65.11-1.28.31-1.88V7.59H3.29A9.8 9.8 0 0 0 2.2 12c0 1.58.38 3.07 1.09 4.41l3.25-2.53Z"
      />{" "}
      <path
        fill="#EA4335"
        d="M12 6.09c1.43 0 2.71.49 3.72 1.45l2.78-2.78C16.84 3.22 14.63 2.2 12 2.2a9.75 9.75 0 0 0-8.71 5.39l3.25 2.53C7.31 7.81 9.46 6.09 12 6.09Z"
      />{" "}
    </svg>
  );
}


function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      disabled={pending}
      aria-busy={pending}
      className="
     relative
     w-full
     overflow-hidden
     rounded-2xl
     border border-white/20
     bg-white/10
     text-white
     shadow-[0_8px_32px_rgba(0,0,0,0.20)]
     backdrop-blur-xl
     transition-all
     duration-300
     hover:border-white/30
     hover:bg-white/20
     hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)]
     active:scale-[0.99]
     disabled:cursor-not-allowed
     disabled:opacity-70
   "
    >
      {pending ? (
        <SpinnerBallIcon
          size={32}
          className="size-5 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <GoogleIcon />
      )}

      <span>{pending ? "Redirecting to Google…" : "Continue with Google"}</span>
    </Button>
  );
}

type GoogleSignInFormProps = {
 
  callbackUrl?: string;
};


export function GoogleSignInForm({ callbackUrl }: GoogleSignInFormProps) {
  return (
    <form action={signInWithGoogle} className="w-full">
      {callbackUrl ? (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      ) : null}

      <SubmitButton />
    </form>
  );
}
