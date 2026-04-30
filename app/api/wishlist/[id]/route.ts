import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!wishlistItem) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 })
    }

    await prisma.wishlist.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error)
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    )
  }
}