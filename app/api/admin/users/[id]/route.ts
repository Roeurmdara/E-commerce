import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import{prisma} from '@/lib/prisma';

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

    // For now, we'll just mark user as having an admin note
    // In production, you'd add a 'blocked' or 'status' field to the User model
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        // Add your custom fields here
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
