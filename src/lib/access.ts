import { prisma } from "@/lib/prisma";

export async function checkBotAccess(botId: string, userId: string, requiredAction: 'READ' | 'WRITE' | 'DELETE') {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: {
            team: {
                include: {
                    members: true
                }
            }
        }
    });

    if (!bot) return null;

    // 1. Check Personal Ownership
    if (bot.ownerId === userId) return bot;

    // 2. Check Team Membership
    if (bot.teamId && bot.team) {
        const member = bot.team.members.find((m: any) => m.userId === userId);
        if (member) {
            // Check roles based on action
            if (requiredAction === 'READ') return bot; // All members can read

            if (requiredAction === 'WRITE') {
                if (['OWNER', 'ADMIN', 'MEMBER'].includes(member.role)) return bot;
            }

            if (requiredAction === 'DELETE') {
                if (['OWNER', 'ADMIN'].includes(member.role)) return bot;
            }
        }
    }

    return null; // Access denied
}
