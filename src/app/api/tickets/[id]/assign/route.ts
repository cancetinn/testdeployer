import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Only Staff can assign/reassign
    if (!user || ![Role.FOUNDER, Role.ADMIN, Role.STAFF].includes(user.role as Role)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const body = await req.json();
        const { assignedToId } = body;

        await prisma.ticket.update({
            where: { id },
            data: { assignedToId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Assign failed:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
