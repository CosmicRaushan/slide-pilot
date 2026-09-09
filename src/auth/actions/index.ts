"use server"

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_AUTH_CALLBACK, SIGN_IN_PATH, getSafeCallbackPath } from "../utils";
 

export async function signInWithGoogle(formData: FormData) {
    const callback = formData.get("callbackUrl");

    const redirectTo = getSafeCallbackPath(
        typeof callback === "string" ? callback : null
    );

    const result = await auth.api.signInSocial({
        body: {
            provider: "google",
            callbackURL: redirectTo
        },
        headers: await headers()
    });

    if (result.url) {
        redirect(result.url);
    }
};

export async function getServerSession() {
    return await auth.api.getSession({
        headers: await headers()
    })
};

export async function requireAuth(redirectTo = SIGN_IN_PATH) {
    const session = await getServerSession();

    if (!session) {
        redirect(redirectTo)
    }
    return session;
};

export async function requireUnauth(redirectTo = DEFAULT_AUTH_CALLBACK) {
    const session = await getServerSession();

    if (session) {
        redirect(redirectTo)
    }
}