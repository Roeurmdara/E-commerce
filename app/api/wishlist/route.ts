import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          images: true,
        },
      },
    },
  })

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { productId } = await req.json()

  const exists = await prisma.wishlist.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  })

  if (exists) {
    return NextResponse.json(
      { error: "Already in wishlist" },
      { status: 409 }
    )
  }

  const item = await prisma.wishlist.create({
    data: {
      userId: session.user.id,
      productId,
    },
  })

  return NextResponse.json(item)
}