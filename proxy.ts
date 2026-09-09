import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleAuthProxy } from "./src/auth/utils/proxy";


export async function proxy(request: NextRequest) {
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  if(!request.headers.get("next-action")){
    return NextResponse.next()
  }

  return handleAuthProxy(request);
}


export const config = {
  matcher: ["/sign-in", "/dashboard", "/dashboard/:path*"],
};

export default proxy;