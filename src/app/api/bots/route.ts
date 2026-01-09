import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncBotStatus } from "@/lib/bot-runner";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return new NextResponse("User not found", { status: 404 });

        const bots = await prisma.bot.findMany({
            where: {
                OR: [
                    { ownerId: user.id },
                    {
                        team: {
                            members: {
                                some: {
                                    userId: user.id
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                team: true // Include team info to display badge if needed
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        const syncedBots = await Promise.all(bots.map((bot: any) => syncBotStatus(bot)));

        return NextResponse.json(syncedBots);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, teamId, repoUrl } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Validate team membership if teamId provided
        if (teamId) {
            const teamMember = await prisma.teamMember.findUnique({
                where: {
                    teamId_userId: {
                        teamId,
                        userId: user.id
                    }
                }
            });
            if (!teamMember) {
                return new NextResponse("You are not a member of this team", { status: 403 });
            }
        }

        const bot = await prisma.bot.create({
            data: {
                name,
                description,
                ownerId: user.id,
                teamId: teamId, // Assign team if present
                status: 'offline',
                githubRepo: repoUrl || undefined
            },
        });

        return NextResponse.json(bot);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
