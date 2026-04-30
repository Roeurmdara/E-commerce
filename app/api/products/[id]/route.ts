import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: {
              select: {
                storeName: true,
                storeImage: true,
                rating: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const similarItems = await prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ averageRating: "desc" }, { createdAt: "desc" }],
      take: 4,
    })

    return NextResponse.json({
      ...product,
      similarItems,
    })
  } catch (error) {
    console.error("[PRODUCT_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}
