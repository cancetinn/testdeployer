import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff, Role } from "@/lib/rbac";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');

    const isStaffMember = [Role.FOUNDER, Role.ADMIN, Role.STAFF].includes(user.role as Role);

    try {
        const tickets = await prisma.ticket.findMany({
            where: isStaffMember && scope === 'all' ? {} : { authorId: user.id }, // Staff + scope=all sees everything, else user sees own
            orderBy: { updatedAt: 'desc' },
            include: {
                author: {
                    select: { name: true, email: true, role: true }
                },
                assignedTo: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Failed to fetch tickets:", error);
        return new NextResponse("Internal API Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    try {
        const body = await req.json();
        const { subject, category, description, priority } = body;

        if (!subject || !description) {
            return new NextResponse("Subject and Description are required", { status: 400 });
        }

        // Create Ticket
        const ticket = await prisma.ticket.create({
            data: {
                subject,
                category: category || 'other',
                priority: priority || 'MEDIUM',
                status: 'OPEN',
                authorId: user.id,
                // Create initial message
                messages: {
                    create: {
                        content: description,
                        senderId: user.id
                    }
                }
            }
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Failed to create ticket:", error);
        return new NextResponse("Internal API Error", { status: 500 });
    }
}
