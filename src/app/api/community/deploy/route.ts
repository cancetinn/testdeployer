import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BOTS_DIR = process.env.BOTS_DIR || './storage/bots';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { slug, name } = await request.json();

        if (!slug) {
            return new NextResponse('Slug required', { status: 400 });
        }

        // Get published bot
        const publishedBot = await prisma.publishedBot.findUnique({
            where: { slug }
        });

        if (!publishedBot || !publishedBot.isPublic) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Check if snapshot exists
        try {
            await fs.access(publishedBot.filesSnapshot);
        } catch {
            return new NextResponse('Bot files not available', { status: 404 });
        }

        // Create new bot for user
        const newBot = await prisma.bot.create({
            data: {
                name: name || `${publishedBot.name} (copy)`,
                description: publishedBot.description,
                ownerId: userId
            }
        });

        // Create bot directory
        const newBotPath = path.join(BOTS_DIR, newBot.id);
        await fs.mkdir(newBotPath, { recursive: true });

        // Extract zip to new bot directory
        await execAsync(`unzip -o "${publishedBot.filesSnapshot}" -d "${newBotPath}"`);

        // Create placeholder .env file
        await fs.writeFile(
            path.join(newBotPath, '.env.example'),
            '# Add your environment variables here\n# DISCORD_TOKEN=your_token_here\n'
        );

        // Increment download count
        await prisma.publishedBot.update({
            where: { id: publishedBot.id },
            data: { downloads: { increment: 1 } }
        });

        return NextResponse.json({
            success: true,
            bot: newBot,
            message: 'Bot deployed successfully! Configure your environment variables to get started.'
        });
    } catch (error) {
        console.error('Error deploying community bot:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

