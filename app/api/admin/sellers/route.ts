import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get filter from query
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    let whereClause: any = {};
    if (filter !== 'all') {
      whereClause.status = filter.toUpperCase();
    }

    // Get sellers with related data
    const sellers = await prisma.sellerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sellers' },
      { status: 500 }
    );
  }
}
