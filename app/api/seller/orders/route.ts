import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { sellerId: session.user.id },
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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        coupon: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[SELLER_ORDERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
