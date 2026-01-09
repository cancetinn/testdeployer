import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { teamId } = await params;
        const userId = (session.user as any).id;

        // Check if user is a member of the team
        const userMembership = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId
                }
            }
        });

        if (!userMembership) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Fetch members with user details
        const members = await prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                        // image field removed as it does not exist in schema
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Fetch pending invitations (only if admin/owner?) -> Let's allow members to see pending invites too for transparency, or restrict. 
        // For now, allow viewing.
        const invitations = await prisma.teamInvitation.findMany({
            where: {
                teamId,
                status: 'PENDING'
            },
            include: {
                inviter: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            members: members.map((m: any) => ({
                id: m.id,
                userId: m.userId,
                role: m.role,
                user: m.user,
                createdAt: m.createdAt
            })),
            invitations
        });

    } catch (error) {
        console.error('Get team members error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
