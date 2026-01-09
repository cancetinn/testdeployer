import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userId = (session.user as any).id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Check for pending unread count
        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.id) return new NextResponse('Unauthorized', { status: 401 });
        const userId = (session.user as any).id;
        const { id, type } = await request.json();

        if (type === 'MARK_ALL_READ') {
            await prisma.notification.updateMany({
                where: { userId, read: false },
                data: { read: true }
            });
        } else if (id) {
            await prisma.notification.update({
                where: { id, userId },
                data: { read: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
