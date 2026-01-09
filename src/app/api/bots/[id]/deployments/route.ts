import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const deployments = await prisma.deployment.findMany({
        where: { botId: id },
        orderBy: { startedAt: 'desc' },
        take: 50
    });

    return NextResponse.json(deployments);
}
