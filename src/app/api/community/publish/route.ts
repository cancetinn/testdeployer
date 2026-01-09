import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateBotForPublishing, createSanitizedSnapshot, generateSlug } from '@/lib/community/sanitizer';
import path from 'path';

const BOTS_DIR = process.env.BOTS_DIR || './storage/bots';
const COMMUNITY_DIR = process.env.COMMUNITY_DIR || './public';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const { botId, name, description, readme, category, tags, version } = body;

        // Validate required fields
        if (!botId || !name || !description || !category) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        // Get the bot and verify ownership
        const bot = await prisma.bot.findFirst({
            where: {
                id: botId,
                ownerId: userId
            }
        });

        if (!bot) {
            return new NextResponse('Bot not found or not owned by you', { status: 404 });
        }

        // Generate slug
        const baseSlug = generateSlug(name);
        let slug = baseSlug;
        let counter = 1;

        // Ensure unique slug
        while (await prisma.publishedBot.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Validate bot files for secrets
        const botPath = path.join(BOTS_DIR, bot.id);
        const validation = await validateBotForPublishing(botPath);

        if (!validation.valid) {
            return NextResponse.json({
                error: 'Secrets detected in bot files',
                secrets: validation.secrets
            }, { status: 400 });
        }

        // Create sanitized snapshot
        const snapshotPath = await createSanitizedSnapshot(
            botPath,
            COMMUNITY_DIR,
            slug,
            version || '1.0.0'
        );

        // Create published bot record
        const publishedBot = await prisma.publishedBot.create({
            data: {
                name,
                slug,
                description,
                readme: readme || '',
                category,
                tags: Array.isArray(tags) ? tags.join(',') : tags || '',
                version: version || '1.0.0',
                filesSnapshot: snapshotPath,
                sourceBotId: botId,
                authorId: userId,
                status: 'approved', // Auto-approve for now
                isPublic: true
            }
        });

        return NextResponse.json(publishedBot);
    } catch (error) {
        console.error('Error publishing bot:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// Get publishing validation preview
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const botId = searchParams.get('botId');

        if (!botId) {
            return new NextResponse('botId required', { status: 400 });
        }

        // Verify ownership
        const bot = await prisma.bot.findFirst({
            where: {
                id: botId,
                ownerId: userId
            }
        });

        if (!bot) {
            return new NextResponse('Bot not found', { status: 404 });
        }

        // Validate files
        const botPath = path.join(BOTS_DIR, botId);
        const validation = await validateBotForPublishing(botPath);

        return NextResponse.json({
            bot: { id: bot.id, name: bot.name },
            validation
        });
    } catch (error) {
        console.error('Error validating bot:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

