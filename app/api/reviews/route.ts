import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, rating, title, comment } = await request.json()

    if (!productId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Invalid review data" },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId: session.user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Update product average rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId },
    })

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: avgRating,
        reviewCount: allReviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("[REVIEW_POST]", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}
