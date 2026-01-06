import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

// GET Ticket Details with Messages
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const isStaffMember = [Role.FOUNDER, Role.ADMIN, Role.STAFF].includes(user.role as Role);

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, email: true, role: true } },
                assignedTo: { select: { name: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: { select: { id: true, name: true, role: true } }
                    }
                }
            }
        });

        if (!ticket) return new NextResponse("Ticket not found", { status: 404 });

        // Access Control
        if (!isStaffMember && ticket.authorId !== user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error("Get ticket failed:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST Reply (Message)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const isStaffMember = [Role.FOUNDER, Role.ADMIN, Role.STAFF].includes(user.role as Role);

    try {
        const body = await req.json();
        const { content, newStatus } = body; // newStatus optional for staff closing ticket

        if (!content) return new NextResponse("Message content required", { status: 400 });

        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket) return new NextResponse("Ticket not found", { status: 404 });

        if (!isStaffMember && ticket.authorId !== user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Add Message
        const message = await prisma.ticketMessage.create({
            data: {
                content,
                ticketId: id,
                senderId: user.id
            }
        });

        // Update Ticket Status
        let updateData: any = { updatedAt: new Date() }; // Touch updated time

        if (isStaffMember) {
            // If staff replies, mark ANSWERED (unless specific status sent like CLOSED)
            updateData.status = newStatus || 'ANSWERED';
        } else {
            // If user replies, mark OPEN (re-open if closed, or just user reply)
            updateData.status = 'OPEN';
        }

        await prisma.ticket.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("Reply failed:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
