import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const search = searchParams.get("search")
    const size = searchParams.get("size")
    const color = searchParams.get("color")

    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = {
        name: category,
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          where: { isMain: true },
          take: 1,
        },
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    })

    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[PRODUCTS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
