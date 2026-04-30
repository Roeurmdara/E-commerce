import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { ProductCategory, ProductBadge } from "@prisma/client"

/* =========================
   GET SELLER PRODUCTS
========================= */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      where: { sellerId: session.user.id },
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("[SELLER_PRODUCTS_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

/* =========================
   CREATE PRODUCT
========================= */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only seller accounts can create products" },
        { status: 403 }
      )
    }

    let sellerProfile = user.sellerProfile

    if (!sellerProfile) {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          storeName: user.name || `${user.email.split("@")[0]}'s Store`,
          storeDescription: "Auto-created seller profile",
        },
      })

      await prisma.sellerAnalytics.create({
        data: {
          sellerProfileId: sellerProfile.id,
        },
      })
    }

    const body = await request.json()

    const {
      name,
      description,
      categoryId,
      category,
      imageUrl,
      price,
      originalPrice,
      discountPercent = 0,
      stock = 0,
      sizes = [],
      colors = [],
      badge,

      // ✅ NEW FIELDS
      averageRating = 0,
      reviewCount = 0,
    } = body

    /* =========================
       CATEGORY RESOLVE
    ========================= */
    let resolvedCategoryId = categoryId as string | undefined

    if (!resolvedCategoryId && category) {
      const normalizedCategory =
        String(category).trim().toUpperCase() as ProductCategory

      let foundCategory = await prisma.category.findUnique({
        where: { name: normalizedCategory },
        select: { id: true },
      })

      if (
        !foundCategory &&
        ["CLOTHING", "ACCESSORIES", "SHOES"].includes(normalizedCategory)
      ) {
        foundCategory = await prisma.category.create({
          data: {
            name: normalizedCategory,
            description: `${normalizedCategory} category`,
          },
          select: { id: true },
        })
      }

      resolvedCategoryId = foundCategory?.id
    }

    /* =========================
       VALIDATION
    ========================= */
    const numericPrice = Number(price)

    const numericOriginalPrice =
      originalPrice === null ||
      originalPrice === undefined ||
      originalPrice === ""
        ? null
        : Number(originalPrice)

    const numericDiscountPercent = Number(discountPercent ?? 0)
    const numericStock = Number(stock ?? 0)

    // ✅ NEW
    const numericAverageRating = Number(averageRating ?? 0)
    const numericReviewCount = Number(reviewCount ?? 0)

    const missingFields: string[] = []

    if (!String(name ?? "").trim()) missingFields.push("name")
    if (!String(description ?? "").trim()) missingFields.push("description")
    if (!resolvedCategoryId) missingFields.push("category/categoryId")
    if (!Number.isFinite(numericPrice)) missingFields.push("price")

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      )
    }

    /* =========================
       CREATE PRODUCT
    ========================= */
    const product = await prisma.product.create({
      data: {
        sku: `SKU-${uuidv4().slice(0, 8).toUpperCase()}`,

        name,
        description,
        categoryId: resolvedCategoryId,
        sellerId: session.user.id,

        price: numericPrice,
        originalPrice: numericOriginalPrice,

        discountPercent: Number.isFinite(numericDiscountPercent)
          ? numericDiscountPercent
          : 0,

        stock: Number.isFinite(numericStock)
          ? numericStock
          : 0,

        // ✅ SAVE RATING DATA
        averageRating: Number.isFinite(numericAverageRating)
          ? Math.min(Math.max(numericAverageRating, 0), 5)
          : 0,

        reviewCount: Number.isFinite(numericReviewCount)
          ? Math.max(numericReviewCount, 0)
          : 0,

        sizes: JSON.stringify(sizes),
        colors: JSON.stringify(colors),

        badge: badge ?? null,

        isActive: true,

        images:
          imageUrl && String(imageUrl).trim()
            ? {
                create: [
                  {
                    imageUrl: String(imageUrl).trim(),
                    altText: `${name} main image`,
                    isMain: true,
                    order: 0,
                  },
                ],
              }
            : undefined,
      },

      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("[SELLER_PRODUCTS_POST]", error)

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}