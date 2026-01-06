import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export enum Role {
    FOUNDER = 'FOUNDER',
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
    USER = 'USER'
}

export async function getCurrentUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    return user;
}

export async function hasRole(allowedRoles: Role[]) {
    const user = await getCurrentUser();
    if (!user) return false;
    return allowedRoles.includes(user.role as Role);
}

export async function isFounder() {
    return hasRole([Role.FOUNDER]);
}

export async function isAdmin() {
    // Founder has all admin privileges
    return hasRole([Role.FOUNDER, Role.ADMIN]);
}

export async function isStaff() {
    // Admin and Founder have staff privileges
    return hasRole([Role.FOUNDER, Role.ADMIN, Role.STAFF]);
}
