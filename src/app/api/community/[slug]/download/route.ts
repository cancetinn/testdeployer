import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { slug } = await params;

        const bot = await prisma.publishedBot.findUnique({
            where: { slug }
        });

        if (!bot || !bot.isPublic) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Check if file exists
        const filePath = bot.filesSnapshot;
        try {
            await fs.access(filePath);
        } catch {
            return new NextResponse('File not found', { status: 404 });
        }

        // Increment download count
        await prisma.publishedBot.update({
            where: { id: bot.id },
            data: { downloads: { increment: 1 } }
        });

        // Read and return file
        const fileBuffer = await fs.readFile(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${bot.slug}-${bot.version}.zip"`,
                'Content-Length': fileBuffer.length.toString()
            }
        });
    } catch (error) {
        console.error('Error downloading bot:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
