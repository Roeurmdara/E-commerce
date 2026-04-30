import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { storeName, storeDescription } = await request.json()

    if (!storeName) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      )
    }

    // Check if user already has a seller profile
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "You already have a seller profile" },
        { status: 409 }
      )
    }

    // Create seller profile
    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId: session.user.id,
        storeName,
        storeDescription,
      },
    })

    // Create seller analytics
    await prisma.sellerAnalytics.create({
      data: {
        sellerProfileId: sellerProfile.id,
      },
    })

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SELLER" },
    })

    return NextResponse.json(sellerProfile, { status: 201 })
  } catch (error) {
    console.error("[SELLER_REGISTER]", error)
    return NextResponse.json(
      { error: "Failed to register as seller" },
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

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        analytics: true,
      },
    })

    return NextResponse.json(sellerProfile)
  } catch (error) {
    console.error("[SELLER_GET]", error)
    return NextResponse.json(
      { error: "Failed to fetch seller profile" },
      { status: 500 }
    )
  }
}
