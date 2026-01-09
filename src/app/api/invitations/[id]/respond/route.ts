import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const { action } = await request.json(); // ACCEPT or DECLINE

        if (!['ACCEPT', 'DECLINE'].includes(action)) {
            return new NextResponse('Invalid action', { status: 400 });
        }

        const invitation = await prisma.teamInvitation.findUnique({
            where: { id }
        });

        if (!invitation) {
            return new NextResponse('Invitation not found', { status: 404 });
        }

        // Verify email matches user
        if (invitation.email !== session.user.email) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        if (invitation.status !== 'PENDING') {
            return new NextResponse('Invitation already processed', { status: 400 });
        }

        if (action === 'ACCEPT') {
            const userId = (session.user as any).id;

            // Transaction: Update invitation status and Add user to team
            await prisma.$transaction([
                prisma.teamInvitation.update({
                    where: { id },
                    data: { status: 'ACCEPTED' }
                }),
                prisma.teamMember.create({
                    data: {
                        teamId: invitation.teamId,
                        userId: userId,
                        role: invitation.role
                    }
                }),
                // Notify inviter
                prisma.notification.create({
                    data: {
                        userId: invitation.inviterId,
                        type: 'SYSTEM',
                        title: 'Invitation Accepted',
                        message: `${session.user.name || session.user.email} accepted your invitation to join the team.`
                    }
                })
            ]);
        } else {
            // DECLINE
            await prisma.teamInvitation.update({
                where: { id },
                data: { status: 'DECLINED' }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Respond invitation error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
