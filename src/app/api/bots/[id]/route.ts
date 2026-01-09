import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stopBot } from "@/lib/bot-runner";
import fs from 'fs';
import path from 'path';

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
    if (!bot) return new NextResponse("Not found or forbidden", { status: 404 });

    return NextResponse.json(bot);
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
    const { id } = await params;
    const userId = (session.user as any).id;
    const { name, description } = await req.json();

    const bot = await checkBotAccess(id, userId, 'WRITE');
    if (!bot) return new NextResponse("Not found or forbidden", { status: 403 });

    // Update bot
    const updatedBot = await prisma.bot.update({
        where: { id },
        data: { name, description }
    });

    return NextResponse.json(updatedBot);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
    const { id } = await params;
    const userId = (session.user as any).id;

    const bot = await checkBotAccess(id, userId, 'DELETE');
    if (!bot) return new NextResponse("Not found or forbidden", { status: 403 });

    try {
        // 1. Stop Docker Container
        try {
            await stopBot(id);
        } catch (e) {
            console.error("Failed to stop bot during deletion", e);
        }

        // 2. Delete Storage Files
        const botDir = path.join(process.cwd(), 'storage', 'bots', id);
        if (fs.existsSync(botDir)) {
            fs.rmSync(botDir, { recursive: true, force: true });
        }

        // 3. Delete Database Record (Cascading where possible, manual where not)
        await prisma.deployment.deleteMany({ where: { botId: id } });
        await prisma.bot.delete({ where: { id } });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete failed:", error);
        return new NextResponse("Delete failed: " + error.message, { status: 500 });
    }
}
