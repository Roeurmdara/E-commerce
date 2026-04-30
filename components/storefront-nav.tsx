"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, Package, User, LayoutDashboard } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type StorefrontNavProps = {
  sticky?: boolean
}

const customerLinks = [
  { href: "/products", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
]

function getInitials(name?: string | null, email?: string | null) {
  const value = name?.trim() || email?.trim() || "A"
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

export function StorefrontNav({ sticky = false }: StorefrontNavProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const dashboardHref =
    session?.user?.role === "ADMIN"
      ? "/admin/dashboard"
      : session?.user?.role === "SELLER"
        ? "/seller/dashboard"
        : null

  return (
<nav
  className={`border-b border-black bg-white/90 backdrop-blur-md ${
    sticky ? "sticky top-0 z-50" : ""
  }`}
>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-black">
          FASHION
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {customerLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm  , font-mono , font-monotext-black transition hover:opacity-60 sm:text-base ${
                  isActive ? "font-medium" : ""
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center rounded-full border border-black p-1 transition hover:bg-gray-50"
                  aria-label="Open account menu"
                >
                  <Avatar className="h-9 w-9 border border-black">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "Account"}
                    />
                    <AvatarFallback className="bg-black text-white">
                      {getInitials(session.user.name, session.user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72 border-black">
                <DropdownMenuLabel className="space-y-1">
                  <p className="text-sm  , font-mono , font-monofont-semibold  text-black">
                    {session.user.name || "My Account"}
                  </p>
                  <p className="truncate text-xs font-normal text-gray-500">
                    {session.user.email}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex cursor-pointer items-center gap-2">
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>

                {dashboardHref && (
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref} className="flex cursor-pointer items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="hidden border-black text-black sm:inline-flex">
                <Link href="/auth/signup">
                  <User className="h-4 w-4" />
                  Sign Up
                </Link>
              </Button>

              <Button asChild className="bg-black text-white hover:opacity-80">
                <Link
                  href={`/auth/signin${
                    pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : ""
                  }`}
                >
                  Sign In
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}