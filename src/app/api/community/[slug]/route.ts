import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const session = await getServerSession(authOptions);

        const bot = await prisma.publishedBot.findUnique({
            where: { slug },
            include: {
                author: {
                    select: { id: true, name: true }
                },
                reviews: {
                    include: {
                        author: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: { reviews: true, starredBy: true }
                }
            }
        });

        if (!bot || (!bot.isPublic && bot.authorId !== session?.user?.id)) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Get average rating
        const avgRating = await prisma.botReview.aggregate({
            where: { botId: bot.id },
            _avg: { rating: true }
        });

        // Check if current user starred
        let userStarred = false;
        if (session?.user?.id) {
            const star = await prisma.botStar.findUnique({
                where: {
                    botId_userId: {
                        botId: bot.id,
                        userId: session.user.id
                    }
                }
            });
            userStarred = !!star;
        }

        return NextResponse.json({
            ...bot,
            avgRating: avgRating._avg.rating || 0,
            userStarred
        });
    } catch (error) {
        console.error('Error fetching bot:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Star/Unstar a bot
export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { slug } = await params;
        const bot = await prisma.publishedBot.findUnique({
            where: { slug }
        });

        if (!bot) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Check existing star
        const existingStar = await prisma.botStar.findUnique({
            where: {
                botId_userId: {
                    botId: bot.id,
                    userId: session.user.id
                }
            }
        });

        if (existingStar) {
            // Unstar
            await prisma.$transaction([
                prisma.botStar.delete({
                    where: { id: existingStar.id }
                }),
                prisma.publishedBot.update({
                    where: { id: bot.id },
                    data: { stars: { decrement: 1 } }
                })
            ]);
            return NextResponse.json({ starred: false });
        } else {
            // Star
            await prisma.$transaction([
                prisma.botStar.create({
                    data: {
                        botId: bot.id,
                        userId: session.user.id
                    }
                }),
                prisma.publishedBot.update({
                    where: { id: bot.id },
                    data: { stars: { increment: 1 } }
                })
            ]);
            return NextResponse.json({ starred: true });
        }
    } catch (error) {
        console.error('Error toggling star:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
