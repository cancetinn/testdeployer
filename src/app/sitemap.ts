import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://testdeployer.com';

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/community`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ];

    // Dynamic Bot Pages
    let botPages: MetadataRoute.Sitemap = [];
    try {
        const bots = await prisma.publishedBot.findMany({
            select: { slug: true, updatedAt: true },
            take: 1000, // Limit for sitemap
        });

        botPages = bots.map((bot) => ({
            url: `${baseUrl}/community/${bot.slug}`,
            lastModified: bot.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) {
        console.error('Failed to generate sitemap for bots:', e);
    }

    return [...staticPages, ...botPages];
}
