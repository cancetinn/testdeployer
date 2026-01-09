import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        // Generate slug
        let slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Ensure uniqueness
        const existing = await prisma.team.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        }

        const team = await prisma.team.create({
            data: {
                name,
                slug,
                members: {
                    create: {
                        userId: (session.user as any).id,
                        role: 'OWNER'
                    }
                }
            }
        });

        return NextResponse.json(team);
    } catch (error) {
        console.error('Create team error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userId = (session.user as any).id;

        const teams = await prisma.team.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        // Add memberCount from _count
        const formattedTeams = teams.map(team => ({
            ...team,
            memberCount: team._count.members
        }));

        return NextResponse.json(formattedTeams);
    } catch (error) {
        console.error('Get teams error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
