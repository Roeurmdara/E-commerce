import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      items,
      shippingAddress,
      phoneNumber,
      sellerId,
      subtotal,
      taxAmount,
      totalAmount,
      couponCode,
    } = await request.json()

    if (!items || items.length === 0 || !shippingAddress || !sellerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
    })

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    // Handle coupon if provided
    let discountAmount = 0
    let couponId: string | null = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      })

      if (coupon && coupon.isActive && new Date() <= coupon.validUntil) {
        if (coupon.maxUses === null || coupon.currentUses < coupon.maxUses) {
          if (subtotal >= coupon.minOrderAmount) {
            if (coupon.discountType === "PERCENTAGE") {
              discountAmount = (subtotal * coupon.discountValue) / 100
              if (coupon.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
              }
            } else {
              discountAmount = coupon.discountValue
            }
            couponId = coupon.id

            // Update coupon usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { currentUses: coupon.currentUses + 1 },
            })
          }
        }
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.user.id,
        sellerId,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount: totalAmount - discountAmount,
        shippingAddress: JSON.stringify({
          address: shippingAddress,
          phone: phoneNumber,
        }),
        phoneNumber,
        couponId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: [{ isMain: "desc" }, { order: "asc" }],
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("[ORDERS_POST]", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: [{ isMain: "desc" }, { order: "asc" }],
                  take: 1,
                },
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("[ORDERS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
