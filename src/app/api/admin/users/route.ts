import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isFounder, Role } from "@/lib/rbac";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Only Founder, Admin and Staff can see users
    if (!currentUser || ![Role.FOUNDER, Role.ADMIN, Role.STAFF].includes(currentUser.role as Role)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { bots: true, tickets: true }
                }
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
