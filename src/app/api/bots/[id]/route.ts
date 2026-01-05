import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stopBot } from "@/lib/bot-runner";
import fs from 'fs';
import path from 'path';

export async function GET(
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
        return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(bot);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    // Verify ownership
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });

    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Not found or forbidden", { status: 404 });
    }

    try {
        // 1. Stop Docker Container
        try {
            await stopBot(id);
        } catch (e) {
            console.error("Failed to stop bot during deletion (might be already stopped)", e);
        }

        // 2. Delete Storage Files
        const botDir = path.join(process.cwd(), 'storage', 'bots', id);
        if (fs.existsSync(botDir)) {
            fs.rmSync(botDir, { recursive: true, force: true });
        }

        // 3. Delete Database Record
        // Note: If relations don't have cascade, we might need to delete them manually.
        // EnvVars have cascade. Deployments don't.
        // Let's delete related deployments manually to be safe.
        await prisma.deployment.deleteMany({
            where: { botId: id }
        });

        // Also delete any other related records if strictly needed, but simple DELETE on bot should work if EnvVar is cascaded.

        await prisma.bot.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete failed:", error);
        return new NextResponse("Delete failed: " + error.message, { status: 500 });
    }
}
