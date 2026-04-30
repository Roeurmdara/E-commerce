
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get seller's orders
    const orders = await prisma.order.findMany({
      where: { sellerId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        totalSales: 0,
        totalOrders: 0,
        conversionRate: 0,
        avgOrderValue: 0,
        topProducts: [],
        monthlySales: [],
      });
    }

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalSales = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const avgOrderValue = totalRevenue / totalOrders;

    // Top products
    const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.product.name,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].sales += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Monthly sales
    const monthlySalesMap: {
      [key: string]: { month: string; orders: number; revenue: number };
    } = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });

      if (!monthlySalesMap[monthKey]) {
        monthlySalesMap[monthKey] = {
          month: monthLabel,
          orders: 0,
          revenue: 0,
        };
      }

      monthlySalesMap[monthKey].orders += 1;
      monthlySalesMap[monthKey].revenue += order.totalAmount;
    });

    const monthlySales = Object.values(monthlySalesMap).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    return NextResponse.json({
      totalRevenue,
      totalSales,
      totalOrders,
      conversionRate: 0, // Would need visitor data to calculate properly
      avgOrderValue,
      topProducts,
      monthlySales,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
