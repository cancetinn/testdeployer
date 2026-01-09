import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const deployments = await prisma.deployment.findMany({
            where: {
                bot: {
                    ownerId: session.user.id
                }
            },
            orderBy: {
                startedAt: 'desc'
            },
            include: {
                bot: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            },
            take: 50
        });

        return NextResponse.json(deployments);
    } catch (error) {
        console.error("Failed to fetch deployments:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
