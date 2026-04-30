import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href)
      return NextResponse.redirect(signInUrl)
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (pathname.startsWith("/seller")) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", req.url)
      signInUrl.searchParams.set("callbackUrl", req.nextUrl.href)
      return NextResponse.redirect(signInUrl)
    }
    if (session.user?.role !== "SELLER" && session.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/orders/:path*", "/cart/:path*"],
}
