import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/rbac";
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== Role.FOUNDER) return new NextResponse("Forbidden", { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const requestPath = searchParams.get('path') || '/';

        // Prevent directory traversal out of project root
        const normalizedPath = join(process.cwd(), requestPath);
        if (!normalizedPath.startsWith(process.cwd())) {
            return new NextResponse("Invalid path", { status: 400 });
        }

        const entries = await readdir(normalizedPath);
        const response = await Promise.all(entries.map(async (entry) => {
            try {
                const stats = await stat(join(normalizedPath, entry));
                return {
                    name: entry,
                    isDirectory: stats.isDirectory(),
                    size: stats.size,
                    updatedAt: stats.mtime
                };
            } catch (e) {
                return null;
            }
        }));

        return NextResponse.json({
            path: requestPath,
            files: response.filter(Boolean).sort((a: any, b: any) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
            })
        });

    } catch (error) {
        console.error("File Manager Error:", error);
        return new NextResponse("System Error", { status: 500 });
    }
}
