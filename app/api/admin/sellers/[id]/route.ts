import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (!['approve', 'reject', 'block'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData.status = 'APPROVED';
        updateData.verificationStatus = 'verified';
        break;
      case 'reject':
        updateData.status = 'REJECTED';
        updateData.verificationStatus = 'rejected';
        break;
      case 'block':
        updateData.status = 'BLOCKED';
        break;
    }

    const updatedSeller = await prisma.sellerProfile.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error('Error updating seller:', error);
    return NextResponse.json(
      { error: 'Failed to update seller' },
      { status: 500 }
    );
  }
}
