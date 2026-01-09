import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { accounts: true }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Delete the GitHub account connection
        await prisma.account.deleteMany({
            where: {
                userId: user.id,
                provider: 'github'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to disconnect GitHub", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
