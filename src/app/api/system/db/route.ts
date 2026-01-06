import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== Role.FOUNDER) return new NextResponse("Forbidden", { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const model = searchParams.get('model');

        // Whitelist models for safety
        const models: Record<string, any> = {
            'User': prisma.user,
            'Bot': prisma.bot,
            'BotLog': prisma.botLog,
            'Deployment': prisma.deployment,
            'Ticket': prisma.ticket,
            'TicketMessage': prisma.ticketMessage
        };

        if (!model || !models[model]) {
            return NextResponse.json({
                models: Object.keys(models)
            });
        }

        // Build Search Query (Simple: search 'id' or 'name' or 'content' or 'email')
        let where = {};
        if (search) {
            // Determine searchable fields based on model
            // This is a naive implementation, better to use specific fields per model but this works for generic dashboard
            const searchableFields = ['name', 'email', 'subject', 'content', 'status', 'id'];
            // Prune fields that don't exist in the model is hard dynamically without DMMF, but Prisma ignores unknown fields in OR usually? No it throws.
            // Safer approach: Search only ID if generic, or specific fields if known.
            // Let's just try ID and common fields. If it fails, we catch error.
            if (model === 'User') where = { OR: [{ name: { contains: search } }, { email: { contains: search } }, { id: { contains: search } }] };
            else if (model === 'Bot') where = { OR: [{ name: { contains: search } }, { id: { contains: search } }] };
            else if (model === 'Ticket') where = { OR: [{ subject: { contains: search } }, { id: { contains: search } }] };
            else if (model === 'BotLog') where = { OR: [{ content: { contains: search } }, { botId: { contains: search } }] };
            else where = { id: { contains: search } };
        }

        const data = await models[model].findMany({
            where,
            take: 100,
            orderBy: { id: 'desc' }
        });

        return NextResponse.json({
            model,
            data
        });

    } catch (error) {
        console.error("DB Viewer Error:", error);
        return new NextResponse("System Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== Role.FOUNDER) return new NextResponse("Forbidden", { status: 403 });

    try {
        const body = await req.json();
        const { model, id, data } = body;

        const models: Record<string, any> = {
            'User': prisma.user,
            'Bot': prisma.bot,
            'Deployment': prisma.deployment,
            'Ticket': prisma.ticket
        };

        if (!models[model]) return new NextResponse("Invalid Model", { status: 400 });

        const updated = await models[model].update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error("DB Update Error", e);
        return new NextResponse("Update Failed", { status: 500 });
    }
}
