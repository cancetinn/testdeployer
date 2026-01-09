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

        const bot = await prisma.publishedBot.findUnique({
            where: { slug }
        });

        if (!bot) {
            return new NextResponse('Not Found', { status: 404 });
        }

        const reviews = await prisma.botReview.findMany({
            where: { botId: bot.id },
            include: {
                author: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { slug } = await params;
        const { content, rating } = await request.json();

        if (!content || !rating || rating < 1 || rating > 5) {
            return new NextResponse('Invalid review data', { status: 400 });
        }

        const bot = await prisma.publishedBot.findUnique({
            where: { slug }
        });

        if (!bot) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Can't review own bot
        if (bot.authorId === userId) {
            return new NextResponse('Cannot review your own bot', { status: 400 });
        }

        // Upsert review (update if exists)
        const review = await prisma.botReview.upsert({
            where: {
                botId_authorId: {
                    botId: bot.id,
                    authorId: userId
                }
            },
            update: {
                content,
                rating
            },
            create: {
                content,
                rating,
                botId: bot.id,
                authorId: userId
            },
            include: {
                author: {
                    select: { id: true, name: true }
                }
            }
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

