
// Helper to create deployment record
// This file can be imported in route handlers or bot-runner
import { prisma } from '@/lib/prisma';

export async function createDeployment(botId: string, status: 'queued' | 'building' | 'completed' | 'failed' = 'queued') {
    return prisma.deployment.create({
        data: {
            botId,
            status,
            startedAt: new Date()
        }
    });
}

export async function updateDeployment(id: string, status: 'completed' | 'failed', logPath?: string) {
    return prisma.deployment.update({
        where: { id },
        data: {
            status,
            finishedAt: new Date(),
            logPath
        }
    });
}
