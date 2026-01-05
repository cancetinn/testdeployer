import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });

    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Not found or forbidden", { status: 404 });
    }

    const deployments = await prisma.deployment.findMany({
        where: { botId: id },
        orderBy: { startedAt: 'desc' },
        take: 50
    });

    return NextResponse.json(deployments);
}
