import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { quantity } = await request.json()
    const qty = Number(quantity)

    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Quantity must be >= 1" }, { status: 400 })
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: { product: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    if (qty > item.product.stock) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: qty },
      include: {
        product: {
          include: {
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[CART_PATCH]", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}

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

    const item = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.cartItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CART_DELETE]", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}