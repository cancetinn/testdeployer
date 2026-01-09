import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ teamId: string, userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { teamId, userId: targetUserId } = await params;
        const requesterUserId = (session.user as any).id;
        const { role } = await request.json();

        // Validate allowed roles
        const allowedRoles = ['ADMIN', 'MEMBER', 'VIEWER'];
        if (!allowedRoles.includes(role)) {
            return new NextResponse('Invalid role', { status: 400 });
        }

        // Check permissions of requester
        const requesterMembership = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: requesterUserId } }
        });

        if (!requesterMembership || !['OWNER', 'ADMIN'].includes(requesterMembership.role)) {
            return new NextResponse('Forbidden: Insufficient permissions', { status: 403 });
        }

        // Prevent modifying OWNER role or self
        const targetMembership = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: targetUserId } }
        });

        if (!targetMembership) {
            return new NextResponse('Member not found', { status: 404 });
        }

        if (targetMembership.role === 'OWNER') {
            return new NextResponse('Cannot change role of the Team Owner', { status: 403 });
        }

        if (requesterUserId === targetUserId) {
            return new NextResponse('Cannot change your own role', { status: 400 });
        }

        // Apply update
        await prisma.teamMember.update({
            where: { teamId_userId: { teamId, userId: targetUserId } },
            data: { role }
        });

        return NextResponse.json({ success: true, role });

    } catch (error) {
        console.error('Update role error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ teamId: string, userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { teamId, userId: targetUserId } = await params;
        const requesterUserId = (session.user as any).id;

        // Check permissions
        const requesterMembership = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: requesterUserId } }
        });

        if (!requesterMembership || !['OWNER', 'ADMIN'].includes(requesterMembership.role)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Prevent removing OWNER
        const targetMembership = await prisma.teamMember.findUnique({
            where: { teamId_userId: { teamId, userId: targetUserId } }
        });

        if (targetMembership?.role === 'OWNER') {
            return new NextResponse('Cannot remove Team Owner', { status: 403 });
        }

        // Remove member
        await prisma.teamMember.delete({
            where: { teamId_userId: { teamId, userId: targetUserId } }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
