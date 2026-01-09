import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { teamId } = await params;
        const inviterId = (session.user as any).id;
        const { email } = await request.json();

        if (!email) {
            return new NextResponse('Email is required', { status: 400 });
        }

        // Check permissions (must be team member)
        const membership = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: inviterId } }
        });

        if (!membership) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Check if already member
        const existingMember = await prisma.teamMember.findFirst({
            where: { teamId, user: { email } }
        });

        if (existingMember) {
            return new NextResponse('User is already a member', { status: 400 });
        }

        // Check if invitation already exists
        const existingInvite = await prisma.teamInvitation.findUnique({
            where: { teamId_email: { teamId, email } }
        });

        if (existingInvite) {
            return new NextResponse('Invitation already sent', { status: 400 });
        }

        // Create Invitation
        const invitation = await prisma.teamInvitation.create({
            data: {
                teamId,
                email,
                inviterId,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        });

        // Create Notification for the user if they exist in the system
        const invitedUser = await prisma.user.findUnique({ where: { email } });
        if (invitedUser) {
            await prisma.notification.create({
                data: {
                    userId: invitedUser.id,
                    type: 'TEAM_INVITE',
                    title: 'Team Invitation',
                    message: `You have been invited to join team`, // Ideally fetch team Name
                    data: JSON.stringify({ invitationId: invitation.id, teamId })
                }
            });
        }

        return NextResponse.json(invitation);

    } catch (error) {
        console.error('Invite error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
