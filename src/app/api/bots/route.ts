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
        const bots = await prisma.bot.findMany({
            where: {
                owner: {
                    email: session.user.email,
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        const syncedBots = await Promise.all(bots.map(bot => syncBotStatus(bot)));

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
        const { name, description } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const bot = await prisma.bot.create({
            data: {
                name,
                description,
                ownerId: user.id,
                status: 'offline', // Default status
            },
        });

        return NextResponse.json(bot);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
