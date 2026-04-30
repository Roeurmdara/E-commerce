import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all metrics
    const [totalUsers, totalSellers, totalProducts, orders] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.product.count(),
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
          seller: { include: { sellerProfile: true } },
        },
      }),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top sellers
    const sellerRevenue: { [key: string]: { storeName: string; revenue: number } } = {};
    orders.forEach(order => {
      if (!sellerRevenue[order.sellerId]) {
        sellerRevenue[order.sellerId] = {
          storeName: order.seller.sellerProfile?.storeName || 'Unknown Store',
          revenue: 0,
        };
      }
      sellerRevenue[order.sellerId].revenue += order.totalAmount;
    });

    const topSellers = Object.values(sellerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top products
    const productSales: { [key: string]: { name: string; sales: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product?.name || 'Unknown Product',
            sales: 0,
          };
        }
        productSales[item.productId].sales += item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalSellers,
      totalProducts,
      avgOrderValue,
      topSellers,
      topProducts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
