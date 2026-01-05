import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startBot, stopBot } from "@/lib/bot-runner";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });

    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Not found or forbidden", { status: 404 });
    }

    try {
        if (action === 'start') {
            await startBot(id);
        } else if (action === 'stop') {
            await stopBot(id);
        } else if (action === 'restart') {
            await stopBot(id);
            await new Promise(r => setTimeout(r, 1000));
            await startBot(id);
        } else {
            return new NextResponse("Invalid action", { status: 400 });
        }

        // Return updated bot
        const updatedBot = await prisma.bot.findUnique({ where: { id } });
        return NextResponse.json(updatedBot);

    } catch (error: any) {
        console.error(error);
        return new NextResponse(error.message || "Execution failed", { status: 500 });
    }
}
