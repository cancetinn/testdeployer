import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category');
        const sort = searchParams.get('sort') || 'popular';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');

        const where: any = {
            status: 'approved',
            isPublic: true,
        };

        if (category && category !== 'all') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { tags: { contains: search } },
            ];
        }

        let orderBy: any = {};
        switch (sort) {
            case 'recent':
                orderBy = { createdAt: 'desc' };
                break;
            case 'downloads':
                orderBy = { downloads: 'desc' };
                break;
            case 'stars':
                orderBy = { stars: 'desc' };
                break;
            case 'popular':
            default:
                orderBy = [{ stars: 'desc' }, { downloads: 'desc' }];
                break;
        }

        const [bots, total] = await Promise.all([
            prisma.publishedBot.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    author: {
                        select: { id: true, name: true }
                    },
                    _count: {
                        select: { reviews: true }
                    }
                }
            }),
            prisma.publishedBot.count({ where })
        ]);

        // Calculate average rating for each bot
        const botsWithRating = await Promise.all(
            bots.map(async (bot) => {
                const avgRating = await prisma.botReview.aggregate({
                    where: { botId: bot.id },
                    _avg: { rating: true }
                });
                return {
                    ...bot,
                    avgRating: avgRating._avg.rating || 0
                };
            })
        );

        return NextResponse.json({
            bots: botsWithRating,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching community bots:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
