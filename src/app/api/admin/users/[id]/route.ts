import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });

    // Only Founder can change roles
    if (!currentUser || currentUser.role !== Role.FOUNDER) {
        return new NextResponse("Forbidden: Only Founder can manage roles", { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    // Validate Role
    if (!role || !Object.values(Role).includes(role)) {
        return new NextResponse("Invalid role", { status: 400 });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update role:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
