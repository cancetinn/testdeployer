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

    const envs = await prisma.environmentVariable.findMany({
        where: { botId: id },
        orderBy: { key: 'asc' }
    });

    return NextResponse.json(envs);
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { key, value } = body;

    if (!key || !value) return new NextResponse("Missing key or value", { status: 400 });

    // Ownership Check
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });
    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Upsert
    const env = await prisma.environmentVariable.upsert({
        where: {
            botId_key: {
                botId: id,
                key: key
            }
        },
        update: { value },
        create: {
            botId: id,
            key,
            value
        }
    });

    return NextResponse.json(env);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) return new NextResponse("Missing key", { status: 400 });

    // Ownership Check
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: { owner: true }
    });
    if (!bot || bot.owner.email !== session.user.email) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.environmentVariable.delete({
        where: {
            botId_key: {
                botId: id,
                key: key
            }
        }
    });

    return NextResponse.json({ success: true });
}
