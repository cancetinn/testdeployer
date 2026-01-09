import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBotLogs, clearBotLogs } from "@/lib/bot-runner";
import { checkBotAccess } from "@/lib/access";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const userId = (session.user as any).id;

    const bot = await checkBotAccess(id, userId, 'READ');

    if (!bot) {
        return new NextResponse("Not found or forbidden", { status: 404 });
    }

    try {
        const logs = await getBotLogs(id);
        return NextResponse.json({ logs });
    } catch (error) {
        return new NextResponse("Error reading logs", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });

    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        await clearBotLogs(id);
        return new NextResponse("Logs cleared", { status: 200 });
    } catch (e) {
        return new NextResponse("Failed to clear logs", { status: 500 });
    }
}
