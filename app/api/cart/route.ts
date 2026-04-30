import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
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

    return NextResponse.json(cartItems)
  } catch (error) {
    console.error("[CART_GET]", error)
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity = 1, size, color } = await request.json()

    const qty = Number(quantity)
    const normalizedSize = typeof size === "string" && size.trim() ? size.trim() : undefined
    const normalizedColor = typeof color === "string" && color.trim() ? color.trim() : undefined

    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (qty > product.stock) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        size: normalizedSize ?? null,
        color: normalizedColor ?? null,
      },
    })

    if (existing) {
      const nextQty = existing.quantity + qty
      if (nextQty > product.stock) {
        return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
      }

      const cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQty },
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

      return NextResponse.json(cartItem, { status: 200 })
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity: qty,
        size: normalizedSize,
        color: normalizedColor,
      },
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

    return NextResponse.json(cartItem, { status: 201 })
  } catch (error) {
    console.error("[CART_POST]", error)
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}