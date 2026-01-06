import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public/uploads/tickets', id);
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const filepath = join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Create Message with Image Link
        const publicUrl = `/uploads/tickets/${id}/${filename}`;

        // Save message to DB
        // We'll wrap the image in markdown syntax for rendering
        const messageContent = `![Attachment](${publicUrl})`;

        const message = await prisma.ticketMessage.create({
            data: {
                content: messageContent,
                ticketId: id,
                senderId: user.id
            }
        });

        // Touch ticket updated
        await prisma.ticket.update({
            where: { id },
            data: { updatedAt: new Date(), status: 'OPEN' } // Should logic dependent on role? Keeping simple for now
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("Upload failed:", error);
        return new NextResponse("Internal API Error", { status: 500 });
    }
}
