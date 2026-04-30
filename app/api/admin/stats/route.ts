import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ← named import, not default

export async function GET(req: NextRequest) {
  try {
    const session = await auth(); // ← replaces getServerSession in v5

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [totalUsers, totalSellers, totalProducts, totalOrders, pendingSellers] =
      await Promise.all([
        prisma.user.count(),
        prisma.sellerProfile.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.sellerProfile.count({
          where: { status: 'PENDING' },
        }),
      ]);

    const orders = await prisma.order.findMany({
      select: { totalAmount: true },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return NextResponse.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingSellers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}