
import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get seller profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sellerProfile: true },
    });

    if (!user?.sellerProfile) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    // Get seller stats
    const [totalProducts, totalOrders, recentOrders] = await Promise.all([
      prisma.product.count({
        where: { sellerId: user.id, isActive: true },
      }),
      prisma.order.count({
        where: { sellerId: user.id },
      }),
      prisma.order.findMany({
        where: { sellerId: user.id },
        include: {
          customer: { select: { name: true, email: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalRevenue = recentOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating: user.sellerProfile.rating,
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
