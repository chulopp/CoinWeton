import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
